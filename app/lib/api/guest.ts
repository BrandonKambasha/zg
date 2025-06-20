import axios from "../axios"

export interface GuestOrderData {
  email: string
  guest_name: string
  items: Array<{
    product_id?: number
    hamper_id?: number
    quantity: number
  }>
  shipping_address: string
  zim_contact: string
  zim_contact_id: string // Added this field
  phone_number: string
  zim_name: string
  delivery_zone: number
  instructions?: string
  payment_method?: string
}

export interface GuestOrderResponse {
  id: number
  email: string
  guest_name: string
  total_amount: number
  status: string
  shipping_address: string
  zim_contact: string
  zim_contact_id: string // Added this field
  zim_name: string
  phone_number: string
  shipping_cost: number
  instructions?: string
  created_at: string
  order_number?: string
  order_items: Array<{
    id: number
    quantity: number
    price: number
    product?: {
      id: number
      name: string
      price: number
      image_url?: string
    }
    hamper?: {
      id: number
      name: string
      price: number
      image_url?: string
    }
  }>
  payment?: {
    id: number
    payment_method: string
    transaction_id?: string
    status: string
  }
}

export interface GuestOrderTrackingData {
  orderNumber: string
  email: string
}

// Create a guest order
export async function createGuestOrder(orderData: GuestOrderData): Promise<GuestOrderResponse> {
  try {
    console.log("Creating guest order with data:", orderData)
    const response = await axios.post("/guest/orders", orderData)
    console.log("Guest order created successfully:", response.data)
    return response.data
  } catch (error) {
    console.error("Error creating guest order:", error)
    throw error
  }
}

// Create Stripe checkout session for guest
export async function createGuestCheckoutSession(orderData: {
  items: Array<{
    product_id?: number
    hamper_id?: number
    quantity: number
  }>
  shipping_address: string
  zim_contact: string
  zim_contact_id: string // Added this field
  phone_number: string
  zim_name: string
  delivery_zone: number
  instructions?: string
  email: string
  guest_name: string
}): Promise<{ checkout_url: string; order_id: string }> {
  try {
    console.log("Creating guest checkout session with data:", orderData)
    const response = await axios.post("/guest/checkout/create-session", orderData)
    console.log("Guest checkout session created:", response.data)
    return {
      checkout_url: response.data.checkout_url,
      order_id: response.data.order_id.toString(),
    }
  } catch (error) {
    console.error("Error creating guest checkout session:", error)
    throw error
  }
}

// Get checkout session status
export async function getGuestCheckoutSessionStatus(sessionId: string): Promise<{
  status: string
  order?: GuestOrderResponse
  payment_status?: string
}> {
  try {
    console.log("Getting guest checkout session status for:", sessionId)
    const response = await axios.get(`/guest/checkout/session-status?session_id=${sessionId}`)
    console.log("Guest checkout session status response:", response.data)
    return response.data
  } catch (error) {
    console.error("Error getting guest checkout session status:", error)
    throw error
  }
}

// Track guest order
export async function trackGuestOrder(trackingData: GuestOrderTrackingData): Promise<GuestOrderResponse> {
  try {
    console.log("Tracking guest order with data:", trackingData)
    const response = await axios.post("/guest/orders/track", trackingData)
    console.log("Guest order tracking result:", response.data)
    return response.data.order
  } catch (error) {
    console.error("Error tracking guest order:", error)
    throw error
  }
}

// Cancel guest order
export async function cancelGuestOrder(orderData: GuestOrderTrackingData): Promise<{
  message: string
  order: GuestOrderResponse
}> {
  try {
    console.log("Cancelling guest order with data:", orderData)
    const response = await axios.post("/guest/orders/cancel", orderData)
    console.log("Guest order cancelled:", response.data)
    return response.data
  } catch (error) {
    console.error("Error cancelling guest order:", error)
    throw error
  }
}

// Get all guest orders (admin only)
export async function getAllGuestOrders(): Promise<GuestOrderResponse[]> {
  try {
    console.log("Fetching all guest orders for admin")
    const response = await axios.get("/guest/orders")
    console.log("Guest orders fetched successfully:", response.data)
    return response.data
  } catch (error) {
    console.error("Error fetching guest orders:", error)
    throw error
  }
}

// Update guest order status (admin only)
export async function updateGuestOrderStatus(orderId: number, status: string): Promise<GuestOrderResponse> {
  try {
    console.log(`Updating guest order ${orderId} status to:`, status)
    const response = await axios.put(`/guest/orders/${orderId}/status`, { status })
    console.log("Guest order status updated successfully:", response.data)
    return response.data
  } catch (error) {
    console.error("Error updating guest order status:", error)
    throw error
  }
}

// Validate guest checkout information (simplified - just return success)
export async function validateGuestCheckoutInfo(
  email: string,
  phone: string,
  address: string,
  zimContactId: string, // Added this parameter
): Promise<{ success: boolean; message?: string }> {
  // Simple client-side validation since there's no backend endpoint for this
  try {
    if (!email || !email.includes("@")) {
      return { success: false, message: "Please enter a valid email address" }
    }

    if (!phone || phone.length < 10) {
      return { success: false, message: "Please enter a valid phone number" }
    }

    if (!address || address.length < 10) {
      return { success: false, message: "Please enter a complete shipping address" }
    }

    if (!zimContactId || zimContactId.length < 5) {
      return { success: false, message: "Please enter a valid Zimbabwe contact ID number" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error validating guest checkout info:", error)
    return { success: false, message: "Validation failed" }
  }
}

// Get delivery estimate (simplified - return default values)
export async function getDeliveryEstimate(address: string): Promise<{
  minDays: number
  maxDays: number
}> {
  // Since there's no backend endpoint for this, return default estimate
  try {
    // You could add logic here based on address/location
    return { minDays: 3, maxDays: 7 }
  } catch (error) {
    console.error("Error getting delivery estimate:", error)
    return { minDays: 3, maxDays: 7 } // Default fallback
  }
}

// Create payment intent for guest (if needed for direct Stripe integration)
export async function createGuestPaymentIntent(
  amount: number,
  orderId: string,
  email: string,
): Promise<{ clientSecret: string }> {
  try {
    // This would need to be implemented in your Laravel backend if you want direct Stripe integration
    // For now, throw an error since this endpoint doesn't exist
    throw new Error("Direct payment intent creation not implemented. Use checkout session instead.")
  } catch (error) {
    console.error("Error creating guest payment intent:", error)
    throw error
  }
}
