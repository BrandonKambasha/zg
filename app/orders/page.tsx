"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../hooks/useAuth"
import { getMyOrders } from "../lib/api/orders"
import type { Order } from "../Types"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/orders")
      return
    }

    const fetchOrders = async () => {
      try {
        const data = await getMyOrders()
        setOrders(data)
      } catch (error: any) {
        toast.error(error.message || "Failed to load orders")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null // Handled by useEffect redirect
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading your orders...</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
        <p className="text-gray-500 mb-6">You haven&apos;t placed any orders yet.</p>
        <Link href="/products" className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition">
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Your Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Order #{order.id}</p>
                <p className="text-sm text-gray-500">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium
                  ${
                    order.status === "delivered"
                      ? "bg-green-100 text-green-800"
                      : order.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
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

              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-3 flex justify-between">
              <Link href={`/orders/${order.id}`} className="text-green-600 hover:underline">
                View Order Details
              </Link>

              {order.status === "pending" && <button className="text-red-600 hover:underline">Cancel Order</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

