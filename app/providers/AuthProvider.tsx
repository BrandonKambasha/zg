"use client"

import { createContext, useEffect, useState, useRef, type ReactNode } from "react"
import type { User } from "../Types"
import {
  getUserProfile,
  logout as apiLogout,
  updateUserProfile as apiUpdateUserProfile,
  deleteAccount as apiDeleteAccount,
} from "../lib/api/Auth"
import axios from "../lib/axios"
import { useRouter } from "next/navigation"

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
  const [lastActivity, setLastActivity] = useState<number>(Date.now())
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)
  const tokenExpiryTimerRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  // Session timeout in milliseconds (30 minutes)
  const SESSION_TIMEOUT = 30 * 60 * 1000

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (token) {
      // Set the Authorization header for all future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      fetchUserProfile()

      // Start the inactivity timer
      startInactivityTimer()

      // Check token expiration
      checkTokenExpiration(token)
    } else {
      setIsLoading(false)
    }

    // Set up event listeners for user activity
    const activityEvents = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "touchmove", "touchend"]

    const resetInactivityTimer = () => {
      setLastActivity(Date.now())
      startInactivityTimer()
    }

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer)
    })

    // Handle page visibility changes (when user switches apps or tabs)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // User has returned to the app/tab
        const token = localStorage.getItem("token")
        if (token) {
          // Check if the session should still be valid
          const currentTime = Date.now()
          const timeSinceLastActivity = currentTime - lastActivity

          if (timeSinceLastActivity > SESSION_TIMEOUT) {
            // Session should have expired while away
            console.log("Session expired while away")
            logout()
          } else {
            // Session still valid, restart the timer
            startInactivityTimer()
            checkTokenExpiration(token)
          }
        }
      }
    }

    // Add visibility change listener
    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Clean up event listeners
    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer)
      })

      document.removeEventListener("visibilitychange", handleVisibilityChange)

      // Clear timers
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }

      if (tokenExpiryTimerRef.current) {
        clearTimeout(tokenExpiryTimerRef.current)
      }
    }
  }, [])

  const fetchUserProfile = async () => {
    try {
      const userData = await getUserProfile()
      setUser(userData)
      return userData
    } catch (error: any) {
      console.error("Failed to fetch user profile:", error)

      // If token is expired or invalid, force logout
      if (error.response?.status === 401) {
        await logout() // Ensure user state updates immediately
        router.push("/login?session=expired")
      }
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const startInactivityTimer = () => {
    // Clear any existing timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
    }

    // Set a new timer
    inactivityTimerRef.current = setTimeout(async () => {
      console.log("Session expired due to inactivity")
      await logout()
      router.push("/login?session=expired")
    }, SESSION_TIMEOUT)
  }

  const checkTokenExpiration = (token: string) => {
    try {
      // For JWT tokens, you can decode and check expiration
      // This is a simple implementation - adjust based on your token structure
      const tokenParts = token.split(".")
      if (tokenParts.length !== 3) {
        // Not a valid JWT token
        return
      }

      const payload = JSON.parse(atob(tokenParts[1]))

      if (payload.exp) {
        // exp is in seconds, convert to milliseconds
        const expiryTime = payload.exp * 1000
        const currentTime = Date.now()

        if (expiryTime <= currentTime) {
          // Token already expired
          console.log("Token expired")
          logout()
          router.push("/login?session=expired")
          return
        }

        // Set timer to logout when token expires
        const timeToExpiry = expiryTime - currentTime

        if (tokenExpiryTimerRef.current) {
          clearTimeout(tokenExpiryTimerRef.current)
        }

        tokenExpiryTimerRef.current = setTimeout(() => {
          console.log("Token expired")
          logout()
          router.push("/login?session=expired")
        }, timeToExpiry)
      }
    } catch (error) {
      console.error("Error checking token expiration:", error)
    }
  }

  const login = (token: string, userData?: User) => {
    localStorage.removeItem("token") // Clear any old token first
    localStorage.setItem("token", token)

    // Set the Authorization header for all future requests
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

    // Reset activity timestamp and start inactivity timer
    setLastActivity(Date.now())
    startInactivityTimer()

    // Check token expiration
    checkTokenExpiration(token)

    if (userData) {
      setUser(userData)
      router.push("/products") // Redirect to products page after login
    } else {
      fetchUserProfile().then(() => {
        router.push("/products") // Redirect to products page after profile is fetched
      })
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

      // Clear timers
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
        inactivityTimerRef.current = null
      }

      if (tokenExpiryTimerRef.current) {
        clearTimeout(tokenExpiryTimerRef.current)
        tokenExpiryTimerRef.current = null
      }
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

