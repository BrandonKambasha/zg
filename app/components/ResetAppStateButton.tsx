"use client"

import { useState, useRef, useEffect } from "react"
import { RefreshCw } from "lucide-react"
import { resetAppState, resetCartAndWishlist, resetAuthState } from "../lib/reset-app-state"

export default function ResetAppStateButton() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-1"
        title="Reset App State"
      >
        <RefreshCw className="h-5 w-5 text-gray-700" />
        <span className="hidden sm:inline text-sm">Reset</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1 animate-in fade-in slide-in-from-top-5 duration-200">
          <button
            onClick={() => {
              resetCartAndWishlist()
              setIsOpen(false)
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600"
          >
            Reset Cart & Wishlist
          </button>
          <button
            onClick={() => {
              resetAuthState()
              setIsOpen(false)
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600"
          >
            Reset Auth State
          </button>
          <button
            onClick={() => {
              resetAppState()
              setIsOpen(false)
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600"
          >
            Reset Everything
          </button>
        </div>
      )}
    </div>
  )
}

