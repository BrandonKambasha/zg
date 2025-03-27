import axios from "axios"
import { safeStorage, isTokenExpired } from "../auth-utils"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://zg-backend-production-84b0.up.railway.app"

// Helper function to get the auth token
const getAuthHeader = () => {
  const token = safeStorage.getItem("token")
  if (!token || isTokenExpired(token)) {
    throw new Error("Authentication required")
  }

  return {
    Authorization: `Bearer ${token}`,
  }
}

// Get all wishlist items
export async function getWishlist() {
  try {
    const headers = getAuthHeader()

    const response = await axios.get(`${API_BASE_URL}/api/wishlist`, {
      headers,
    })
    return response.data
  } catch (error: any) {
    if (error.message === "Authentication required") {
      console.warn("Authentication required to fetch wishlist")
      return []
    }

    console.error("Error fetching wishlist:", error)
    return []
  }
}

// Add an item to the wishlist
export async function addToWishlist(itemId: number, type: "product" | "hamper") {
  try {
    const headers = getAuthHeader()

    const response = await axios.post(
      `${API_BASE_URL}/api/wishlist`,
      {
        wishlistable_id: itemId,
        wishlistable_type: type,
      },
      {
        headers,
      },
    )
    return response.data
  } catch (error: any) {
    if (error.message === "Authentication required") {
      throw new Error("Please log in to add items to your wishlist")
    }

    console.error("Error adding to wishlist:", error)
    throw error
  }
}

// Remove an item from the wishlist
export async function removeFromWishlist(wishlistItemId: number) {
  try {
    const headers = getAuthHeader()

    const response = await axios.delete(`${API_BASE_URL}/api/wishlist/${wishlistItemId}`, {
      headers,
    })
    return response.data
  } catch (error: any) {
    if (error.message === "Authentication required") {
      throw new Error("Please log in to manage your wishlist")
    }

    console.error("Error removing from wishlist:", error)
    throw error
  }
}

