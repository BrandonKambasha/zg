"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  CheckCircle,
  Package,
  ArrowRight,
  ShoppingBag,
  Calendar,
  MapPin,
  Truck,
  Star,
  MessageSquare,
  AlertCircle,
} from "lucide-react"
import { getGuestCheckoutSessionStatus } from "../../lib/api/guest"
import type { GuestOrderResponse } from "../../lib/api/guest"
import { apiBaseUrl } from "../../lib/axios"
import { motion } from "framer-motion"

export default function GuestCheckoutConfirmationContent() {
  const searchParams = useSearchParams()
  const [order, setOrder] = useState<GuestOrderResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const sessionId = searchParams.get("session_id")
        const orderId = searchParams.get("orderId")

        console.log("Confirmation page params:", { sessionId, orderId })

        if (!sessionId && !orderId) {
          setError("No order ID provided")
          setIsLoading(false)
          return
        }

        if (sessionId) {
          // Get order details using session ID
          const sessionStatus = await getGuestCheckoutSessionStatus(sessionId)
          console.log("Session status response:", sessionStatus)

          if (sessionStatus.order) {
            setOrder(sessionStatus.order)
          } else {
            setError("Order details not found")
          }
        } else {
          setError("Session ID not provided")
        }
      } catch (err: any) {
        console.error("Failed to fetch guest order details:", err)
        setError(err.message || "Failed to fetch order details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderDetails()
  }, [searchParams])

  // Function to ensure image URLs have the API prefix
  const getFullImageUrl = (url: string | undefined): string => {
    if (!url) return "/placeholder.svg?height=64&width=64"
    return url.startsWith("http") ? url : `${apiBaseUrl}${url}`
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Error Loading Order</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/products"
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition inline-flex items-center"
          >
            Continue Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    )
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
    return Number(price).toFixed(2)
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

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find your order details.</p>
          <Link
            href="/products"
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition inline-flex items-center"
          >
            Continue Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  // Calculate subtotal (total - shipping)
  const shippingCost = order.shipping_cost ?? 0
  const subtotal = order.total_amount - shippingCost

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Thank You for Your Order!</h1>
          <p className="text-gray-600 mb-2">
            Your order has been placed successfully. We've sent a confirmation email with your order details.
          </p>
          <p className="text-gray-600 mb-2">
            📩 Important: The email might land in your spam or junk folder, especially if it's your first time ordering
            with us — please check there to make sure you don't miss any updates!
          </p>
          <p className="text-gray-600">
            Order ID: <span className="font-medium">#{order.id}</span>
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Order Information</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="font-medium">{formatDate(order.created_at)}</p>
              </div>
            </div>
            <div className="flex items-start">
              <ShoppingBag className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-medium">#{order.id}</p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Customer Information</h3>
            <p className="text-gray-700">{order.guest_name}</p>
            <p className="text-gray-700">{order.email}</p>
            <p className="text-gray-700">{order.phone_number}</p>
          </div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start mb-2">
                <MapPin className="h-5 w-5 text-teal-600 mr-2 mt-0.5" />
                <h3 className="font-medium">Shipping Address</h3>
              </div>
              <p className="text-gray-700 whitespace-pre-line ml-7">{order.shipping_address}</p>

              {order.zim_contact && (
                <div className="mt-2 ml-7">
                  <p className="text-sm text-gray-500">Zimbabwe Contact:</p>
                  <p className="text-gray-700">
                    {order.zim_name || "Recipient"}: {order.zim_contact}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Order Items */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium mb-3">Items Ordered</h3>
            <div className="space-y-4">
              {order.orderItems && order.orderItems.length > 0 ? (
                order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mr-4">
                      {item.product?.image_url || item.hamper?.image_url ? (
                        <Image
                          src={getFullImageUrl(item.product?.image_url || item.hamper?.image_url)}
                          alt={item.product?.name || item.hamper?.name || "Product"}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover object-center"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-500">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {item.product?.name || item.hamper?.name || "Unknown Item"}
                        {item.hamper && <span className="ml-1 text-xs text-teal-600">(Hamper)</span>}
                      </h4>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${formatPrice(item.price * item.quantity)}</p>
                      <p className="text-sm text-gray-500">${formatPrice(item.price)} each</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No items found in this order.</p>
              )}
            </div>
          </div>

          {/* Order Total with Shipping Cost */}
          <div className="border-t border-gray-200 mt-6 pt-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <div className="flex items-center">
                  <Truck className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-gray-600">Shipping</span>
                </div>
                <span>${formatPrice(shippingCost)}</span>
              </div>

              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>${formatPrice(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 mb-8 flex items-center">
          <Package className="h-8 w-8 text-teal-600 mr-4 flex-shrink-0" />
          <div className="text-left">
            <h3 className="font-medium text-teal-800 mb-1">What's Next?</h3>
            <p className="text-teal-700 text-sm">
              We're preparing your order for shipment. You'll receive an email with tracking information once your order
              ships.
            </p>
          </div>
        </div>

        {/* Feedback Request Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center">
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6 text-center md:text-left">
              <div className="flex justify-center md:justify-start">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-6 w-6 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <h3 className="font-medium text-gray-800 mt-2 text-lg">How was your experience?</h3>
            </div>
            <div className="flex-grow">
              <p className="text-gray-700 text-center md:text-left mb-4">
                Your feedback helps us improve our products and service. We'd love to hear about your shopping
                experience!
              </p>
              <div className="flex justify-center md:justify-start">
                <Link
                  href="/feedback"
                  className="inline-flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors shadow-sm"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Share Your Feedback
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/guest-order-tracking"
            className="bg-teal-600 text-white px-6 py-3 rounded-md hover:bg-teal-700 transition text-center"
          >
            Track Your Order
          </Link>
          <Link
            href="/products"
            className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 transition flex items-center justify-center"
          >
            Continue Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
