"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../../hooks/useAuth"
import { getOrderById } from "../../lib/api/orders"
import type { Order } from "../../Types"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/orders/" + params.id)
      return
    }

    const fetchOrder = async () => {
      try {
        const data = await getOrderById(params.id)
        setOrder(data)
      } catch (error: any) {
        toast.error(error.message || "Failed to load order")
        router.push("/orders")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [isAuthenticated, router, params.id])

  if (!isAuthenticated || isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading order details...</p>
      </div>
    )
  }

  if (!order) {
    return null
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/orders" className="text-green-600 hover:underline mr-4">
          ← Back to Orders
        </Link>
        <h1 className="text-2xl font-bold">Order #{order.id}</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4">
              <h2 className="font-medium">Order Items</h2>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <Link href={`/products/${item.product.id}`} className="font-medium hover:text-green-600">
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p>${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4">
              <h2 className="font-medium">Shipping Information</h2>
            </div>

            <div className="p-6">
              <p className="mb-2">
                <span className="font-medium">Address:</span> {order.user.location || "No address provided"}
              </p>
              <p>
                <span className="font-medium">Phone:</span> {order.user.phone_number || "No phone number provided"}
              </p>
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4">
              <h2 className="font-medium">Order Summary</h2>
            </div>

            <div className="p-6">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Order Date</span>
                  <span>{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Order Status</span>
                  <span
                    className={`
                    ${
                      order.status === "delivered"
                        ? "text-green-600"
                        : order.status === "cancelled"
                          ? "text-red-600"
                          : "text-blue-600"
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                {order.payment && (
                  <div className="flex justify-between">
                    <span>Payment Status</span>
                    <span
                      className={`
                      ${
                        order.payment.status === "completed"
                          ? "text-green-600"
                          : order.payment.status === "failed"
                            ? "text-red-600"
                            : "text-blue-600"
                      }`}
                    >
                      {order.payment.status.charAt(0).toUpperCase() + order.payment.status.slice(1)}
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${order.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>$0.00</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {order.status === "pending" && (
            <div className="mt-6">
              <button className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition">
                Cancel Order
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

