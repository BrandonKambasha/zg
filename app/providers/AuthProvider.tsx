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
import { safeStorage, isTokenExpired } from "../lib/auth-utils"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, userData?: User) => void
  logout: () => Promise<void>
  updateUserProfile: (data: Partial<User>) => Promise<void>
  deleteAccount: (password: string) => Promise<void>
  checkAndRefreshAuth: () => Promise<boolean>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: async () => {},
  updateUserProfile: async () => {},
  deleteAccount: async () => {},
  checkAndRefreshAuth: async () => false,
})

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authInitialized, setAuthInitialized] = useState(false)

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = safeStorage.getItem("token")

        if (token) {
          // Check if token is expired
          if (isTokenExpired(token)) {
            console.log("Token is expired, logging out")
            await handleLogout()
          } else {
            // Set the Authorization header for all future requests
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
            await fetchUserProfile()
          }
        } else {
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        await handleLogout()
      } finally {
        setAuthInitialized(true)
      }
    }

    initializeAuth()
  }, [])

  // Periodically check token validity
  useEffect(() => {
    if (!authInitialized) return

    const tokenCheckInterval = setInterval(() => {
      const token = safeStorage.getItem("token")
      if (token && isTokenExpired(token)) {
        console.log("Token expired during session, logging out")
        handleLogout()
      }
    }, 60000) // Check every minute

    return () => clearInterval(tokenCheckInterval)
  }, [authInitialized])

  const fetchUserProfile = async () => {
    try {
      const userData = await getUserProfile()
      setUser(userData)
    } catch (error: any) {
      console.error("Failed to fetch user profile:", error)

      // If token is expired or invalid, force logout
      if (error.response?.status === 401) {
        await handleLogout() // Ensure user state updates immediately
      }
    } finally {
      setIsLoading(false)
    }
  }

  const login = (token: string, userData?: User) => {
    // Clear any old token first
    safeStorage.removeItem("token")

    // Store new token
    safeStorage.setItem("token", token)

    // Set the Authorization header for all future requests
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

    if (userData) {
      setUser(userData)
    } else {
      fetchUserProfile()
    }
  }

  const handleLogout = async () => {
    // Clean up regardless of API success
    safeStorage.removeItem("token")
    delete axios.defaults.headers.common["Authorization"]
    setUser(null)
    setIsLoading(false)
  }

  const logout = async () => {
    try {
      // Call the API logout endpoint
      await apiLogout()
    } catch (error) {
      console.error("Logout API error:", error)
    } finally {
      await handleLogout()
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
      await handleLogout()

      return Promise.resolve()
    } catch (error) {
      console.error("Failed to delete account:", error)
      return Promise.reject(error)
    }
  }

  // Function to check and refresh authentication if needed
  const checkAndRefreshAuth = async (): Promise<boolean> => {
    const token = safeStorage.getItem("token")

    if (!token) {
      return false
    }

    if (isTokenExpired(token)) {
      // Token is expired, try to refresh or log out
      await handleLogout()
      return false
    }

    // Token is valid
    return true
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
        checkAndRefreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

