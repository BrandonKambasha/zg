"use client"

import type React from "react"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import axios from "../lib/axios"

interface GuestOrder {
  id: number
  order_number: string
  status: string
  total: number
  shipping_address: string
  created_at: string
  email: string
  first_name: string
  last_name: string
  items?: {
    id: number
    product_name: string
    quantity: number
    price: number
  }[]
}

export default function GuestOrderTrackingContent() {
  const searchParams = useSearchParams()
  const initialOrderNumber = searchParams.get("orderNumber") || ""

  const [orderNumber, setOrderNumber] = useState(initialOrderNumber)
  const [email, setEmail] = useState("")
  const [order, setOrder] = useState<GuestOrder | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    setSuccess(false)

    try {
      const response = await axios.post("/api/guest/orders/track", {
        orderNumber,
        email,
      })

      setOrder(response.data.order)
      setSuccess(true)
    } catch (err: any) {
      console.error("Error tracking order:", err)
      setError(err.response?.data?.message || "Failed to find your order. Please check your details.")
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  // Status badge color based on order status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Track Your Order</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Order Number*
              </label>
              <input
                type="text"
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address*
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors disabled:bg-gray-400"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Tracking...
                </span>
              ) : (
                "Track Order"
              )}
            </button>
          </form>
        </div>

        {success && order && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Information</h2>

            <div className="border-b pb-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Order Number</h3>
                  <p className="font-medium">{order.order_number}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date</h3>
                  <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Total</h3>
                  <p className="font-medium">${order.total.toFixed(2)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Order Status Timeline</h3>

              <div className="relative">
                <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>

                <div className="relative flex items-start mb-6">
                  <div className="flex items-center h-6">
                    <div className="relative z-10 w-6 h-6 flex items-center justify-center bg-green-500 rounded-full">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium">Order Placed</h4>
                    <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                </div>

                {/* Conditionally show other status steps based on current status */}
                {["processing", "shipped", "delivered"].includes(order.status.toLowerCase()) && (
                  <div className="relative flex items-start mb-6">
                    <div className="flex items-center h-6">
                      <div className="relative z-10 w-6 h-6 flex items-center justify-center bg-blue-500 rounded-full">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium">Processing</h4>
                      <p className="text-xs text-gray-500">Your order is being prepared</p>
                    </div>
                  </div>
                )}

                {["shipped", "delivered"].includes(order.status.toLowerCase()) && (
                  <div className="relative flex items-start mb-6">
                    <div className="flex items-center h-6">
                      <div className="relative z-10 w-6 h-6 flex items-center justify-center bg-purple-500 rounded-full">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium">Shipped</h4>
                      <p className="text-xs text-gray-500">Your order is on the way</p>
                    </div>
                  </div>
                )}

                {order.status.toLowerCase() === "delivered" && (
                  <div className="relative flex items-start">
                    <div className="flex items-center h-6">
                      <div className="relative z-10 w-6 h-6 flex items-center justify-center bg-green-500 rounded-full">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium">Delivered</h4>
                      <p className="text-xs text-gray-500">Your order has been delivered</p>
                    </div>
                  </div>
                )}

                {order.status.toLowerCase() === "cancelled" && (
                  <div className="relative flex items-start">
                    <div className="flex items-center h-6">
                      <div className="relative z-10 w-6 h-6 flex items-center justify-center bg-red-500 rounded-full">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium">Cancelled</h4>
                      <p className="text-xs text-gray-500">Your order has been cancelled</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {order.items && order.items.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Order Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">Product</th>
                        <th className="text-center py-3 px-2">Quantity</th>
                        <th className="text-right py-3 px-2">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="py-3 px-2">{item.product_name}</td>
                          <td className="text-center py-3 px-2">{item.quantity}</td>
                          <td className="text-right py-3 px-2">${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="text-center">
              <Link
                href="/products"
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
