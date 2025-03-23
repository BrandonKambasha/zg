import axios from "../axios"
import type { Order } from "../../Types"

interface OrdersParams {
  page?: number
  limit?: number
}

export const getOrders = async (params?: OrdersParams): Promise<Order[]> => {
  try {
    let url = "/my-orders"
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
    console.error("Failed to fetch orders:", error)
    throw new Error(error.response?.data?.message || "Failed to fetch orders")
  }
}

export const getMyOrders = getOrders // Alias for clarity

export const getLatestOrder = async (): Promise<Order | null> => {
  try {
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
  } catch (error) {
    console.error("Failed to fetch latest order:", error)
    return null
  }
}

export const getOrderById = async (id: string): Promise<Order> => {
  try {
    const response = await axios.get(`/orders/${id}`)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch order")
  }
}

export const createOrder = async (orderData: any): Promise<Order> => {
  try {
    console.log("Creating order with data:", orderData)
    const response = await axios.post("/orders", orderData)
    console.log("Order created successfully:", response.data)
    return response.data
  } catch (error: any) {
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
    console.log("Cancelling order:", orderId)
    const response = await axios.post(`/orders/${orderId}/cancel`)
    console.log("Order cancelled successfully:", response.data)
    return response.data
  } catch (error: any) {
    console.error("Order cancellation error:", error)
    throw new Error(error.response?.data?.message || "Failed to cancel order")
  }
}

// Admin functions
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const response = await axios.get("/orders")
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch all orders")
  }
}

export const updateOrderStatus = async (orderId: string, status: string): Promise<Order> => {
  try {
    const response = await axios.put(`/orders/${orderId}/status`, { status })
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update order status")
  }
}