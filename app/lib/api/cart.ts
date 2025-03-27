import axios from "../axios"
import type { Product, Hamper } from "../../Types"

// Updated to support both products and hampers
interface CartItem {
  product: Product | Hamper
  quantity: number
  type: "product" | "hamper"
}

interface CartResponse {
  items: CartItem[]
}

/**
 * Get the current user's cart from the server
 */
export const getCart = async (): Promise<CartItem[]> => {
  try {
    // This endpoint should return the cart for the authenticated user
    const response = await axios.get("/cart")

    // Make sure we're returning the items array, not the whole response
    return response.data.items || []
  } catch (error: any) {
    // If unauthorized, return empty array
    if (error.response?.status === 401) {
      console.warn("Unauthorized when fetching cart, returning empty array")
      return []
    }

    console.error("Cart fetch error:", error)
    // Return empty array instead of throwing to prevent app crashes
    return []
  }
}

/**
 * Update the user's cart on the server
 */
export const updateCart = async (items: CartItem[]): Promise<void> => {
  try {
    // This endpoint should update the cart for the authenticated user
    await axios.post("/cart", { items })
  } catch (error: any) {
    // If unauthorized, log specific message
    if (error.response?.status === 401) {
      console.warn("Unauthorized when updating cart, user may need to log in again")
    } else {
      console.error("Cart update error:", error)
    }
    // We'll log the error but not throw to prevent app crashes
  }
}

/**
 * Clear the user's cart on the server
 */
export const clearCart = async (): Promise<void> => {
  try {
    // Use the dedicated endpoint to clear the cart
    await axios.delete("/cart")
  } catch (error: any) {
    // If unauthorized, log specific message
    if (error.response?.status === 401) {
      console.warn("Unauthorized when clearing cart, user may need to log in again")
    } else {
      console.error("Clear cart error:", error)
    }

    // Fallback: try to clear by setting empty array
    try {
      await axios.post("/cart", { items: [] })
    } catch (innerError) {
      console.error("Fallback clear cart error:", innerError)
    }
  }
}

