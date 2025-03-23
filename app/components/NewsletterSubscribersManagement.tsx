"use client"

import type React from "react"

import { useState, useEffect } from "react"
import axios from "../lib/axios"
import { Loader2, Download, Search, Trash2, RefreshCw } from "lucide-react"
import toast from "react-hot-toast"

interface Subscriber {
  id: number
  email: string
  is_active: boolean
  subscribed_at: string
  unsubscribed_at: string | null
  created_at: string
  updated_at: string
}

interface PaginatedResponse {
  current_page: number
  data: Subscriber[]
  from: number
  last_page: number
  per_page: number
  to: number
  total: number
}

export function NewsletterSubscribersManagement() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState<boolean | null>(true) // Default to active subscribers
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalSubscribers, setTotalSubscribers] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)

  useEffect(() => {
    fetchSubscribers()
  }, [currentPage, activeFilter])

  const fetchSubscribers = async (search = searchTerm) => {
    setIsLoading(true)
    setError("")

    try {
      let url = `/newsletter/subscribers?page=${currentPage}&per_page=15`

      if (activeFilter !== null) {
        url += `&active=${activeFilter}`
      }

      if (search) {
        url += `&search=${encodeURIComponent(search)}`
      }

      const response = await axios.get<PaginatedResponse>(url)
      setSubscribers(response.data.data)
      setTotalPages(response.data.last_page)
      setTotalSubscribers(response.data.total)
    } catch (error: any) {
      console.error("Error fetching subscribers:", error)
      setError(error.response?.data?.message || "Failed to load subscribers")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page when searching
    fetchSubscribers(searchTerm)
  }

  const exportSubscribers = async () => {
    setIsExporting(true)

    try {
      let url = `/newsletter/subscribers/export`

      if (activeFilter !== null) {
        url += `?active=${activeFilter}`
      }

      const response = await axios.post(url, {}, { responseType: "blob" })

      // Create a download link
      const blob = new Blob([response.data], { type: "text/csv" })
      const url2 = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url2
      link.setAttribute("download", `newsletter_subscribers_${new Date().toISOString().split("T")[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success("Subscribers exported successfully")
    } catch (error) {
      console.error("Error exporting subscribers:", error)
      toast.error("Failed to export subscribers")
    } finally {
      setIsExporting(false)
    }
  }

  const deleteSubscriber = async (id: number) => {
    if (!confirm("Are you sure you want to delete this subscriber? This action cannot be undone.")) {
      return
    }

    setIsDeleting(id)

    try {
      await axios.delete(`/newsletter/subscribers/${id}`)
      setSubscribers(subscribers.filter((sub) => sub.id !== id))
      toast.success("Subscriber deleted successfully")
    } catch (error) {
      console.error("Error deleting subscriber:", error)
      toast.error("Failed to delete subscriber")
    } finally {
      setIsDeleting(null)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <form onSubmit={handleSearch} className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => setActiveFilter(true)}
              className={`px-3 py-2 text-sm ${
                activeFilter === true ? "bg-teal-600 text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveFilter(false)}
              className={`px-3 py-2 text-sm ${
                activeFilter === false ? "bg-teal-600 text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              Inactive
            </button>
            <button
              onClick={() => setActiveFilter(null)}
              className={`px-3 py-2 text-sm ${
                activeFilter === null ? "bg-teal-600 text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              All
            </button>
          </div>

          <button
            onClick={() => fetchSubscribers()}
            className="p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-md"
            title="Refresh"
          >
            <RefreshCw className="h-5 w-5" />
          </button>

          <button
            onClick={exportSubscribers}
            disabled={isExporting}
            className="flex items-center px-3 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors disabled:opacity-70"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </>
            )}
          </button>
        </div>
      </div>

      {isLoading && subscribers.length === 0 ? (
        <div className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading subscribers...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => fetchSubscribers()}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : subscribers.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-600">{searchTerm ? "No subscribers match your search." : "No subscribers found."}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscribed At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unsubscribed At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{subscriber.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        subscriber.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {subscriber.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(subscriber.subscribed_at)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(subscriber.unsubscribed_at)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => deleteSubscriber(subscriber.id)}
                      disabled={isDeleting === subscriber.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      {isDeleting === subscriber.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{subscribers.length}</span> of{" "}
            <span className="font-medium">{totalSubscribers}</span> subscribers
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 border border-gray-300 rounded-md text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-600">Total Subscribers: {totalSubscribers}</div>
      </div>
    </div>
  )
}

