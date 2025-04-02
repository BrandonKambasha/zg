"use client"

import { useState } from "react"
import { CreditCard, Apple, Smartphone } from "lucide-react"
import Image from "next/image";

interface PaymentMethodSelectorProps {
  onSelect: (method: string) => void
  isSubmitting: boolean
}

export default function PaymentMethodSelector({ onSelect, isSubmitting }: PaymentMethodSelectorProps) {
  const [paymentMethod, setPaymentMethod] = useState("credit_card")

  const handleMethodChange = (method: string) => {
    setPaymentMethod(method)
    onSelect("credit_card") // Always use credit_card as method since all go to Stripe
  }

  return (
    <div>
      <div className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            className={`border rounded-md p-4 cursor-pointer transition ${
              paymentMethod === "credit_card" ? "border-teal-600 bg-teal-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleMethodChange("credit_card")}
          >
            <div className="flex items-center">
              <input
                type="radio"
                name="payment_method"
                id="credit_card"
                checked={paymentMethod === "credit_card"}
                onChange={() => handleMethodChange("credit_card")}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
              />
              <label htmlFor="credit_card" className="ml-2 flex items-center cursor-pointer">
              <Image src="/images/visa.png" alt="Apple Pay" width={60} height={60} className="mr-2" />
                <span>Credit/Debit Card</span>
              </label>
            </div>
          </div>

          <div
            className={`border rounded-md p-4 cursor-pointer transition ${
              paymentMethod === "apple_pay" ? "border-teal-600 bg-teal-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleMethodChange("apple_pay")}
          >
            <div className="flex items-center">
              <input
                type="radio"
                name="payment_method"
                id="apple_pay"
                checked={paymentMethod === "apple_pay"}
                onChange={() => handleMethodChange("apple_pay")}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
              />
              <label htmlFor="apple_pay" className="ml-2 flex items-center cursor-pointer">
              <Image src="/images/apple.png" alt="Apple Pay" width={60} height={60} className="mr-2" />
              <span>Apple Pay</span>
              </label>
            </div>
          </div>

          <div
            className={`border rounded-md p-4 cursor-pointer transition ${
              paymentMethod === "google_pay" ? "border-teal-600 bg-teal-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleMethodChange("google_pay")}
          >
            <div className="flex items-center">
              <input
                type="radio"
                name="payment_method"
                id="google_pay"
                checked={paymentMethod === "google_pay"}
                onChange={() => handleMethodChange("google_pay")}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
              />
              <label htmlFor="google_pay" className="ml-2 flex items-center cursor-pointer">
              <Image src="/images/google.webp" alt="Apple Pay" width={50} height={50} className="mr-2" />
                <span>Google Pay</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-md">
          <p className="text-sm">
            You'll be redirected to Stripe's secure payment page to complete your payment.
            {paymentMethod === "apple_pay" &&   <>Apple Pay will be available on the payment page, <strong>if your device supports Apple Pay</strong></>}
            {paymentMethod === "google_pay" && <> Google Pay will be available on the payment page, <strong>if your device supports Google pay</strong></>}
          </p>
        </div>
      </div>
    </div>
  )
}

