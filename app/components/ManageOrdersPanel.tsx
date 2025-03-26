"use client"

import { useState, useEffect } from "react"
import { Loader2, Search, Filter, Eye } from "lucide-react"
import toast from "react-hot-toast"
import { getAllOrders, updateOrderStatus } from "../lib/api/orders"
import type { Order } from "../Types"
import AdminOrderModal from "./AdminOrderModal"

export function ManageOrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({})
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sortField, setSortField] = useState("created_at")
  const [sortDirection, setSortDirection] = useState("desc")

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [searchTerm, statusFilter, orders, sortField, sortDirection])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const data = await getAllOrders()
      // Sort orders by newest first by default
      setOrders((data || []).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      toast.error("Failed to load orders")
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
          order.user?.name?.toLowerCase().includes(term) ||
          order.user?.email?.toLowerCase().includes(term),
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
        const aName = a.user?.name || "Guest"
        const bName = b.user?.name || "Guest"
        comparison = aName.localeCompare(bName)
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

    setFilteredOrders(filtered)
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setIsUpdating((prev) => ({ ...prev, [orderId]: true }))

    try {
      await updateOrderStatus(orderId, newStatus)

      // Update the order in the local state
      setOrders((prev) => prev.map((order) => (order.id === Number(orderId) ? { ...order, status: newStatus } : order)))

      toast.success(`Order #${orderId} status updated to ${newStatus}`)
    } catch (error) {
      console.error("Failed to update order status:", error)
      toast.error("Failed to update order status")
    } finally {
      setIsUpdating((prev) => ({ ...prev, [orderId]: false }))
    }
  }

  const openOrderModal = (orderId: number) => {
    setSelectedOrderId(orderId)
    setIsModalOpen(true)
  }

  const closeOrderModal = () => {
    setIsModalOpen(false)
    // We don't reset the selectedOrderId immediately to avoid flickering during modal close animation
    setTimeout(() => {
      setSelectedOrderId(null)
    }, 300)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <p className="ml-2">Loading orders...</p>
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
              placeholder="Search orders..."
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
            <p className="text-gray-500">No orders found matching your criteria.</p>
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
                      Customer {sortField === "customer" && (sortDirection === "asc" ? "↑" : "↓")}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <p className="font-medium">{order.user?.name || "Guest"}</p>
                          <p className="text-xs">{order.user?.email || "N/A"}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.total_amount}</td>
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
                          </select>
                          {isUpdating[order.id.toString()] && (
                            <Loader2 className="animate-spin h-4 w-4 text-teal-600" />
                          )}
                          <button
                            onClick={() => openOrderModal(order.id)}
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

      {/* Admin Order Modal */}
      <AdminOrderModal orderId={selectedOrderId} isOpen={isModalOpen} onClose={closeOrderModal} />
    </div>
  )
}

