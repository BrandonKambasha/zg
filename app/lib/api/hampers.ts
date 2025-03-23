import axios from "../axios"
import type { Hamper } from "../../Types"

export const getHampers = async (): Promise<Hamper[]> => {
  try {
    const response = await axios.get("/hampers")
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch hampers")
  }
}

export const getHamperById = async (id: string): Promise<Hamper> => {
  try {
    const response = await axios.get(`/hampers/${id}`)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch hamper")
  }
}

export const getUserHampers = async (): Promise<Hamper[]> => {
  try {
    const response = await axios.get("/my-hampers")
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch your hampers")
  }
}

export const createHamper = async (hamperData: FormData): Promise<Hamper> => {
  try {
    const response = await axios.post("/hampers", hamperData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create hamper")
  }
}

export const createCustomHamper = async (hamperData: FormData): Promise<Hamper> => {
  try {
    const response = await axios.post("/custom-hampers", hamperData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create custom hamper")
  }
}

export const updateHamper = async (id: string, hamperData: FormData): Promise<Hamper> => {
  try {
    const response = await axios.post(`/hampers/${id}`, hamperData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update hamper")
  }
}

export const updateCustomHamper = async (id: string, hamperData: FormData): Promise<Hamper> => {
  try {
    const response = await axios.post(`/custom-hampers/${id}`, hamperData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error: any) {
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
    await axios.delete(`/custom-hampers/${id}`)
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete custom hamper")
  }
}

