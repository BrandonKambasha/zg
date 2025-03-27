/**
 * Utility functions for token management and authentication
 */

// Token expiration check
export function isTokenExpired(token: string): boolean {
    if (!token) return true
  
    try {
      // JWT tokens are split into three parts by dots
      const payload = token.split(".")[1]
  
      // The middle part contains the payload, which we need to decode
      const decodedPayload = JSON.parse(atob(payload))
  
      // Check if the token has an expiration time
      if (!decodedPayload.exp) return false
  
      // Compare expiration time with current time (exp is in seconds, Date.now() is in milliseconds)
      const expirationTime = decodedPayload.exp * 1000
      return Date.now() >= expirationTime
    } catch (error) {
      console.error("Error checking token expiration:", error)
      return true // If we can't verify, assume it's expired for safety
    }
  }
  
  // Token storage with expiration check
  export function getStoredToken(): string | null {
    try {
      const token = localStorage.getItem("token")
  
      // If no token or token is expired, return null
      if (!token || isTokenExpired(token)) {
        localStorage.removeItem("token") // Clean up expired token
        return null
      }
  
      return token
    } catch (error) {
      console.error("Error retrieving token:", error)
      return null
    }
  }
  
  // Safe localStorage wrapper with error handling
  export const safeStorage = {
    getItem: (key: string): string | null => {
      try {
        return localStorage.getItem(key)
      } catch (error) {
        console.error(`Error getting item ${key} from localStorage:`, error)
        return null
      }
    },
  
    setItem: (key: string, value: string): boolean => {
      try {
        localStorage.setItem(key, value)
        return true
      } catch (error) {
        console.error(`Error setting item ${key} in localStorage:`, error)
        return false
      }
    },
  
    removeItem: (key: string): boolean => {
      try {
        localStorage.removeItem(key)
        return true
      } catch (error) {
        console.error(`Error removing item ${key} from localStorage:`, error)
        return false
      }
    },
  
    clear: (): boolean => {
      try {
        localStorage.clear()
        return true
      } catch (error) {
        console.error("Error clearing localStorage:", error)
        return false
      }
    },
  }
  
  // Function to handle token refresh
  export async function refreshAuthToken(refreshToken?: string): Promise<string | null> {
    // This is a placeholder - implement your actual token refresh logic here
    // using your backend API endpoint for refreshing tokens
    try {
      // Example implementation:
      // const response = await axios.post('/api/refresh-token', { refreshToken })
      // return response.data.token
  
      // For now, just return null to indicate refresh failed
      return null
    } catch (error) {
      console.error("Error refreshing token:", error)
      return null
    }
  }
  
  