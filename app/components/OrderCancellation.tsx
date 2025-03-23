"use client"

import { useState } from "react"
import { AlertCircle, X } from 'lucide-react'
import { cancelOrder } from "../lib/api/orders"
import { handleCheckoutCancellation } from "../lib/api/stripe"
import toast from "react-hot-toast"

interface OrderCancellationProps {
  orderId: string
  isStripeCheckout?: boolean
  onCancelled?: () => void
}

export default function OrderCancellation({ orderId, isStripeCheckout = false, onCancelled }: OrderCancellationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleCancel = async () => {
    setIsLoading(true)
    try {
      if (isStripeCheckout) {
        await handleCheckoutCancellation(orderId)
      } else {
        await cancelOrder(orderId)
      }
      
      toast.success("Order cancelled successfully")
      setShowConfirmation(false)
      
      if (onCancelled) {
        onCancelled()
      }
    } catch (error: any) {
      console.error("Failed to cancel order:", error)
      toast.error(error.message || "Failed to cancel order")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirmation(true)}
        className="text-red-600 hover:text-red-800 text-sm font-medium"
      >
        Cancel Order
      </button>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowConfirmation(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Cancel Order</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Are you sure you want to cancel this order? This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                No, Keep Order
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Yes, Cancel Order"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}