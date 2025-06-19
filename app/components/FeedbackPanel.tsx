"use client"

import { useState, useEffect } from "react"
import {
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  Search,
  ChevronDown,
  RefreshCw,
  ThumbsUp,
  HelpCircle,
  AlertTriangle,
  MessageCircleMore,
  X,
  User,
} from "lucide-react"
// Import types from the main Types file
import type { Feedback, FeedbackType, FeedbackStatus } from "../Types"
import { getFeedback, updateFeedbackStatus, deleteFeedback } from "../lib/api/feedback"

// Remove the local interface definitions since they're now imported from Types.ts

// Helper function to get icon for feedback type
const getFeedbackTypeIcon = (type: FeedbackType) => {
  switch (type) {
    case "suggestion":
      return <MessageCircleMore className="h-4 w-4 text-blue-500" />
    case "complaint":
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    case "question":
      return <HelpCircle className="h-4 w-4 text-purple-500" />
    case "praise":
      return <ThumbsUp className="h-4 w-4 text-green-500" />
    default:
      return <MessageSquare className="h-4 w-4 text-gray-500" />
  }
}

// Helper function to get badge color for feedback status
const getStatusBadgeClass = (status: FeedbackStatus) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "reviewed":
      return "bg-blue-100 text-blue-800"
    case "resolved":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

// Helper function to get status icon
const getStatusIcon = (status: FeedbackStatus) => {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4" />
    case "reviewed":
      return <CheckCircle className="h-4 w-4" />
    case "resolved":
      return <CheckCircle className="h-4 w-4" />
    default:
      return <AlertCircle className="h-4 w-4" />
  }
}

