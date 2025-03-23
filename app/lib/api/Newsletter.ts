import axios from "../axios"

export const subscribeToNewsletter = async (data: {
  email: string
  recaptchaToken: string
}) => {
  try {
    const response = await axios.post("/newsletter/subscribe", data)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Subscription failed")
  }
}

export const unsubscribeFromNewsletter = async (data: {
  email: string
  recaptchaToken: string
}) => {
  try {
    const response = await axios.post("/newsletter/unsubscribe", data)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Unsubscription failed")
  }
}

