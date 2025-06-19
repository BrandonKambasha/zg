import axios from "axios"

export const apiBaseUrl="http://192.168.0.123:8000";
// export const apiBaseUrl = "https://zg-backend-production-84b0.up.railway.app"
const instance = axios.create({
  // baseURL: process.env.NEXT_PUBLIC_API_URL || "https://zg-backend-production-84b0.up.railway.app/api",
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://192.168.0.123:8000/api",

  timeout: 10000, // Increase timeout to 10 seconds
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

// Session management variables
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
let lastActivityTime = Date.now()

// Function to check if session has timed out
const hasSessionTimedOut = () => {
  return Date.now() - lastActivityTime > SESSION_TIMEOUT
}

// Update activity timestamp
const updateActivityTimestamp = () => {
  lastActivityTime = Date.now()
}

// Setup activity tracking if in browser environment
if (typeof window !== "undefined") {
  // Track user activity
  const activityEvents = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "touchmove", "touchend"]

  activityEvents.forEach((event) => {
    window.addEventListener(event, updateActivityTimestamp)
  })

  // Handle visibility changes
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      // Check if session should have expired while away
      if (hasSessionTimedOut()) {
        console.log("Session expired while away")
        localStorage.removeItem("token")
        delete instance.defaults.headers.common["Authorization"]

        // Only redirect if not already on login page
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login?session=expired"
        }
      } else {
        // Update timestamp when returning to the app
        updateActivityTimestamp()
      }
    }
  })
}

// Add request interceptor for debugging and token handling
instance.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)

    // Check for session timeout before making request
    if (typeof window !== "undefined" && hasSessionTimedOut()) {
      console.log("Session timed out, but allowing request to proceed")
      // Don't redirect here, just log the issue
      // This allows cart/wishlist operations to still work
    }

    // Add auth token if available
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) {
        // Check if token is a valid JWT and if it's expired
        try {
          const tokenParts = token.split(".")
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]))
            if (payload.exp && payload.exp * 1000 < Date.now()) {
              // Token is expired
              console.log("Token expired, removing it")
              localStorage.removeItem("token")
              delete instance.defaults.headers.common["Authorization"]
              // Don't set the header for this request
              return config
            }
          }
        } catch (e) {
          console.error("Error parsing token:", e)
          // If we can't parse the token, it's probably invalid
          localStorage.removeItem("token")
          delete instance.defaults.headers.common["Authorization"]
          return config
        }

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

// Add response interceptor for debugging and error handling
instance.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`)

    // Update activity timestamp on successful response
    if (typeof window !== "undefined") {
      updateActivityTimestamp()
    }

    return response
  },
  (error) => {
    // Safely handle error logging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`API Response Error: ${error.response.status}`, error.response.data || {})

      // Handle 401 Unauthorized errors (token expired or invalid)
      if (error.response.status === 401) {
        console.log("Unauthorized response, clearing token")
        if (typeof window !== "undefined") {
          localStorage.removeItem("token")
          delete instance.defaults.headers.common["Authorization"]

          // Only redirect if not already on login page AND not a cart/wishlist API call
          const url = error.config?.url || ""
          const isCartOrWishlist = url.includes("/cart") || url.includes("/wishlist")

          if (!window.location.pathname.includes("/login") && !isCartOrWishlist) {
            window.location.href = "/login?session=expired"
          }
        }
      }
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

// Add mobile-specific handling for background/foreground transitions
if (typeof window !== "undefined") {
  let backgroundTime = 0

  // Track when the app goes to background
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      // App going to background
      backgroundTime = Date.now()
    } else if (document.visibilityState === "visible") {
      // App coming to foreground
      const inactiveTime = Date.now() - backgroundTime

      // If the app was in background for longer than session timeout, verify token
      if (inactiveTime > SESSION_TIMEOUT) {
        const token = localStorage.getItem("token")

        if (token) {
          // Perform a lightweight API call to verify the token is still valid
          instance.get("/user").catch((error) => {
            if (error.response && error.response.status === 401) {
              // Token is invalid, clear it
              localStorage.removeItem("token")
              delete instance.defaults.headers.common["Authorization"]

              // Redirect to login
              if (!window.location.pathname.includes("/login")) {
                window.location.href = "/login?session=expired"
              }
            }
          })
        }
      }
    }
  })
}

export default instance

