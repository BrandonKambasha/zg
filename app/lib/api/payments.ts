import axios from "../axios"

interface PaymentIntentData {
  order_id: number
}

export const createPaymentIntent = async (data: PaymentIntentData): Promise<{ clientSecret: string }> => {
  try {
    const response = await axios.post("/stripe/create-payment-intent", data)
    return {
      clientSecret: response.data.clientSecret,
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create payment intent")
  }
}

