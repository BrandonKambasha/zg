"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X, Package, Calendar, CreditCard, Clock, User, MapPin, Phone, Mail, Truck } from "lucide-react"
import { getOrderById } from "../lib/api/orders"
import type { Order } from "../Types"
import { apiBaseUrl } from "../lib/axios"

interface AdminOrderModalProps {
  orderId: number | null
  isOpen: boolean
  onClose: () => void
}

export default function AdminOrderModal({ orderId, isOpen, onClose }: AdminOrderModalProps) {
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
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
          <h2 className="text-xl font-semibold text-gray-800">Order Details (Admin View)</h2>
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
                  <span className="text-sm text-gray-500">
                    Order #{order.id}
                    {order.id && ` (${order.id})`}
                  </span>
                </div>

                <div className="text-sm text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatDate(order.created_at)}</span>
                </div>
              </div>

              {/* Two column layout for admin view */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column - Customer & Order Info */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Customer information */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center mb-3">
                      <User className="h-5 w-5 text-teal-600 mr-2" />
                      <h3 className="text-sm font-medium text-gray-900">Customer Information</h3>
                    </div>

                    {order.user ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500">Name</p>
                          <p className="font-medium">{order.user.name}</p>
                        </div>
                        <div className="flex items-start">
                          <Mail className="h-4 w-4 text-gray-400 mt-0.5 mr-1.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="font-medium">{order.user.email}</p>
                          </div>
                        </div>
                        {order.user.phone_number && (
                          <div className="flex items-start">
                            <Phone className="h-4 w-4 text-gray-400 mt-0.5 mr-1.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500">Phone</p>
                              <p className="font-medium">{order.user.phone_number}</p>
                            </div>
                          </div>
                        )}
                        {order.user.zim_contact && (
                          <div className="flex items-start">
                            <Phone className="h-4 w-4 text-gray-400 mt-0.5 mr-1.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500">Zimbabwe Phone number</p>
                              <p className="font-medium">{order.user.zim_contact}</p>
                            </div>
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          <p>Customer ID: {order.user.id}</p>
                          <p>Account created: {new Date(order.user.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No customer information available</p>
                    )}
                  </div>

                  {/* Shipping information */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center mb-3">
                      <MapPin className="h-5 w-5 text-teal-600 mr-2" />
                      <h3 className="text-sm font-medium text-gray-900">Shipping Information</h3>
                    </div>

                    {order.shipping_address ? (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Shipping Address</p>
                        <p className="whitespace-pre-line">{order.shipping_address}</p>

                        {order.id > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-500">Shipping Cost</p>
                            <p className="font-medium">$5</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center text-amber-600">
                        <Truck className="h-4 w-4 mr-1.5" />
                        <p className="text-sm">No shipping address provided</p>
                      </div>
                    )}
                  </div>

                  {/* Payment information */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center mb-3">
                      <CreditCard className="h-5 w-5 text-teal-600 mr-2" />
                      <h3 className="text-sm font-medium text-gray-900">Payment Information</h3>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">Payment Method</p>
                        <p className="font-medium">{order.payment?.payment_method || "Credit Card"}</p>
                      </div>

                      {order.payment && (
                        <>
                          <div>
                            <p className="text-xs text-gray-500">Payment Status</p>
                            <p
                              className={`font-medium ${
                                order.payment.status === "completed"
                                  ? "text-green-600"
                                  : order.payment.status === "pending"
                                    ? "text-amber-600"
                                    : order.payment.status === "failed"
                                      ? "text-red-600"
                                      : ""
                              }`}
                            >
                              {order.payment.status.charAt(0).toUpperCase() + order.payment.status.slice(1)}
                            </p>
                          </div>

                          {order.payment.id && (
                            <div>
                              <p className="text-xs text-gray-500">Transaction ID</p>
                              <p className="text-sm font-mono">{order.payment.id}</p>
                            </div>
                          )}
                        </>
                      )}

                      <div>
                        <p className="text-xs text-gray-500">Total Amount</p>
                        <p className="font-medium text-lg">${formatPrice(order.total_amount)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column - Order Items */}
                <div className="lg:col-span-2">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center mb-3">
                      <Package className="h-5 w-5 text-teal-600 mr-2" />
                      <h3 className="text-sm font-medium text-gray-900">Order Items</h3>
                    </div>

                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
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
                                <p className="text-xs text-gray-500 mt-1">Product ID: {productInfo.product.id}</p>
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
                                <p className="text-xs text-gray-500 mt-1">Product ID: {item.product.id}</p>
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

                    {/* Order summary */}
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">${formatPrice(order.total_amount)}</span>
                      </div>

                      {order.total_amount > 0 && (
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-gray-600">Shipping</span>
                          <span className="font-medium">${formatPrice(order.total_amount)}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-2 text-lg font-bold">
                        <span>Total</span>
                        <span>${formatPrice(order.total_amount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order timeline/history would go here */}
                  <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center mb-3">
                      <Clock className="h-5 w-5 text-teal-600 mr-2" />
                      <h3 className="text-sm font-medium text-gray-900">Order Timeline</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="flex">
                        <div className="flex flex-col items-center mr-4">
                          <div className="rounded-full h-3 w-3 bg-green-500"></div>
                          <div className="h-full w-0.5 bg-gray-200"></div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Order Created</p>
                          <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                        </div>
                      </div>

                      <div className="flex">
                        <div className="flex flex-col items-center mr-4">
                          <div
                            className={`rounded-full h-3 w-3 ${order.status !== "pending" ? "bg-green-500" : "bg-gray-300"}`}
                          ></div>
                          <div className="h-full w-0.5 bg-gray-200"></div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Payment {order.payment?.status === "completed" ? "Completed" : "Pending"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.payment?.updated_at ? formatDate(order.payment.updated_at) : "Pending"}
                          </p>
                        </div>
                      </div>

                      <div className="flex">
                        <div className="flex flex-col items-center mr-4">
                          <div
                            className={`rounded-full h-3 w-3 ${order.status === "shipped" || order.status === "delivered" ? "bg-green-500" : "bg-gray-300"}`}
                          ></div>
                          <div className="h-full w-0.5 bg-gray-200"></div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Order Shipped</p>
                          <p className="text-xs text-gray-500">
                            {order.status === "shipped" || order.status === "delivered" ? "Shipped" : "Pending"}
                          </p>
                        </div>
                      </div>

                      <div className="flex">
                        <div className="flex flex-col items-center mr-4">
                          <div
                            className={`rounded-full h-3 w-3 ${order.status === "delivered" ? "bg-green-500" : "bg-gray-300"}`}
                          ></div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Order Delivered</p>
                          <p className="text-xs text-gray-500">
                            {order.status === "delivered" ? "Delivered" : "Pending"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
            <div>
              <button className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition mr-2">
                Cancel Order
              </button>
              <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition">
                Print Invoice
              </button>
            </div>
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

