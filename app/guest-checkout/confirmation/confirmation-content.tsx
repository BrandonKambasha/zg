"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import axios from "../../lib/axios"

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

export default function GuestCheckoutConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const [order, setOrder] = useState<GuestOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError("No order ID provided")
        setLoading(false)
        return
      }

      try {
        const response = await axios.get(`/api/guest/orders/${orderId}`)
        setOrder(response.data.order)
      } catch (err) {
        console.error("Error fetching order:", err)
        setError("Failed to load order details")
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-red-500 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h1 className="text-2xl font-bold mb-4">Error Loading Order</h1>
            <p className="text-gray-600 mb-6">{error || "Something went wrong"}</p>
            <Link
              href="/products"
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Thank You for Your Order!</h1>
          <p className="text-gray-600">Your order has been received and is being processed.</p>
        </div>

        <div className="border-t border-b py-4 mb-6">
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
              <p className="font-medium capitalize">{order.status}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Details</h2>

          {order.items && order.items.length > 0 ? (
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
          ) : (
            <p className="text-gray-500">No items found in this order.</p>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="mb-1">
              <span className="font-medium">Name:</span> {order.first_name} {order.last_name}
            </p>
            <p className="mb-1">
              <span className="font-medium">Email:</span> {order.email}
            </p>
            <p>
              <span className="font-medium">Address:</span> {order.shipping_address}
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <h3 className="text-blue-800 font-medium mb-2">Track Your Order</h3>
          <p className="text-blue-700 text-sm mb-2">
            You can track your order status using your order number and email address.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <span className="bg-white px-3 py-2 rounded border border-blue-200 text-sm font-mono flex-grow">
              {order.order_number}
            </span>
            <Link
              href={`/guest-order-tracking?orderNumber=${order.order_number}`}
              className="bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-md transition-colors"
            >
              Track Order
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/products"
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
