"use client"

import { useEffect } from "react"
import { useAuth } from "../hooks/useAuth"
import { useCartStore } from "../hooks/useCart"
import { safeStorage, isTokenExpired } from "../lib/auth-utils"

/**
 * This component monitors authentication status and handles token expiration
 * It doesn't render anything visible but provides important functionality
 */
export default function AuthStatusMonitor() {
  const { logout, isAuthenticated } = useAuth()
  const resetCartState = useCartStore((state) => state.resetCartState)

  // Check token validity on page load and periodically
  useEffect(() => {
    // Function to check token and handle expiration
    const checkTokenValidity = () => {
      try {
        const token = safeStorage.getItem("token")

        // Only check if token exists
        if (token) {
          try {
            if (isTokenExpired(token)) {
              console.log("Token expired, logging out and resetting state")
              // Token is expired, log out and reset cart
              logout()
              resetCartState()
            }
          } catch (validationError) {
            console.warn("Token validation error, removing invalid token:", validationError)
            safeStorage.removeItem("token")
          }
        }
      } catch (error) {
        console.warn("Error checking token validity:", error)
      }
    }

    // Check immediately on component mount
    checkTokenValidity()

    // Set up interval to check periodically
    const intervalId = setInterval(checkTokenValidity, 60000) // Check every minute

    return () => clearInterval(intervalId)
  }, [logout, resetCartState])

  // Handle storage events (for multi-tab support)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "token") {
        // Token changed in another tab
        if (!event.newValue && isAuthenticated) {
          // Token was removed in another tab, log out in this tab too
          logout()
          resetCartState()
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [isAuthenticated, logout, resetCartState])

  // This component doesn't render anything visible
  return null
}

