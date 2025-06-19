import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://zg-backend-production-84b0.up.railway.app"
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.0.123:8000"

// Helper function to get the auth token
const getAuthHeader = () => {
  const token = localStorage.getItem("token")
  return {
    Authorization: `Bearer ${token}`,
  }
}

// Get all wishlist items
export async function getWishlist() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/wishlist`, {
      headers: getAuthHeader(),
    })
    return response.data
  } catch (error) {
    console.error("Error fetching wishlist:", error)
    throw error
  }
}

// Add an item to the wishlist
export async function addToWishlist(itemId: number, type: "product" | "hamper") {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/wishlist`,
      {
        wishlistable_id: itemId,
        wishlistable_type: type,
      },
      {
        headers: getAuthHeader(),
      },
    )
    return response.data
  } catch (error) {
    console.error("Error adding to wishlist:", error)
    throw error
  }
}

// Remove an item from the wishlist
export async function removeFromWishlist(wishlistItemId: number) {
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/wishlist/${wishlistItemId}`, {
      headers: getAuthHeader(),
    })
    return response.data
  } catch (error) {
    console.error("Error removing from wishlist:", error)
    throw error
  }
}

