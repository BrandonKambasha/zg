"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X, Package, Calendar, CreditCard, Clock } from "lucide-react"
import { getOrderById } from "../lib/api/orders"
import type { Order } from "../Types"
import { apiBaseUrl } from "../lib/axios"

interface OrderModalProps {
  orderId: number | null
  isOpen: boolean
  onClose: () => void
}

export default function OrderModal({ orderId, isOpen, onClose }: OrderModalProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails(orderId)
    }
  }, [isOpen, orderId])

  const fetchOrderDetails = async (id: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const orderData = await getOrderById(id.toString())
      setOrder(orderData)
    } catch (err: any) {
      console.error("Failed to fetch order details:", err)
      setError(err.message || "Failed to load order details")
    } finally {
      setIsLoading(false)
    }
  }

  // Function to ensure image URLs have the API prefix
  const getFullImageUrl = (url: string | undefined): string => {
    if (!url) return "/placeholder.svg"
    return url.startsWith("http") ? url : `${apiBaseUrl}${url}`
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Format price
  const formatPrice = (price: number) => {
    return price
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  // If modal is not open, don't render anything
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus:outline-none"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Modal header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Order Details</h2>
        </div>

        {/* Modal content */}
        <div className="px-6 py-4">
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent"></div>
              <p className="mt-2">Loading order details...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-red-500">{error}</p>
              <button onClick={onClose} className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">
                Close
              </button>
            </div>
          ) : order ? (
            <div className="space-y-6">
              {/* Order summary */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="text-sm text-gray-500">Order #{order.id}</span>
                </div>

                <div className="text-sm text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatDate(order.created_at)}</span>
                </div>
              </div>

              {/* Order information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="text-xs uppercase text-gray-500 font-medium mb-1">Order Status</h3>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-teal-600" />
                    <span className="font-medium text-gray-800 capitalize">{order.status}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs uppercase text-gray-500 font-medium mb-1">Order Date</h3>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-teal-600" />
                    <span className="font-medium text-gray-800">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs uppercase text-gray-500 font-medium mb-1">Payment Method</h3>
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-1 text-teal-600" />
                    <span className="font-medium text-gray-800">{order.payment?.payment_method || "Credit Card"}</span>
                  </div>
                </div>
              </div>

              {/* Customer information if available */}
              {order.user && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-xs uppercase text-gray-500 font-medium mb-2">Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{order.user.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{order.user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Order items */}
              <div>
                <h3 className="font-medium mb-3">Items Ordered</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="divide-y divide-gray-200">
                    {order.products && order.products.length > 0 ? (
                      order.products.map((productInfo, index) => (
                        <div key={index} className="flex items-start p-4">
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mr-4">
                            {productInfo.product.image_url ? (
                              <Image
                                src={getFullImageUrl(productInfo.product.image_url) || "/placeholder.svg"}
                                alt={productInfo.product.name}
                                width={64}
                                height={64}
                                className="h-full w-full object-cover object-center"
                              />
                            ) : (
                              <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{productInfo.product.name}</h4>
                            <p className="text-sm text-gray-500 mt-1">Qty: {productInfo.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${formatPrice(productInfo.price * productInfo.quantity)}</p>
                            <p className="text-sm text-gray-500">${formatPrice(productInfo.price)} each</p>
                          </div>
                        </div>
                      ))
                    ) : order.orderItems && order.orderItems.length > 0 ? (
                      // Fallback to orderItems if products array is not available
                      order.orderItems.map((item) => (
                        <div key={item.id} className="flex items-start p-4">
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mr-4">
                            {item.product?.image_url ? (
                              <Image
                                src={getFullImageUrl(item.product.image_url) || "/placeholder.svg"}
                                alt={item.product.name}
                                width={64}
                                height={64}
                                className="h-full w-full object-cover object-center"
                              />
                            ) : (
                              <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                            <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${formatPrice(item.price * item.quantity)}</p>
                            <p className="text-sm text-gray-500">${formatPrice(item.price)} each</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">No items found in this order.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Total</p>
                  <p>${formatPrice(order.total_amount)}</p>
                </div>
                {/* {order.shipping_address && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-1">Shipping Address</h3>
                    <p className="text-gray-700 whitespace-pre-line">{order.shipping_address}</p>
                  </div>
                )} */}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500">Order not found</p>
            </div>
          )}
        </div>

        {/* Modal footer */}
        {order && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

