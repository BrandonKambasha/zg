import axios from "../axios"
import type { User } from "../../Types"

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
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Login failed")
  }
}

export const logout = async () => {
  try {
    const response = await axios.post("/logout")
    return response.data
  } catch (error: any) {
    // Even if the API call fails, ensure token is cleared
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      delete axios.defaults.headers.common["Authorization"]
    }
    throw new Error(error.response?.data?.message || "Logout failed")
  } finally {
    // Ensure token is cleared regardless of success or failure
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      delete axios.defaults.headers.common["Authorization"]
    }
  }
}

export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await axios.get("/user")
    return response.data
  } catch (error: any) {
    // Check if token is expired or invalid
    if (error.response?.status === 401) {
      // Clear token from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        delete axios.defaults.headers.common["Authorization"]
      }
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
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to delete account")
  }
}

// New functions for email verification and password reset

export const sendPasswordResetLink = async (data: { email: string }) => {
  try {
    const response = await axios.post("/password/email", data)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to send password reset link")
  }
}

export const resetPassword = async (data: {
  token: string
  email: string
  password: string
  password_confirmation: string
}) => {
  try {
    const response = await axios.post("/password/reset", data)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to reset password")
  }
}

export const verifyEmail = async (data: { token: string }) => {
  try {
    const response = await axios.post("/email/verify", data)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to verify email")
  }
}

export const resendVerificationEmail = async (data: { email: string }) => {
  try {
    const response = await axios.post("/email/verify/resend", data)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to resend verification email")
  }
}
