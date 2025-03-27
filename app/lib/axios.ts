import axios from "axios"
import { getStoredToken } from "./auth-utils"

// export const apiBaseUrl="http://192.168.0.123:8000";
export const apiBaseUrl = "https://zg-backend-production-84b0.up.railway.app"
const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://zg-backend-production-84b0.up.railway.app/api",
  timeout: 10000, // Increase timeout to 10 seconds
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

// Add request interceptor for debugging and token management
instance.interceptors.request.use(
  async (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)

    // Add auth token if available, with expiration check
    if (typeof window !== "undefined") {
      const token = getStoredToken()

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      } else {
        // If token is expired or invalid, remove it from headers
        delete config.headers.Authorization
      }
    }

    return config
  },
  (error) => {
    console.error("API Request Error:", error)
    return Promise.reject(error)
  },
)

// Add response interceptor for debugging and token handling
instance.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`)
    return response
  },
  async (error) => {
    // Handle 401 Unauthorized errors (expired token)
    if (error.response && error.response.status === 401) {
      console.warn("Received 401 Unauthorized response - token may be expired")

      // Clear invalid token
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
      }

      // Redirect to login page if needed
      // You can implement this based on your app's routing
    }

    // Safely handle error logging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`API Response Error: ${error.response.status}`, error.response.data || {})
    } else if (error.request) {
      // The request was made but no response was received
      console.error("API Response Error: No response received", error.request)
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("API Error:", error.message)
    }

    return Promise.reject(error)
  },
)

export default instance

