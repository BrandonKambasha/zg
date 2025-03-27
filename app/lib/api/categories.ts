import axios from "../axios"
import type { Category } from "../../Types"
import { safeStorage, isTokenExpired } from "../auth-utils"

const checkAuth = () => {
  const token = safeStorage.getItem("token")
  if (!token || isTokenExpired(token)) {
    throw new Error("Authentication required")
  }
}
// Helper function to upload a file to Vercel Blob via our API route
async function uploadToBlob(file: File, folder = "categories"): Promise<string> {
  try {
    console.log(`Uploading category image to Blob:`, file.name, file.type, file.size)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", folder)

    const response = await fetch("/lib/api/upload-blob", {
      method: "POST",
      body: formData,
    })

    // Check if the response is OK
    if (!response.ok) {
      // Try to parse the response as JSON
      let errorData
      const contentType = response.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        errorData = await response.json()
        throw new Error(errorData.error || `Upload failed with status: ${response.status}`)
      } else {
        // If it's not JSON, get the text
        const errorText = await response.text()
        console.error("Non-JSON error response:", errorText.substring(0, 500)) // Log first 500 chars
        throw new Error(`Upload failed with status: ${response.status}. Server returned non-JSON response.`)
      }
    }

    const data = await response.json()
    console.log(`Successfully uploaded category image to Blob:`, data.url)
    return data.url
  } catch (error: any) {
    console.error(`Error uploading category image to Blob:`, error)
    throw new Error(`Failed to upload file: ${error.message}`)
  }
}

export const getCategories = async (): Promise<Category[]> => {
  try {
    checkAuth()

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
    checkAuth()

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
    checkAuth()

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
    console.log("Starting category creation with image")

    // Extract image from FormData
    const imageFile = categoryData.get("image") as File | null

    // Create a new FormData object without the image file
    const newFormData = new FormData()

    // Copy all non-image entries from the original FormData
    for (const [key, value] of Array.from(categoryData.entries())) {
      if (key !== "image") {
        newFormData.append(key, value)
      }
    }

    // Upload image to Vercel Blob if it exists
    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      console.log(`Uploading category image to Blob:`, imageFile.name, imageFile.type, imageFile.size)

      try {
        // Upload via our API route
        const imageUrl = await uploadToBlob(imageFile, "categories")

        // Add the Blob URL to the new FormData
        newFormData.append("image_url", imageUrl)
      } catch (uploadError: any) {
        console.error(`Error uploading category image to Blob:`, uploadError)
        throw new Error(`Failed to upload image: ${uploadError.message}`)
      }
    }

    // Log the final FormData before sending to backend
    console.log("Final FormData entries for category creation:")
    for (const pair of newFormData.entries()) {
      console.log(pair[0], pair[1])
    }

    // Send to backend
    const response = await axios.post("/categories", newFormData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    console.log("Category created successfully:", response.data)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create category")
  }
}

export const updateCategory = async (id: string, categoryData: FormData): Promise<Category> => {
  try {
    console.log("Updating category with ID:", id)

    // Log the initial form data
    console.log("Initial FormData entries for category update:")
    for (const pair of categoryData.entries()) {
      console.log(pair[0], pair[1])
    }

    // Extract image from FormData
    const imageFile = categoryData.get("image") as File | null
    const keepExistingImage = categoryData.get("keep_existing_image") === "1"
    const removeImage = categoryData.get("remove_image") === "1"

    // Create a new FormData object without the image file
    const newFormData = new FormData()

    // Copy all non-image entries from the original FormData
    for (const [key, value] of Array.from(categoryData.entries())) {
      if (key !== "image") {
        newFormData.append(key, value)
      }
    }

    // Upload image to Vercel Blob if it exists
    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      console.log(`Uploading new category image to Blob:`, imageFile.name, imageFile.type, imageFile.size)

      try {
        // Upload via our API route
        const imageUrl = await uploadToBlob(imageFile, `categories/${id}`)

        // Add the Blob URL to the new FormData
        newFormData.append("image_url", imageUrl)
      } catch (uploadError: any) {
        console.error(`Error uploading category image to Blob:`, uploadError)
        throw new Error(`Failed to upload image: ${uploadError.message}`)
      }
    }

    // Log the final FormData before sending to backend
    console.log("Final FormData entries for category update:")
    for (const pair of newFormData.entries()) {
      console.log(pair[0], pair[1])
    }

    // Send to backend
    const response = await axios.post(`/categories/${id}`, newFormData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    console.log("Category updated successfully:", response.data)
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

