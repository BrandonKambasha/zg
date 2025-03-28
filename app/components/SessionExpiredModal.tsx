"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Suspense } from "react"

// Create a client component that safely uses useSearchParams
function SessionExpiredModalContent() {
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check URL parameters using window.location instead of useSearchParams
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("session") === "expired") {
      setIsVisible(true)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)

    // Remove the query parameter
    const url = new URL(window.location.href)
    url.searchParams.delete("session")
    window.history.replaceState({}, "", url.toString())
  }

  const handleLogin = () => {
    setIsVisible(false)
    router.push("/login")
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6 mx-4 animate-fade-in">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Session Expired</h2>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
          Your session has expired due to inactivity or an invalid authentication token. Please log in again to
          continue.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={handleLogin}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-teal-600 text-sm text-white rounded-md hover:bg-teal-700"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  )
}

// Export a wrapper component that uses Suspense
export default function SessionExpiredModal() {
  return (
    <Suspense fallback={null}>
      <SessionExpiredModalContent />
    </Suspense>
  )
}

