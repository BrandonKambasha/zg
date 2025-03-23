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
    const response = await axios.post("/stripe/handle-cancellation", {
      order_id: orderId,
    })
    console.log("Cancellation response:", response.data)
    return response.data
  } catch (error: any) {
    console.error("Cancellation error:", error)
    throw new Error(error.response?.data?.message || "Failed to process cancellation")
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