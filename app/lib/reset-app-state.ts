import toast from "react-hot-toast"

/**
 * Utility to completely reset the application state
 * This will clear all localStorage, sessionStorage, and cookies
 */
export function resetAppState() {
  // Clear all localStorage items
  localStorage.clear()

  // Clear all sessionStorage items
  sessionStorage.clear()

  // Clear all cookies
  document.cookie.split(";").forEach((cookie) => {
    const eqPos = cookie.indexOf("=")
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
  })

  console.log("Application state has been completely reset")
  toast.success("App data has been reset successfully")

  // Reload the page to ensure a fresh start
  window.location.href = "/"
}

/**
 * Utility to clear only cart and wishlist related data
 */
export function resetCartAndWishlist() {
  // Clear cart storage
  localStorage.removeItem("cart-storage")

  // Clear any wishlist related storage
  localStorage.removeItem("wishlist-storage")

  console.log("Cart and wishlist data has been reset")
  toast.success("Shopping data has been reset successfully")

  // Reload the current page
  window.location.reload()
}

/**
 * Utility to clear authentication data
 */
export function resetAuthState() {
  // Remove token
  localStorage.removeItem("token")

  // Remove any auth-related cookies
  document.cookie = "token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"

  console.log("Authentication state has been reset")
  toast.success("You have been logged out successfully")

  // Redirect to login
  window.location.href = "/login"
}

