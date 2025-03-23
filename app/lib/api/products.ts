import type { Product } from "../../Types"
import axios from "../axios"

interface GetProductsParams {
  categoryId?: number
  query?: string
  minPrice?: number
  maxPrice?: number
  rating?: number
  page?: number
  limit?: number
  sort?: string
}

export const getProducts = async (params?: GetProductsParams): Promise<Product[]> => {
  try {
    let url = "/products"
    const queryParams: string[] = []

    if (params) {
      // Build query parameters for all filters
      if (params.categoryId) {
        queryParams.push(`category=${params.categoryId}`)
      }

      if (params.query) {
        queryParams.push(`q=${encodeURIComponent(params.query)}`)
      }

      if (params.minPrice !== undefined) {
        queryParams.push(`minPrice=${params.minPrice}`)
      }

      if (params.maxPrice !== undefined) {
        queryParams.push(`maxPrice=${params.maxPrice}`)
      }

      if (params.rating !== undefined) {
        queryParams.push(`rating=${params.rating}`)
      }

      if (params.sort) {
        queryParams.push(`sort=${params.sort}`)
      }

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

    // IMPORTANT: Remove this special case to ensure all filters work together
    // We want to use the main index endpoint for all filtering
    // if (params?.categoryId && queryParams.length === 1) {
    //   return getProductsByCategory(params.categoryId.toString())
    // }

    const response = await axios.get(url)
    return response.data
  } catch (error: any) {
    console.error("Error fetching products:", error)
    // Return empty array instead of throwing to prevent page crashes
    return []
  }
}

// Keep the rest of the file unchanged
export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await axios.get(`/products/${id}`)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch product")
  }
}

export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  try {
    const response = await axios.get(`/products/category/${categoryId}`)
    return response.data
  } catch (error: any) {
    console.error("Error fetching products by category:", error)
    return []
  }
}

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const response = await axios.get(`/products/search?q=${encodeURIComponent(query)}`)
    return response.data
  } catch (error: any) {
    console.error("Error searching products:", error)
    return []
  }
}

export const createProduct = async (productData: FormData): Promise<Product> => {
  try {
    const response = await axios.post("/products", productData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create product")
  }
}

// Update the updateProduct function to include better error handling
export const updateProduct = async (id: string, productData: FormData): Promise<Product> => {
  try {
    // Log the form data for debugging
    console.log("Updating product with ID:", id)
    console.log("Form data entries:")
    for (const pair of productData.entries()) {
      console.log(pair[0], pair[1])
    }

    // Use PUT method for Laravel's RESTful API
    const response = await axios.post(`/products/${id}`, productData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error: any) {
    console.error("Error updating product:", error.response?.data || error.message)

    // Pass the full error object to allow for more detailed error handling
    if (error.response) {
      throw {
        message: error.response?.data?.message || "Failed to update product",
        response: error.response,
        status: error.response.status,
      }
    }

    throw new Error(error.message || "Failed to update product")
  }
}

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await axios.delete(`/products/${id}`)
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete product")
  }
}

// New function to manage product images
export const addProductImage = async (productId: string, imageFile: File): Promise<any> => {
  try {
    const formData = new FormData()
    formData.append("image", imageFile)

    const response = await axios.post(`/products/${productId}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to add product image")
  }
}

export const deleteProductImage = async (imageId: string): Promise<void> => {
  try {
    await axios.delete(`/product-images/${imageId}`)
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete product image")
  }
}

export const setMainProductImage = async (imageId: string): Promise<void> => {
  try {
    await axios.post(`/product-images/${imageId}/set-as-main`)
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to set main product image")
  }
}

