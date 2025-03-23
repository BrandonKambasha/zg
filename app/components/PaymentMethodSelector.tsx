"use client"

import { useState } from "react"
import { CreditCard, Truck } from "lucide-react"

interface PaymentMethodSelectorProps {
  onSelect: (method: string) => void
  isSubmitting: boolean
}

export default function PaymentMethodSelector({ onSelect, isSubmitting }: PaymentMethodSelectorProps) {
  const [paymentMethod, setPaymentMethod] = useState("credit_card")

  const handleMethodChange = (method: string) => {
    setPaymentMethod(method)
    onSelect(method)
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
                <CreditCard className="h-5 w-5 mr-2 text-gray-600" />
                <span>Credit/Debit Card</span>
              </label>
            </div>
          </div>

          <div
            className={`border rounded-md p-4 cursor-pointer transition ${
              paymentMethod === "paypal" ? "border-teal-600 bg-teal-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleMethodChange("paypal")}
          >
            <div className="flex items-center">
              <input
                type="radio"
                name="payment_method"
                id="paypal"
                checked={paymentMethod === "paypal"}
                onChange={() => handleMethodChange("paypal")}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
              />
              <label htmlFor="paypal" className="ml-2 flex items-center cursor-pointer">
                <div className="mr-2 text-blue-600 font-bold text-sm">
                  <span className="text-blue-800">Pay</span>
                  <span className="text-blue-500">Pal</span>
                </div>
                <span>PayPal</span>
              </label>
            </div>
          </div>

          <div
            className={`border rounded-md p-4 cursor-pointer transition ${
              paymentMethod === "pay_on_delivery"
                ? "border-teal-600 bg-teal-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleMethodChange("pay_on_delivery")}
          >
            <div className="flex items-center">
              <input
                type="radio"
                name="payment_method"
                id="pay_on_delivery"
                checked={paymentMethod === "pay_on_delivery"}
                onChange={() => handleMethodChange("pay_on_delivery")}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
              />
              <label htmlFor="pay_on_delivery" className="ml-2 flex items-center cursor-pointer">
                <Truck className="h-5 w-5 mr-2 text-gray-600" />
                <span>Pay on Delivery</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {paymentMethod === "credit_card" && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-sm">You'll be redirected to Stripe's secure payment page to complete your payment.</p>
          </div>
        </div>
      )}

      {paymentMethod === "paypal" && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-sm">You will be redirected to PayPal to complete your payment securely.</p>
          </div>
        </div>
      )}

      {paymentMethod === "pay_on_delivery" && (
        <div className="space-y-6">
          <div className="bg-amber-50 p-4 rounded-md">
            <p className="text-sm">
              You will pay for your order when it is delivered to your address. Please have the exact amount ready.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

