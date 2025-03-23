"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { getOrderById } from "../lib/api/orders"
import { apiBaseUrl } from "../lib/axios"
import { Clock, Package, Truck, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import OrderCancellation from "./OrderCancellation"

interface OrderDetailsProps {
  orderId: string
}

export default function OrderDetails({ orderId }: OrderDetailsProps) {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true)
        const data = await getOrderById(orderId)
        setOrder(data)
        setError(null)
      } catch (err: any) {
        setError(err.message || "Failed to load order details")
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "processing":
        return <Package className="h-5 w-5 text-blue-500" />
      case "shipped":
        return <Truck className="h-5 w-5 text-purple-500" />
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "abandoned":
        return <AlertCircle className="h-5 w-5 text-gray-500" />
      case "payment_failed":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
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
      case "abandoned":
        return "bg-gray-100 text-gray-800"
      case "payment_failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleOrderCancelled = () => {
    // Refresh the order data
    router.refresh()
  }

  // Function to ensure image URLs have the API prefix
  const getFullImageUrl = (url: string | undefined): string => {
    if (!url) return "/placeholder.svg"
    return url.startsWith("http") ? url : `${apiBaseUrl}${url}`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>{error}</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
        <p>Order not found</p>
      </div>
    )
  }

  // Check if order can be cancelled (only pending or processing orders)
  const canBeCancelled = ["pending", "processing"].includes(order.status)

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Order #{order.id}</h2>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
            <div className="flex items-center">
              {getStatusIcon(order.status)}
              <span className="ml-1 capitalize">{order.status}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Order Details</h3>
            <p className="text-sm text-gray-500">Placed on {formatDate(order.created_at)}</p>
          </div>
          
          {/* Order Items */}
          <div className="border border-gray-200 rounded-lg overflow-hidden mt-4">
            <div className="divide-y divide-gray-200">
              {order.orderItems?.map((item: any) => (
                <div key={item.id} className="flex items-center p-4">
                  <div className="h-16 w-16 relative flex-shrink-0">
                    <Image
                      src={getFullImageUrl(item.product?.image_url) || "/placeholder.svg"}
                      alt={item.product?.name || "Product"}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div className="ml-4 flex-grow">
                    <p className="font-medium">{item.product?.name || "Product"}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <div className="font-medium">${parseFloat(item.price).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>${parseFloat(order.total_amount).toFixed(2)}</span>
            </div>
            {order.shipping_cost && (
              <div className="flex justify-between mb-2">
                <span>Shipping</span>
                <span>${parseFloat(order.shipping_cost).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-medium text-lg pt-2 border-t border-gray-200 mt-2">
              <span>Total</span>
              <span>${parseFloat(order.total_amount).toFixed(2)}</span>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="mt-6">
            <h3 className="font-medium mb-2">Shipping Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>{order.shipping_address}</p>
              {order.zim_contact && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Zimbabwe Contact:</p>
                  <p>{order.zim_name}</p>
                  <p>{order.zim_contact}</p>
                </div>
              )}
            </div>
          </div>

          {/* Cancel Order Button - Only show for pending or processing orders */}
          {canBeCancelled && (
            <div className="mt-6 flex justify-end">
              <OrderCancellation 
                orderId={order.id.toString()} 
                onCancelled={handleOrderCancelled} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}