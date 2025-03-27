/**
 * Utility functions for token management and authentication
 */

// Token expiration check with improved error handling
export function isTokenExpired(token: string): boolean {
    if (!token) return true
  
    try {
      // Check if token has the correct format (should have 2 dots for JWT)
      if (!token.includes(".") || token.split(".").length !== 3) {
        console.warn("Invalid token format")
        return true
      }
  
      // JWT tokens are split into three parts by dots
      const payload = token.split(".")[1]
  
      // Make sure the payload is properly padded for base64 decoding
      // (JWT base64url encoding removes padding, we need to add it back for atob)
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
      const pad = base64.length % 4
      const paddedPayload = pad ? base64 + "=".repeat(4 - pad) : base64
  
      try {
        // The middle part contains the payload, which we need to decode
        const decodedPayload = JSON.parse(atob(paddedPayload))
  
        // Check if the token has an expiration time
        if (!decodedPayload.exp) return false
  
        // Compare expiration time with current time (exp is in seconds, Date.now() is in milliseconds)
        const expirationTime = decodedPayload.exp * 1000
        return Date.now() >= expirationTime
      } catch (decodeError) {
        console.warn("Failed to decode token payload:", decodeError)
        return true
      }
    } catch (error) {
      console.warn("Error checking token expiration:", error)
      return true // If we can't verify, assume it's expired for safety
    }
  }
  
  // Token storage with expiration check
  export function getStoredToken(): string | null {
    try {
      const token = localStorage.getItem("token")
  
      // If no token, return null
      if (!token) {
        return null
      }
  
      // If token is expired, remove it and return null
      if (isTokenExpired(token)) {
        localStorage.removeItem("token") // Clean up expired token
        return null
      }
  
      return token
    } catch (error) {
      console.warn("Error retrieving token:", error)
      return null
    }
  }
  
  // Safe localStorage wrapper with error handling
  export const safeStorage = {
    getItem: (key: string): string | null => {
      try {
        return localStorage.getItem(key)
      } catch (error) {
        console.warn(`Error getting item ${key} from localStorage:`, error)
        return null
      }
    },
  
    setItem: (key: string, value: string): boolean => {
      try {
        localStorage.setItem(key, value)
        return true
      } catch (error) {
        console.warn(`Error setting item ${key} in localStorage:`, error)
        return false
      }
    },
  
    removeItem: (key: string): boolean => {
      try {
        localStorage.removeItem(key)
        return true
      } catch (error) {
        console.warn(`Error removing item ${key} from localStorage:`, error)
        return false
      }
    },
  
    clear: (): boolean => {
      try {
        localStorage.clear()
        return true
      } catch (error) {
        console.warn("Error clearing localStorage:", error)
        return false
      }
    },
  }
  
  // Function to check if authentication is required for a specific API endpoint
  export function isAuthRequiredForEndpoint(endpoint: string): boolean {
    // List of endpoints that don't require authentication
    const publicEndpoints = [
      "/products",
      "/categories",
      "/hampers",
      "/featured",
      "/search",
      "/login",
      "/register",
      "/password/reset",
      "/password/email",
    ]
  
    // Check if the endpoint is in the public list
    for (const publicEndpoint of publicEndpoints) {
      if (endpoint.includes(publicEndpoint)) {
        return false
      }
    }
  
    // By default, require authentication
    return true
  }
  
  