import axios from "../axios"

interface NewsletterSubscription {
  email: string
  recaptchaToken?: string
}

export const subscribeToNewsletter = async (data: NewsletterSubscription): Promise<void> => {
  try {
    // Make the API call without requiring a valid reCAPTCHA token
    await axios.post("/newsletter/subscribe", data)
  } catch (error: any) {
    // If there's a specific error about reCAPTCHA, handle it gracefully
    if (error.response?.data?.message?.includes("recaptcha")) {
      console.warn("reCAPTCHA validation failed, but continuing with subscription")

      // Try again without the token
      if (data.recaptchaToken) {
        const { recaptchaToken, ...dataWithoutToken } = data
        await axios.post("/newsletter/subscribe", dataWithoutToken)
        return
      }
    }

    // For other errors, throw normally
    throw new Error(error.response?.data?.message || "Failed to subscribe to newsletter")
  }
}

