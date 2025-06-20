"use client"

import { useState, useEffect } from "react"
import { Loader2, Search, Filter, Eye } from "lucide-react"
import toast from "react-hot-toast"
import axios from "../lib/axios"

interface GuestOrder {
  id: number
  order_number?: string
  email: string
  guest_name: string
  total_amount: number
  status: string
  created_at: string
  shipping_address: string
  zim_contact: string
  zim_name: string
  phone_number: string
  shipping_cost: number
  instructions?: string
  order_items?: Array<{
    id: number
    product?: {
      id: number
      name: string
      price: number
    }
    hamper?: {
      id: number
      name: string
      price: number
    }
    quantity: number
    price: number
  }>
  zim_contact_id?: string
}

export function ManageGuestOrdersPanel() {
  const [orders, setOrders] = useState<GuestOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<GuestOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({})
  const [selectedOrder, setSelectedOrder] = useState<GuestOrder | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sortField, setSortField] = useState("created_at")
  const [sortDirection, setSortDirection] = useState("desc")

  useEffect(() => {
    fetchGuestOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [searchTerm, statusFilter, orders, sortField, sortDirection])

  const fetchGuestOrders = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get("/guest/orders")
      setOrders(
        (response.data || []).sort(
          (a: GuestOrder, b: GuestOrder) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
      )
    } catch (error) {
      console.error("Failed to fetch guest orders:", error)
      toast.error("Failed to load guest orders")
    } finally {
      setIsLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = [...orders]

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (order) =>
          order.id.toString().includes(term) ||
          order.guest_name?.toLowerCase().includes(term) ||
          order.email?.toLowerCase().includes(term) ||
          (order.order_number && order.order_number.toLowerCase().includes(term)),
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0

      if (sortField === "id") {
        comparison = a.id - b.id
      } else if (sortField === "created_at") {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else if (sortField === "total_amount") {
        comparison = a.total_amount - b.total_amount
      } else if (sortField === "status") {
        comparison = a.status.localeCompare(b.status)
      } else if (sortField === "customer") {
        comparison = a.guest_name.localeCompare(b.guest_name)
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

    setFilteredOrders(filtered)
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setIsUpdating((prev) => ({ ...prev, [orderId]: true }))

    try {
      await axios.put(`/guest/orders/${orderId}/status`, {
        status: newStatus,
      })

      // Update the order in the local state
      setOrders((prev) => prev.map((order) => (order.id === Number(orderId) ? { ...order, status: newStatus } : order)))

      toast.success(`Guest order #${orderId} status updated to ${newStatus}`)
    } catch (error) {
      console.error("Failed to update guest order status:", error)
      toast.error("Failed to update guest order status")
    } finally {
      setIsUpdating((prev) => ({ ...prev, [orderId]: false }))
    }
  }

  const openOrderModal = (order: GuestOrder) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  const closeOrderModal = () => {
    setIsModalOpen(false)
    setTimeout(() => {
      setSelectedOrder(null)
    }, 300)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <p className="ml-2">Loading guest orders...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search guest orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="abandoned">Abandoned</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-500">Sort by:</span>
              <select
                value={`${sortField}-${sortDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split("-")
                  setSortField(field)
                  setSortDirection(direction)
                }}
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
                <option value="id-desc">Order ID (High to Low)</option>
                <option value="id-asc">Order ID (Low to High)</option>
                <option value="total_amount-desc">Amount (High to Low)</option>
                <option value="total_amount-asc">Amount (Low to High)</option>
                <option value="status-asc">Status (A-Z)</option>
                <option value="customer-asc">Customer Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No guest orders found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setSortField("id")
                        setSortDirection(sortField === "id" && sortDirection === "desc" ? "asc" : "desc")
                      }}
                    >
                      Order ID {sortField === "id" && (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setSortField("customer")
                        setSortDirection(sortField === "customer" && sortDirection === "desc" ? "asc" : "desc")
                      }}
                    >
                      Guest Customer {sortField === "customer" && (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setSortField("created_at")
                        setSortDirection(sortField === "created_at" && sortDirection === "desc" ? "asc" : "desc")
                      }}
                    >
                      Date {sortField === "created_at" && (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setSortField("total_amount")
                        setSortDirection(sortField === "total_amount" && sortDirection === "desc" ? "asc" : "desc")
                      }}
                    >
                      Total {sortField === "total_amount" && (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setSortField("status")
                        setSortDirection(sortField === "status" && sortDirection === "desc" ? "asc" : "desc")
                      }}
                    >
                      Status {sortField === "status" && (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.order_number || `ZG-${String(order.id).padStart(6, "0")}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <p className="font-medium">{order.guest_name}</p>
                          <p className="text-xs">{order.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${order.total_amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === "delivered"
                              ? "bg-green-100 text-green-800"
                              : order.status === "shipped"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "processing"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : order.status === "cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : order.status === "abandoned"
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id.toString(), e.target.value)}
                            disabled={isUpdating[order.id.toString()]}
                            className="mr-2 border border-gray-300 rounded-md p-1 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="abandoned">Abandoned</option>
                          </select>
                          {isUpdating[order.id.toString()] && (
                            <Loader2 className="animate-spin h-4 w-4 text-teal-600" />
                          )}
                          <button
                            onClick={() => openOrderModal(order)}
                            className="text-teal-600 hover:text-teal-900 ml-3 flex items-center transition-colors"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Guest Order Modal */}
      {isModalOpen && selectedOrder && (
        <GuestOrderModal order={selectedOrder} isOpen={isModalOpen} onClose={closeOrderModal} />
      )}
    </div>
  )
}

// Guest Order Modal Component
function GuestOrderModal({
  order,
  isOpen,
  onClose,
}: {
  order: GuestOrder
  isOpen: boolean
  onClose: () => void
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              Guest Order #{order.order_number || `ZG-${String(order.id).padStart(6, "0")}`}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
              <div className="space-y-2">
                <p>
                  <strong>Name:</strong> {order.guest_name}
                </p>
                <p>
                  <strong>Email:</strong> {order.email}
                </p>
                <p>
                  <strong>Phone:</strong> {order.phone_number}
                </p>
                <p>
                  <strong>Zimbabwe Contact:</strong> {order.zim_name} ({order.zim_contact})
                </p>
                {order.zim_contact_id && (
                  <p>
                    <strong>Zimbabwe Contact ID:</strong> {order.zim_contact_id}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Order Details</h3>
              <div className="space-y-2">
                <p>
                  <strong>Status:</strong>
                  <span
                    className={`ml-2 px-2 py-1 rounded text-sm ${
                      order.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : order.status === "shipped"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "processing"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : order.status === "abandoned"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </p>
                <p>
                  <strong>Date:</strong> {new Date(order.created_at).toLocaleString()}
                </p>
                <p>
                  <strong>Total:</strong> ${order.total_amount}
                </p>
                <p>
                  <strong>Shipping Cost:</strong> ${order.shipping_cost}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
            <p className="bg-gray-50 p-3 rounded">{order.shipping_address}</p>
          </div>

          {order.instructions && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Special Instructions</h3>
              <p className="bg-gray-50 p-3 rounded">{order.instructions}</p>
            </div>
          )}

          {order.order_items && order.order_items.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Order Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Item</th>
                      <th className="px-4 py-2 text-center">Quantity</th>
                      <th className="px-4 py-2 text-right">Unit Price</th>
                      <th className="px-4 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.order_items.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-4 py-2">
                          {item.product ? (
                            <span>{item.product.name}</span>
                          ) : item.hamper ? (
                            <span>{item.hamper.name} (Hamper)</span>
                          ) : (
                            <span>Item not available</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center">{item.quantity}</td>
                        <td className="px-4 py-2 text-right">${item.price}</td>
                        <td className="px-4 py-2 text-right">${(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