export function FeedbackPanel() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [filterType, setFilterType] = useState<FeedbackType | "all">("all")
  const [filterStatus, setFilterStatus] = useState<FeedbackStatus | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [adminNotes, setAdminNotes] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch feedback data
  const fetchFeedback = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getFeedback()
      setFeedback(data)
    } catch (err: any) {
      console.error("Failed to fetch feedback:", err)
      setError(err.message || "Failed to load feedback")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFeedback()
  }, [])

  // Filter feedback based on selected filters and search query
  const filteredFeedback = feedback.filter((item) => {
    // Apply type filter
    if (filterType !== "all" && item.type !== filterType) return false

    // Apply status filter
    if (filterStatus !== "all" && item.status !== filterStatus) return false

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        item.subject.toLowerCase().includes(query) ||
        item.message.toLowerCase().includes(query) ||
        item.user?.name.toLowerCase().includes(query) ||
        item.user?.email.toLowerCase().includes(query)
      )
    }

    return true
  })

  // Handle status update
  const handleStatusUpdate = async (status: FeedbackStatus) => {
    if (!selectedFeedback) return

    setIsUpdating(true)
    try {
      const updatedFeedback = await updateFeedbackStatus(selectedFeedback.id, status, adminNotes || undefined)

      // Update the feedback list with type-safe approach
      setFeedback((prevFeedback) =>
        prevFeedback.map((item) => (item.id === updatedFeedback.id ? updatedFeedback : item)),
      )

      // Update the selected feedback
      setSelectedFeedback(updatedFeedback)
    } catch (err: any) {
      console.error("Failed to update feedback status:", err)
      setError(err.message || "Failed to update status")
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle feedback deletion
  const handleDelete = async () => {
    if (!selectedFeedback) return

    if (!confirm("Are you sure you want to delete this feedback? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteFeedback(selectedFeedback.id)

      // Remove from feedback list
      setFeedback(feedback.filter((item) => item.id !== selectedFeedback.id))

      // Close the detail view
      setSelectedFeedback(null)
    } catch (err: any) {
      console.error("Failed to delete feedback:", err)
      setError(err.message || "Failed to delete feedback")
    } finally {
      setIsDeleting(false)
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent mb-3"></div>
        <p className="text-gray-500">Loading feedback...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
          <p>{error}</p>
        </div>
        <button
          onClick={fetchFeedback}
          className="inline-flex items-center bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </button>
      </div>
    )
  }

  if (feedback.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="bg-gray-50 inline-flex rounded-full p-3 mb-3">
          <MessageSquare className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No feedback yet</h3>
        <p className="text-gray-500 mb-4">
          There is no feedback from users yet. Feedback will appear here when users submit it.
        </p>
      </div>
    )
  }

  // If a feedback item is selected, show the detail view
  if (selectedFeedback) {
    return (
      <div>
        {/* Back button */}
        <button
          onClick={() => setSelectedFeedback(null)}
          className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-teal-600"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to list
        </button>

        {/* Feedback detail */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 sm:p-6">
            {/* Header with type and status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center">
                {getFeedbackTypeIcon(selectedFeedback.type)}
                <span className="ml-2 font-medium capitalize">{selectedFeedback.type}</span>
                <span
                  className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedFeedback.status)}`}
                >
                  {selectedFeedback.status}
                </span>
              </div>
              <div className="text-sm text-gray-500">{formatDate(selectedFeedback.created_at)}</div>
            </div>

            {/* Subject and message */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">{selectedFeedback.subject}</h3>
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-line text-gray-700">
                {selectedFeedback.message}
              </div>
            </div>

            {/* User info */}
            {selectedFeedback.user && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Submitted by</h4>
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedFeedback.user.name}</p>
                    <p className="text-sm text-gray-600">{selectedFeedback.user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Admin notes */}
            <div className="mb-6">
              <label htmlFor="admin_notes" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes
              </label>
              <textarea
                id="admin_notes"
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="Add notes about this feedback (only visible to admins)"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              ></textarea>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 border-t border-gray-200 pt-4">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700 mb-2">Update Status</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusUpdate("pending")}
                    disabled={isUpdating || selectedFeedback.status === "pending"}
                    className={`px-3 py-2 rounded-lg text-sm flex items-center ${
                      selectedFeedback.status === "pending"
                        ? "bg-yellow-100 text-yellow-800 cursor-default"
                        : "bg-gray-100 hover:bg-yellow-100 hover:text-yellow-800"
                    }`}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Pending
                  </button>
                  <button
                    onClick={() => handleStatusUpdate("reviewed")}
                    disabled={isUpdating || selectedFeedback.status === "reviewed"}
                    className={`px-3 py-2 rounded-lg text-sm flex items-center ${
                      selectedFeedback.status === "reviewed"
                        ? "bg-blue-100 text-blue-800 cursor-default"
                        : "bg-gray-100 hover:bg-blue-100 hover:text-blue-800"
                    }`}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Reviewed
                  </button>
                  <button
                    onClick={() => handleStatusUpdate("resolved")}
                    disabled={isUpdating || selectedFeedback.status === "resolved"}
                    className={`px-3 py-2 rounded-lg text-sm flex items-center ${
                      selectedFeedback.status === "resolved"
                        ? "bg-green-100 text-green-800 cursor-default"
                        : "bg-gray-100 hover:bg-green-100 hover:text-green-800"
                    }`}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Resolved
                  </button>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Actions</div>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-3 py-2 rounded-lg text-sm bg-red-50 text-red-600 hover:bg-red-100 flex items-center"
                >
                  {isDeleting ? (
                    <>
                      <div className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-1" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main feedback list view
  return (
    <div>
      {/* Filters and search */}
      <div className="mb-6 bg-gray-50 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Type filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FeedbackType | "all")}
            >
              <option value="all">All Types</option>
              <option value="suggestion">Suggestions</option>
              <option value="complaint">Complaints</option>
              <option value="question">Questions</option>
              <option value="praise">Praise</option>
              <option value="other">Other</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>

          {/* Status filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FeedbackStatus | "all")}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="search"
              className="block w-full p-2 pl-9 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-teal-500 focus:border-teal-500"
              placeholder="Search feedback..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Refresh button */}
          <button
            onClick={fetchFeedback}
            className="inline-flex items-center justify-center p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50"
            aria-label="Refresh feedback"
          >
            <RefreshCw className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Feedback list */}
      {filteredFeedback.length > 0 ? (
        <div className="space-y-3">
          {filteredFeedback.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedFeedback(item)
                setAdminNotes(item.admin_notes || "")
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="mr-3 mt-1">{getFeedbackTypeIcon(item.type)}</div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">{item.subject}</h4>
                    <p className="text-sm text-gray-500 line-clamp-2">{item.message}</p>
                    {item.user && (
                      <p className="text-xs text-gray-500 mt-2">
                        From: {item.user.name} ({item.user.email})
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(item.status)}`}
                  >
                    {item.status}
                  </span>
                  <span className="text-xs text-gray-500 mt-2">{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center bg-gray-50 rounded-lg">
          <div className="bg-white inline-flex rounded-full p-3 mb-3 shadow-sm">
            <AlertCircle className="h-6 w-6 text-yellow-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No matching feedback</h3>
          <p className="text-gray-500 mb-4 max-w-md mx-auto">
            No feedback matches your current search or filter criteria. Try adjusting your filters.
          </p>
          <button
            onClick={() => {
              setFilterType("all")
              setFilterStatus("all")
              setSearchQuery("")
            }}
            className="inline-flex items-center bg-teal-600 text-white px-5 py-2.5 rounded-lg hover:bg-teal-700 transition-colors shadow-md text-sm"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}
