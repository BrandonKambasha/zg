import axios from "../axios"
import type { Category } from "../../Types"

export const getCategories = async (): Promise<Category[]> => {
  try {
    // Use a stable cache-busting parameter
    const response = await axios.get(`/categories?v=${Date.now()}`, {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Expires: "0",
      },
    })

    if (!response.data || !Array.isArray(response.data)) {
      console.error("Invalid categories data format:", response.data)
      return []
    }

    // Log each category to help with debugging
    response.data.forEach((category, index) => {
      console.log(`Category ${index + 1}:`, category.id, category.name, category.image_url)
    })

    return response.data
  } catch (error: any) {
    console.error("Error fetching categories:", error)
    return [] // Return empty array instead of throwing error
  }
}

export const getCategoryById = async (id: string): Promise<Category> => {
  try {
    const response = await axios.get(`/categories/${id}?v=${Date.now()}`, {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
    return response.data
  } catch (error: any) {
    console.error(`Error fetching category ${id}:`, error)
    throw new Error(error.response?.data?.message || "Failed to fetch category")
  }
}

export const getCategoryWithProducts = async (id: string): Promise<{ category: Category; products: any[] }> => {
  try {
    const response = await axios.get(`/categories/${id}/products?v=${Date.now()}`, {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
    return response.data
  } catch (error: any) {
    console.error(`Error fetching category ${id} with products:`, error)
    throw new Error(error.response?.data?.message || "Failed to fetch category with products")
  }
}

export const createCategory = async (categoryData: FormData): Promise<Category> => {
  try {
    const response = await axios.post("/categories", categoryData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create category")
  }
}

export const updateCategory = async (id: string, categoryData: FormData): Promise<Category> => {
  try {
    const response = await axios.post(`/categories/${id}`, categoryData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update category")
  }
}

export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await axios.delete(`/categories/${id}`)
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete category")
  }
}

