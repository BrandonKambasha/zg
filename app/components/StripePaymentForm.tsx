"use client"

import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Loader2 } from "lucide-react"

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY as string)

interface StripePaymentFormProps {
  clientSecret: string
  onPaymentSuccess: () => void
}

export default function StripePaymentForm({ clientSecret, onPaymentSuccess }: StripePaymentFormProps) {
  const appearance = {
    theme: "stripe",
    variables: {
      colorPrimary: "#0f766e",
    },
  }

  const options = {
    clientSecret,
    appearance,
  }

  return (
    <div className="bg-white rounded-lg">
      {clientSecret && (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm onPaymentSuccess={onPaymentSuccess} />
        </Elements>
      )}
    </div>
  )
}

function CheckoutForm({ onPaymentSuccess }: { onPaymentSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!stripe) {
      return
    }

    // Check for payment intent status on page load
    const clientSecret = new URLSearchParams(window.location.search).get("payment_intent_client_secret")

    if (!clientSecret) {
      return
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case "succeeded":
          setMessage("Payment succeeded!")
          onPaymentSuccess()
          break
        case "processing":
          setMessage("Your payment is processing.")
          break
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.")
          break
        default:
          setMessage("Something went wrong.")
          break
      }
    })
  }, [stripe, onPaymentSuccess])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return
    }

    setIsLoading(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${window.location.origin}/checkout/confirmation`,
      },
    })

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message || "An unexpected error occurred.")
    } else {
      setMessage("An unexpected error occurred.")
    }

    setIsLoading(false)
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement id="payment-element" />

      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="w-full bg-teal-600 text-white py-3 rounded-md hover:bg-teal-700 transition disabled:opacity-70 flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin h-4 w-4 mr-2" />
            Processing...
          </>
        ) : (
          "Pay Now"
        )}
      </button>

      {/* Show any error or success messages */}
      {message && (
        <div
          className={`p-4 rounded-md ${message.includes("succeeded") ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
        >
          {message}
        </div>
      )}
    </form>
  )
}

