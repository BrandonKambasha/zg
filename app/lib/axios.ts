import axios from "axios"

// export const apiBaseUrl="http://192.168.0.123:8000";
export const apiBaseUrl = 'https://zg-backend-production-84b0.up.railway.app';
const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://zg-backend-production-84b0.up.railway.app/api",
  
  timeout: 10000, // Increase timeout to 10 seconds
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

// Add request interceptor for debugging
instance.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)

    // Add auth token if available
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    return config
  },
  (error) => {
    console.error("API Request Error:", error)
    return Promise.reject(error)
  },
)

// Add response interceptor for debugging
instance.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
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

