import axios from "../axios"
import type { User } from "../../Types"
import { safeStorage } from "../auth-utils"

export const register = async (data: {
  name: string
  email: string
  password: string
  password_confirmation: string
  phone_number?: string
  shipping_address?: string
  role: string
  recaptchaToken?: string
}) => {
  try {
    const response = await axios.post("/register", data)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Registration failed")
  }
}

export const login = async (data: {
  email: string
  password: string
  recaptchaToken?: string
}) => {
  try {
    const response = await axios.post("/login", data)

    // If login is successful, store the token safely
    if (response.data && response.data.token) {
      safeStorage.setItem("token", response.data.token)
    }

    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Login failed")
  }
}

export const logout = async () => {
  try {
    const response = await axios.post("/logout")

    // Always remove token on logout, regardless of API response
    safeStorage.removeItem("token")

    return response.data
  } catch (error: any) {
    // Still remove token even if API call fails
    safeStorage.removeItem("token")

    throw new Error(error.response?.data?.message || "Logout failed")
  }
}

export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await axios.get("/user")
    return response.data
  } catch (error: any) {
    // If unauthorized, clear token
    if (error.response?.status === 401) {
      safeStorage.removeItem("token")
    }

    throw new Error(error.response?.data?.message || "Failed to get user profile")
  }
}

export const updateUserProfile = async (data: Partial<User>): Promise<User> => {
  try {
    const response = await axios.post("/user/update", data)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update user profile")
  }
}

export const deleteAccount = async (password: string): Promise<void> => {
  try {
    await axios.post("/user/delete", { password })

    // Clear token after successful account deletion
    safeStorage.removeItem("token")
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to delete account")
  }
}

