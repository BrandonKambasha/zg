import type { Product } from "../../Types"
import axios from "../axios"
import { put } from "@vercel/blob"

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

    const response = await axios.get(url)
    return response.data
  } catch (error: any) {
    console.error("Error fetching products:", error)
    // Return empty array instead of throwing to prevent page crashes
    return []
  }
}

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

// Updated to use Vercel Blob for image storage with explicit token
export const createProduct = async (productData: FormData): Promise<Product> => {
  try {
    console.log("Starting product creation with images")

    // Extract images from FormData
    const imageFiles: File[] = []

    // Get all images from FormData
    for (let i = 0; i < 10; i++) {
      // Check up to 10 images to be safe
      const key = `images[${i}]`
      const imageFile = productData.get(key) as File | null

      if (imageFile && imageFile instanceof File && imageFile.size > 0) {
        console.log(`Found image at ${key}:`, imageFile.name, imageFile.type, imageFile.size)
        imageFiles.push(imageFile)
      }
    }

    console.log(`Found ${imageFiles.length} images to upload to Blob`)

    // Create a new FormData object without the image files
    const newFormData = new FormData()

    // Copy all non-image entries from the original FormData
    for (const [key, value] of Array.from(productData.entries())) {
      if (!key.startsWith("images[")) {
        newFormData.append(key, value)
      }
    }

    // Upload each image to Vercel Blob and add URLs to the new FormData
    if (imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        const imageFile = imageFiles[i]
        try {
          console.log(`Uploading image ${i + 1}/${imageFiles.length} to Blob:`, imageFile.name)

          // Get the token from environment variable
          const blobToken = process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN

          if (!blobToken) {
            console.error("NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN is not defined")
            throw new Error(
              "Blob token is not configured. Please add NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN to your environment variables.",
            )
          }

          // Upload to Vercel Blob with explicit token
          const blob = await put(`products/${Date.now()}-${imageFile.name}`, imageFile, {
            access: "public",
            addRandomSuffix: true,
            token: blobToken,
          })

          console.log(`Successfully uploaded to Blob:`, blob.url)

          // Add the Blob URL to the new FormData
          // Use image_urls[] format which Laravel can properly parse as an array
          newFormData.append("image_urls[]", blob.url)
        } catch (uploadError: any) {
          console.error(`Error uploading image ${i + 1} to Blob:`, uploadError)
          throw new Error(`Failed to upload image to Vercel Blob: ${uploadError.message}`)
        }
      }
    }

    // Log the final FormData before sending to backend
    console.log("Final FormData entries:")
    for (const pair of newFormData.entries()) {
      console.log(pair[0], pair[1])
    }

    // Send to backend
    const response = await axios.post("/products", newFormData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    console.log("Product created successfully:", response.data)
    return response.data
  } catch (error: any) {
    console.error("Failed to create product:", error)
    throw new Error(error.response?.data?.message || error.message || "Failed to create product")
  }
}

// Update the updateProduct function to use Vercel Blob with explicit token
export const updateProduct = async (id: string, productData: FormData): Promise<Product> => {
  try {
    console.log("Updating product with ID:", id)

    // Log the initial form data
    console.log("Initial FormData entries:")
    for (const pair of productData.entries()) {
      console.log(pair[0], pair[1])
    }

    // Extract new images from FormData
    const newImageFiles: File[] = []

    // Get all new images from FormData
    for (let i = 0; i < 10; i++) {
      // Check up to 10 images to be safe
      const key = `new_images[${i}]`
      const imageFile = productData.get(key) as File | null

      if (imageFile && imageFile instanceof File && imageFile.size > 0) {
        console.log(`Found new image at ${key}:`, imageFile.name, imageFile.type, imageFile.size)
        newImageFiles.push(imageFile)
      }
    }

    console.log(`Found ${newImageFiles.length} new images to upload to Blob`)

    // Create a new FormData object without the new image files
    const newFormData = new FormData()

    // Copy all non-new-image entries from the original FormData
    for (const [key, value] of Array.from(productData.entries())) {
      if (!key.startsWith("new_images[")) {
        newFormData.append(key, value)
      }
    }

    // Upload each new image to Vercel Blob
    if (newImageFiles.length > 0) {
      for (let i = 0; i < newImageFiles.length; i++) {
        const imageFile = newImageFiles[i]
        try {
          console.log(`Uploading new image ${i + 1}/${newImageFiles.length} to Blob:`, imageFile.name)

          // Get the token from environment variable
          const blobToken = process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN 

          if (!blobToken) {
            console.error("NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN is not defined")
            throw new Error(
              "Blob token is not configured. Please add NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN to your environment variables.",
            )
          }

          // Upload to Vercel Blob with explicit token
          const blob = await put(`products/${id}/${Date.now()}-${imageFile.name}`, imageFile, {
            access: "public",
            addRandomSuffix: true,
            token: blobToken,
          })

          console.log(`Successfully uploaded to Blob:`, blob.url)

          // Add the Blob URL to the new FormData
          // Use new_image_urls[] format which Laravel can properly parse as an array
          newFormData.append("new_image_urls[]", blob.url)
        } catch (uploadError: any) {
          console.error(`Error uploading new image ${i + 1} to Blob:`, uploadError)
          throw new Error(`Failed to upload image to Vercel Blob: ${uploadError.message}`)
        }
      }
    }

    // Log the final FormData before sending to backend
    console.log("Final FormData entries:")
    for (const pair of newFormData.entries()) {
      console.log(pair[0], pair[1])
    }

    // Send to backend
    const response = await axios.post(`/products/${id}`, newFormData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    console.log("Product updated successfully:", response.data)
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

// Updated to use Vercel Blob with explicit token
export const addProductImage = async (productId: string, imageFile: File): Promise<any> => {
  try {
    console.log(`Uploading image for product ${productId} to Blob:`, imageFile.name)

    // Get the token from environment variable
    const blobToken = process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN

    if (!blobToken) {
      console.error("NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN is not defined")
      throw new Error(
        "Blob token is not configured. Please add NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN to your environment variables.",
      )
    }

    // Upload to Vercel Blob with explicit token
    const blob = await put(`products/${productId}/${Date.now()}-${imageFile.name}`, imageFile, {
      access: "public",
      addRandomSuffix: true,
      token: blobToken,
    })

    console.log(`Successfully uploaded to Blob:`, blob.url)

    // Send the Blob URL to the backend
    const formData = new FormData()
    formData.append("image_url", blob.url)

    const response = await axios.post(`/products/${productId}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error: any) {
    console.error("Failed to add product image:", error)
    throw new Error(error.response?.data?.message || error.message || "Failed to add product image")
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

