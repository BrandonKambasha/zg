import axios from "../axios"
import type { Hamper } from "../../Types"
import { safeStorage, isTokenExpired } from "../auth-utils"

const checkAuth = () => {
  const token = safeStorage.getItem("token")
  if (!token || isTokenExpired(token)) {
    throw new Error("Authentication required")
  }
}
// Helper function to upload a file to Vercel Blob via our API route
async function uploadToBlob(file: File, folder = "hampers"): Promise<string> {
  try {
    console.log(`Uploading hamper image to Blob:`, file.name, file.type, file.size)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", folder)

    // Make sure we're using the correct API route path
    // This should be the absolute path to your API route
    const response = await fetch("/lib/api/upload-blob", {
      method: "POST",
      body: formData,
    })

    // Log the response status
    console.log(`Blob upload response status:`, response.status)

    // Check if the response is OK
    if (!response.ok) {
      // Try to parse the response as JSON
      let errorData
      const contentType = response.headers.get("content-type")
      const responseText = await response.text()
      console.error("Error response from upload-blob:", responseText)

      try {
        errorData = JSON.parse(responseText)
      } catch (e) {
        // If parsing fails, use the raw text
        throw new Error(`Upload failed with status: ${response.status}. Response: ${responseText.substring(0, 500)}`)
      }

      throw new Error(errorData.error || `Upload failed with status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`Successfully uploaded hamper image to Blob:`, data)

    if (!data.url) {
      throw new Error("Blob upload succeeded but no URL was returned")
    }

    return data.url
  } catch (error: any) {
    console.error(`Error uploading hamper image to Blob:`, error)
    throw new Error(`Failed to upload file: ${error.message}`)
  }
}

export const getHampers = async (): Promise<Hamper[]> => {
  try {
    checkAuth()

    const response = await axios.get("/hampers")
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch hampers")
  }
}

export const getHamperById = async (id: string): Promise<Hamper> => {
  try {
    checkAuth()

    const response = await axios.get(`/hampers/${id}`)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch hamper")
  }
}

export const getUserHampers = async (): Promise<Hamper[]> => {
  try {
    checkAuth()

    const response = await axios.get("/my-hampers")
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch your hampers")
  }
}

export const createHamper = async (hamperData: FormData): Promise<Hamper> => {
  try {
    console.log("Starting hamper creation with image")

    // Extract image from FormData
    const imageFile = hamperData.get("image") as File | null

    // Create a new FormData object without the image file
    const newFormData = new FormData()

    // Copy all non-image entries from the original FormData
    for (const [key, value] of Array.from(hamperData.entries())) {
      if (key !== "image") {
        newFormData.append(key, value)
        console.log(`Adding form data: ${key} = ${value}`)
      }
    }

    // Upload image to Vercel Blob if it exists
    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      console.log(`Uploading hamper image to Blob:`, imageFile.name, imageFile.type, imageFile.size)

      try {
        // Upload via our API route
        const imageUrl = await uploadToBlob(imageFile, "hampers")
        console.log("Received image URL from Blob:", imageUrl)

        // Add the Blob URL to the new FormData
        newFormData.append("image_url", imageUrl)
        console.log("Added image_url to form data:", imageUrl)
      } catch (uploadError: any) {
        console.error(`Error uploading hamper image to Blob:`, uploadError)
        throw new Error(`Failed to upload image: ${uploadError.message}`)
      }
    } else {
      console.log("No image file provided for hamper")
    }

    // Log the final FormData before sending to backend
    console.log("Final FormData entries for hamper creation:")
    for (const pair of newFormData.entries()) {
      console.log(pair[0], pair[1])
    }

    const response = await axios.post("/hampers", newFormData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    console.log("Hamper created successfully:", response.data)
    return response.data
  } catch (error: any) {
    console.error("Error creating hamper:", error)
    throw new Error(error.response?.data?.message || "Failed to create hamper")
  }
}

export const createCustomHamper = async (hamperData: FormData): Promise<Hamper> => {
  try {
    checkAuth()

    console.log("Starting custom hamper creation with image")

    // Extract image from FormData
    const imageFile = hamperData.get("image") as File | null

    // Create a new FormData object without the image file
    const newFormData = new FormData()

    // Copy all non-image entries from the original FormData
    for (const [key, value] of Array.from(hamperData.entries())) {
      if (key !== "image") {
        newFormData.append(key, value)
        console.log(`Adding form data: ${key} = ${value}`)
      }
    }

    // Upload image to Vercel Blob if it exists
    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      console.log(`Uploading custom hamper image to Blob:`, imageFile.name, imageFile.type, imageFile.size)

      try {
        // Upload via our API route
        const imageUrl = await uploadToBlob(imageFile, "custom-hampers")
        console.log("Received image URL from Blob:", imageUrl)

        // Add the Blob URL to the new FormData
        newFormData.append("image_url", imageUrl)
        console.log("Added image_url to form data:", imageUrl)
      } catch (uploadError: any) {
        console.error(`Error uploading custom hamper image to Blob:`, uploadError)
        throw new Error(`Failed to upload image: ${uploadError.message}`)
      }
    } else {
      console.log("No image file provided for custom hamper")
    }

    // Log the final FormData before sending to backend
    console.log("Final FormData entries for custom hamper creation:")
    for (const pair of newFormData.entries()) {
      console.log(pair[0], pair[1])
    }

    const response = await axios.post("/custom-hampers", newFormData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    console.log("Custom hamper created successfully:", response.data)
    return response.data
  } catch (error: any) {
    console.error("Error creating custom hamper:", error)
    throw new Error(error.response?.data?.message || "Failed to create custom hamper")
  }
}

export const updateHamper = async (id: string, hamperData: FormData): Promise<Hamper> => {
  try {
    console.log("Starting hamper update with image, ID:", id)

    // Extract image from FormData
    const imageFile = hamperData.get("image") as File | null
    const keepExistingImage = hamperData.get("keep_existing_image") === "1"
    const removeImage = hamperData.get("remove_image") === "1"

    // Create a new FormData object without the image file
    const newFormData = new FormData()

    // Copy all non-image entries from the original FormData
    for (const [key, value] of Array.from(hamperData.entries())) {
      if (key !== "image") {
        newFormData.append(key, value)
        console.log(`Adding form data: ${key} = ${value}`)
      }
    }

    // Upload image to Vercel Blob if it exists
    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      console.log(`Uploading new hamper image to Blob:`, imageFile.name, imageFile.type, imageFile.size)

      try {
        // Upload via our API route
        const imageUrl = await uploadToBlob(imageFile, `hampers/${id}`)
        console.log("Received image URL from Blob:", imageUrl)

        // Add the Blob URL to the new FormData
        newFormData.append("image_url", imageUrl)
        console.log("Added image_url to form data:", imageUrl)
      } catch (uploadError: any) {
        console.error(`Error uploading hamper image to Blob:`, uploadError)
        throw new Error(`Failed to upload image: ${uploadError.message}`)
      }
    } else {
      console.log("No new image file provided for hamper update")

      if (keepExistingImage) {
        console.log("Keeping existing image")
      } else if (removeImage) {
        console.log("Removing existing image")
      }
    }

    // Log the final FormData before sending to backend
    console.log("Final FormData entries for hamper update:")
    for (const pair of newFormData.entries()) {
      console.log(pair[0], pair[1])
    }

    const response = await axios.post(`/hampers/${id}`, newFormData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    console.log("Hamper updated successfully:", response.data)
    return response.data
  } catch (error: any) {
    console.error("Error updating hamper:", error)
    throw new Error(error.response?.data?.message || "Failed to update hamper")
  }
}

export const updateCustomHamper = async (id: string, hamperData: FormData): Promise<Hamper> => {
  try {
    checkAuth()

    console.log("Starting custom hamper update with image, ID:", id)

    // Extract image from FormData
    const imageFile = hamperData.get("image") as File | null
    const keepExistingImage = hamperData.get("keep_existing_image") === "1"
    const removeImage = hamperData.get("remove_image") === "1"

    // Create a new FormData object without the image file
    const newFormData = new FormData()

    // Copy all non-image entries from the original FormData
    for (const [key, value] of Array.from(hamperData.entries())) {
      if (key !== "image") {
        newFormData.append(key, value)
        console.log(`Adding form data: ${key} = ${value}`)
      }
    }

    // Upload image to Vercel Blob if it exists
    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      console.log(`Uploading new custom hamper image to Blob:`, imageFile.name, imageFile.type, imageFile.size)

      try {
        // Upload via our API route
        const imageUrl = await uploadToBlob(imageFile, `custom-hampers/${id}`)
        console.log("Received image URL from Blob:", imageUrl)

        // Add the Blob URL to the new FormData
        newFormData.append("image_url", imageUrl)
        console.log("Added image_url to form data:", imageUrl)
      } catch (uploadError: any) {
        console.error(`Error uploading custom hamper image to Blob:`, uploadError)
        throw new Error(`Failed to upload image: ${uploadError.message}`)
      }
    } else {
      console.log("No new image file provided for custom hamper update")

      if (keepExistingImage) {
        console.log("Keeping existing image")
      } else if (removeImage) {
        console.log("Removing existing image")
      }
    }

    // Log the final FormData before sending to backend
    console.log("Final FormData entries for custom hamper update:")
    for (const pair of newFormData.entries()) {
      console.log(pair[0], pair[1])
    }

    const response = await axios.post(`/custom-hampers/${id}`, newFormData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    console.log("Custom hamper updated successfully:", response.data)
    return response.data
  } catch (error: any) {
    console.error("Error updating custom hamper:", error)
    throw new Error(error.response?.data?.message || "Failed to update custom hamper")
  }
}

export const deleteHamper = async (id: string): Promise<void> => {
  try {
    await axios.delete(`/hampers/${id}`)
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete hamper")
  }
}

export const deleteCustomHamper = async (id: string): Promise<void> => {
  try {
    checkAuth()

    await axios.delete(`/custom-hampers/${id}`)
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete custom hamper")
  }
}

