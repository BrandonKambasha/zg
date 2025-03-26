import axios from "../axios"

/**
 * Create a checkout session for a pending order
 */
export const createCheckoutSession = async (orderId: string | number) => {
  try {
    console.log("Creating checkout session for order ID:", orderId)

    const response = await axios.post("/stripe/create-checkout-session", {
      order_id: orderId,
    })

    console.log("Checkout session response:", response.data)
    return response.data
  } catch (error: any) {
    console.error("Checkout session error:", error)
    console.error("Response data:", error.response?.data)
    throw new Error(error.response?.data?.message || error.response?.data?.error || "Failed to create checkout session")
  }
}

/**
 * Verify payment status by session ID
 */
export const verifyPaymentStatus = async (sessionId: string) => {
  try {
    console.log("Verifying payment status for session:", sessionId)
    const response = await axios.get(`/stripe/verify-session/${sessionId}`)
    console.log("Payment verification response:", response.data)
    return response.data
  } catch (error: any) {
    console.error("Payment verification error:", error)
    throw new Error(error.response?.data?.message || "Failed to verify payment")
  }
}

/**
 * Handle checkout cancellation
 */
export const handleCheckoutCancellation = async (orderId: string | number) => {
  try {
    console.log("Handling checkout cancellation for order ID:", orderId)

    // Add a retry mechanism with exponential backoff
    let attempts = 0
    const maxAttempts = 3
    let delay = 1000 // Start with 1 second delay

    while (attempts < maxAttempts) {
      try {
        const response = await axios.post("/stripe/handle-cancellation", {
          order_id: orderId,
        })
        console.log("Cancellation response:", response.data)
        return response.data
      } catch (error: any) {
        attempts++
        if (attempts >= maxAttempts) {
          throw error // Rethrow after max attempts
        }

        console.log(`Cancellation attempt ${attempts} failed, retrying in ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        delay *= 2 // Exponential backoff
      }
    }
  } catch (error: any) {
    console.error("Cancellation error:", error)
    // Don't throw the error, just log it and return a default response
    // This prevents the error from bubbling up and causing a logout
    return {
      success: false,
      message: "Failed to cancel order, but you can continue shopping",
      error: error.response?.data?.message || "Failed to process cancellation",
    }
  }
}

/**
 * This function is kept for backward compatibility
 * It now calls createCheckoutSession instead
 */
export const createPaymentIntent = async (orderData: any) => {
  return createCheckoutSession(orderData)
}

/**
 * Manually trigger payment verification and email sending
 */
export const manuallyVerifyPayment = async (sessionId: string) => {
  try {
    console.log("Manually verifying payment for session:", sessionId)
    const response = await axios.post("/stripe/manually-verify-payment", { session_id: sessionId })
    console.log("Manual verification response:", response.data)
    return response.data
  } catch (error: any) {
    console.error("Manual verification error:", error)
    throw new Error(error.response?.data?.message || "Failed to manually verify payment")
  }
}

