import axios from "../axios"
import type { Order } from "../../Types"
import { safeStorage, isTokenExpired, isAuthRequiredForEndpoint } from "../auth-utils"

interface OrdersParams {
  page?: number
  limit?: number
}

// Check auth before making requests that require it
const checkAuth = (endpoint: string) => {
  // Only check auth for endpoints that require it
  if (!isAuthRequiredForEndpoint(endpoint)) {
    return
  }

  const token = safeStorage.getItem("token")
  if (!token || isTokenExpired(token)) {
    throw new Error("Authentication required")
  }
}

export const getOrders = async (params?: OrdersParams): Promise<Order[]> => {
  try {
    const endpoint = "/my-orders"
    checkAuth(endpoint)

    let url = endpoint
    const queryParams: string[] = []

    if (params) {
      if (params.page) {
        queryParams.push(`page=${params.page}`)
      }

      if (params.limit) {
        queryParams.push(`limit=${params.limit}`)
      }
    }

    if (queryParams.length > 0) {
      url += `?${queryParams.join("&")}`
    }

    const response = await axios.get(url)
    return response.data
  } catch (error: any) {
    if (error.message === "Authentication required") {
      console.warn("Authentication required to fetch orders")
      return []
    }

    console.error("Failed to fetch orders:", error)
    return []
  }
}

export const getMyOrders = getOrders // Alias for clarity

export const getLatestOrder = async (): Promise<Order | null> => {
  try {
    const endpoint = "/my-orders"
    checkAuth(endpoint)

    console.log("Fetching latest order...")
    // Get all orders for the current user with orderItems and product details
    const orders = await getMyOrders()
    console.log("Orders received:", orders)

    // Sort by created_at in descending order and take the first one
    if (orders && orders.length > 0) {
      const latestOrder = orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

      console.log("Latest order:", latestOrder)
      return latestOrder
    }

    return null
  } catch (error: any) {
    if (error.message === "Authentication required") {
      console.warn("Authentication required to fetch latest order")
      return null
    }

    console.error("Failed to fetch latest order:", error)
    return null
  }
}

export const getOrderById = async (id: string): Promise<Order> => {
  try {
    const endpoint = `/orders/${id}`
    checkAuth(endpoint)

    const response = await axios.get(endpoint)
    return response.data
  } catch (error: any) {
    if (error.message === "Authentication required") {
      throw new Error("Please log in to view order details")
    }

    throw new Error(error.response?.data?.message || "Failed to fetch order")
  }
}

export const createOrder = async (orderData: any): Promise<Order> => {
  try {
    const endpoint = "/orders"
    checkAuth(endpoint)

    console.log("Creating order with data:", orderData)

    // Check if items are already transformed (have hamper_id or product_id)
    const itemsAlreadyTransformed = orderData.items.some(
      (item: any) => item.hamper_id !== undefined || item.product_id !== undefined,
    )

    let transformedItems

    if (itemsAlreadyTransformed) {
      // Items are already transformed, use them as is
      console.log("Items are already transformed, using as is")
      transformedItems = orderData.items
    } else {
      // Transform the items array to include either product_id or hamper_id
      console.log("Transforming items")
      transformedItems = orderData.items.map((item: any) => {
        // Log the item for debugging
        console.log("Processing item for order:", item)

        // Ensure the item and product exist
        if (!item || !item.product) {
          console.error("Invalid item found:", item)
          throw new Error("Invalid item in cart. Please try removing and re-adding items to your cart.")
        }

        // Check if this is a hamper by looking at the type property
        if (item.type === "hamper") {
          console.log("This is a hamper item with ID:", item.product.id)
          return {
            hamper_id: item.product.id, // Use product.id for hamper_id
            quantity: item.quantity,
            type: "hamper", // Include type for clarity
          }
        } else {
          console.log("This is a product item with ID:", item.product.id)
          return {
            product_id: item.product.id, // Use product.id for product_id
            quantity: item.quantity,
            type: "product", // Include type for clarity
          }
        }
      })
    }

    // Create a new order data object with the transformed items
    const transformedOrderData = {
      ...orderData,
      items: transformedItems,
    }

    console.log("Final order data:", transformedOrderData)

    const response = await axios.post(endpoint, transformedOrderData)
    console.log("Order created successfully:", response.data)
    return response.data
  } catch (error: any) {
    if (error.message === "Authentication required") {
      throw new Error("Please log in to create an order")
    }

    console.error("Order creation error:", error)
    if (error.response) {
      console.error("Response data:", error.response.data)
      console.error("Response status:", error.response.status)
      throw new Error(error.response.data?.message || error.response.data?.error || "Failed to create order")
    } else if (error.request) {
      console.error("No response received:", error.request)
      throw new Error("No response received from server")
    } else {
      console.error("Error message:", error.message)
      throw new Error(error.message || "Failed to create order")
    }
  }
}

// Add cancel order function
export const cancelOrder = async (orderId: string): Promise<Order> => {
  try {
    const endpoint = `/orders/${orderId}/cancel`
    checkAuth(endpoint)

    console.log("Cancelling order:", orderId)
    const response = await axios.post(endpoint)
    console.log("Order cancelled successfully:", response.data)
    return response.data
  } catch (error: any) {
    if (error.message === "Authentication required") {
      throw new Error("Please log in to cancel orders")
    }

    console.error("Order cancellation error:", error)
    throw new Error(error.response?.data?.message || "Failed to cancel order")
  }
}

// Admin functions
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const endpoint = "/orders"
    checkAuth(endpoint)

    const response = await axios.get(endpoint)
    return response.data
  } catch (error: any) {
    if (error.message === "Authentication required") {
      throw new Error("Please log in as admin to view all orders")
    }

    throw new Error(error.response?.data?.message || "Failed to fetch all orders")
  }
}

export const updateOrderStatus = async (orderId: string, status: string): Promise<Order> => {
  try {
    const endpoint = `/orders/${orderId}/status`
    checkAuth(endpoint)

    const response = await axios.put(endpoint, { status })
    return response.data
  } catch (error: any) {
    if (error.message === "Authentication required") {
      throw new Error("Please log in as admin to update order status")
    }

    throw new Error(error.response?.data?.message || "Failed to update order status")
  }
}

