"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle, Package, ArrowRight, ShoppingBag, Calendar, MapPin, Truck } from "lucide-react"
import { useCart } from "../../hooks/useCart"
import { getLatestOrder } from "../../lib/api/orders"
import type { Order, OrderItem } from "../../Types"
import { apiBaseUrl } from "../../lib/axios"

export default function OrderConfirmationPage() {
  const router = useRouter()
  const { clearCart } = useCart()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [cartCleared, setCartCleared] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      // Clear the cart immediately to ensure it's emptied
      if (!cartCleared) {
        clearCart()
        setCartCleared(true)
        // Store in session storage that order was completed
        sessionStorage.setItem("orderCompleted", "true")
      }

      try {
        // Wait a moment to ensure the order is saved in the database
        setTimeout(async () => {
          // Get the most recent order for this user
          const latestOrder = await getLatestOrder()
          if (latestOrder) {
            console.log("Latest order:", latestOrder)
            setOrder(latestOrder)
          } else {
            setError("Could not find your order details")
          }
          setIsLoading(false)
        }, 1000)
      } catch (err: any) {
        console.error("Failed to fetch order details:", err)
        setError(err.message || "Failed to fetch order details")
        setIsLoading(false)
      }
    }

    fetchOrderDetails()
  }, [clearCart, cartCleared])

  // Function to ensure image URLs have the API prefix
  const getFullImageUrl = (url: string | undefined): string => {
    if (!url) return "/placeholder.svg"
    return url.startsWith("http") ? url : `${apiBaseUrl}${url}`
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <span className="ml-2">Processing your order...</span>
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

  // Check if there are any items to display
  const hasProducts = order?.products && order.products.length > 0
  const hasHampers = order?.hampers && order.hampers.length > 0
  const hasOrderItems = order?.orderItems && order.orderItems.length > 0
  const hasAnyItems = hasProducts || hasHampers || hasOrderItems

  // Calculate subtotal (total - shipping)
  const shippingCost = order?.shipping_cost ?? 0
  const subtotal = order ? order.total_amount - shippingCost : 0

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
            📩 Important: The email might land in your spam or junk folder, especially if its your first time ordering with us — please check there to make sure you dont miss any updates!
          </p>
          {order && (
            <p className="text-gray-600">
              Order ID: <span className="font-medium">#{order.id}</span>
            </p>
          )}
        </div>

        {error && !order && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 mb-8">
            <p>We're having trouble retrieving your order details, but your order has been processed successfully.</p>
          </div>
        )}

        {order && (
          <>
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
                  {/* Products */}
                  {hasProducts &&
                    order?.products?.map((productInfo, index) => (
                      <div key={index} className="flex items-center">
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
                              <span className="text-xs text-gray-500">No image</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{productInfo.product.name}</h4>
                          <p className="text-sm text-gray-500">Qty: {productInfo.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${formatPrice(productInfo.price * productInfo.quantity)}</p>
                          <p className="text-sm text-gray-500">${formatPrice(productInfo.price)} each</p>
                        </div>
                      </div>
                    ))}

                  {/* Hampers */}
                  {hasHampers &&
                    order?.hampers?.map((hamperInfo, index) => (
                      <div key={`hamper-${index}`} className="flex items-center">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mr-4">
                          {hamperInfo.hamper.image_url ? (
                            <Image
                              src={getFullImageUrl(hamperInfo.hamper.image_url) || "/placeholder.svg"}
                              alt={hamperInfo.hamper.name}
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
                            {hamperInfo.hamper.name}
                            <span className="ml-1 text-xs text-teal-600">(Hamper)</span>
                          </h4>
                          <p className="text-sm text-gray-500">Qty: {hamperInfo.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${formatPrice(hamperInfo.price * hamperInfo.quantity)}</p>
                          <p className="text-sm text-gray-500">${formatPrice(hamperInfo.price)} each</p>
                        </div>
                      </div>
                    ))}

                  {/* Fallback to orderItems if products and hampers arrays are not available */}
                  {!hasProducts &&
                    !hasHampers &&
                    hasOrderItems &&
                    order.orderItems.map((item: OrderItem) => (
                      <div key={item.id} className="flex items-center">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mr-4">
                          {item.product?.image_url ? (
                            <Image
                              src={getFullImageUrl(item.product.image_url) || "/placeholder.svg"}
                              alt={item.product.name}
                              width={64}
                              height={64}
                              className="h-full w-full object-cover object-center"
                            />
                          ) : item.hamper?.image_url ? (
                            <Image
                              src={getFullImageUrl(item.hamper.image_url) || "/placeholder.svg"}
                              alt={item.hamper.name}
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
                            {item.product ? item.product.name : item.hamper ? item.hamper.name : "Unknown Item"}
                            {item.hamper && <span className="ml-1 text-xs text-teal-600">(Hamper)</span>}
                          </h4>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${formatPrice(item.price * item.quantity)}</p>
                          <p className="text-sm text-gray-500">${formatPrice(item.price)} each</p>
                        </div>
                      </div>
                    ))}

                  {/* No items message - only show if there are no items of any kind */}
                  {!hasAnyItems && <p className="text-gray-500">No items found in this order.</p>}
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
                  We're preparing your order for shipment. You'll receive an email with tracking information once your
                  order ships.
                </p>
              </div>
            </div>
          </>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/account"
            className="bg-teal-600 text-white px-6 py-3 rounded-md hover:bg-teal-700 transition text-center"
          >
            View Order History
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

