"use client"

import { createContext, useEffect, useState, type ReactNode } from "react"
import type { User } from "../Types"
import {
  getUserProfile,
  logout as apiLogout,
  updateUserProfile as apiUpdateUserProfile,
  deleteAccount as apiDeleteAccount,
} from "../lib/api/Auth"
import axios from "../lib/axios"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, userData?: User) => void
  logout: () => Promise<void>
  updateUserProfile: (data: Partial<User>) => Promise<void>
  deleteAccount: (password: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: async () => {},
  updateUserProfile: async () => {},
  deleteAccount: async () => {},
})

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (token) {
      // Set the Authorization header for all future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      fetchUserProfile()
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchUserProfile = async () => {
    try {
      const userData = await getUserProfile()
      setUser(userData)
    } catch (error: any) {
      console.error("Failed to fetch user profile:", error)
  
      // If token is expired or invalid, force logout
      if (error.response?.status === 401) {
        await logout() // Ensure user state updates immediately
      }
    } finally {
      setIsLoading(false)
    }
  }

  const login = (token: string, userData?: User) => {
    localStorage.removeItem("token") // Clear any old token first
    localStorage.setItem("token", token)

    // Set the Authorization header for all future requests
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

    if (userData) {
      setUser(userData)
    } else {
      fetchUserProfile()
    }
  }

  const logout = async () => {
    try {
      // Call the API logout endpoint
      await apiLogout()
    } catch (error) {
      console.error("Logout API error:", error)
    } finally {
      // Clean up regardless of API success
      localStorage.removeItem("token")
      delete axios.defaults.headers.common["Authorization"]
      setUser(null)
      setIsLoading(false) // Ensure app re-renders properly

    }
  }

  const updateUserProfile = async (data: Partial<User>) => {
    try {
      // Make an API call to update the user profile
      const updatedUser = await apiUpdateUserProfile(data)

      // Update the local state with the response data
      setUser(updatedUser)

      return Promise.resolve()
    } catch (error) {
      console.error("Failed to update user profile:", error)
      return Promise.reject(error)
    }
  }

  const deleteAccount = async (password: string) => {
    try {
      await apiDeleteAccount(password)

      // Clean up after successful deletion
      localStorage.removeItem("token")
      delete axios.defaults.headers.common["Authorization"]
      setUser(null)

      return Promise.resolve()
    } catch (error) {
      console.error("Failed to delete account:", error)
      return Promise.reject(error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUserProfile,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

