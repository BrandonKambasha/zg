import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.0.123:8000"

export type SearchResult = {
  id: number
  name: string
  type: "product" | "category" | "hamper"
  image_url?: string
  price?: number
  description?: string
}

export async function searchItems(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) {
    return []
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/api/search`, {
      params: { query },
    })
    return response.data
  } catch (error) {
    console.error("Error searching items:", error)
    return []
  }
}

