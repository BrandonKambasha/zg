"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { ChevronDown, Check, ArrowUpDown } from "lucide-react"

interface ProductSortProps {
  currentSort: string
  isMobile?: boolean
  onClose?: () => void
}

export default function ProductSort({ currentSort, isMobile = false, onClose }: ProductSortProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  // Sort options
  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "newest", label: "Newest" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "name_asc", label: "Name: A-Z" },
    { value: "name_desc", label: "Name: Z-A" },
  ]

  // Get the current sort option label
  const currentSortLabel = sortOptions.find((option) => option.value === currentSort)?.label || "Featured"

  // Handle sort change
  const handleSortChange = (sortValue: string) => {
    // Create a new URLSearchParams object from the current search params
    const params = new URLSearchParams(searchParams.toString())

    // Update or add the sort parameter
    if (sortValue === "featured") {
      params.delete("sort") // Remove sort parameter for default sorting
    } else {
      params.set("sort", sortValue)
    }

    // Navigate to the new URL
    router.push(`/products?${params.toString()}`)

    // Close the dropdown
    setIsOpen(false)

    // Call onClose if provided (for mobile)
    if (onClose) {
      onClose()
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && !(event.target as Element).closest(".sort-dropdown")) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Completely different button rendering for mobile vs desktop
  if (isMobile) {
    return (
      <div className="relative sort-dropdown">
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <ArrowUpDown className="h-3.5 w-3.5 text-gray-600" />
          <span>Sort</span>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
            <ul className="py-1" role="listbox">
              {sortOptions.map((option) => (
                <li
                  key={option.value}
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center justify-between ${
                    currentSort === option.value ? "bg-gray-50 text-teal-600" : ""
                  }`}
                  onClick={() => handleSortChange(option.value)}
                  role="option"
                  aria-selected={currentSort === option.value}
                >
                  {option.label}
                  {currentSort === option.value && <Check className="h-4 w-4 text-teal-600" />}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  // Desktop version
  return (
    <div className="relative sort-dropdown">
      <button
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>Sort by: {currentSortLabel}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          <ul className="py-1" role="listbox">
            {sortOptions.map((option) => (
              <li
                key={option.value}
                className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center justify-between ${
                  currentSort === option.value ? "bg-gray-50 text-teal-600" : ""
                }`}
                onClick={() => handleSortChange(option.value)}
                role="option"
                aria-selected={currentSort === option.value}
              >
                {option.label}
                {currentSort === option.value && <Check className="h-4 w-4 text-teal-600" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

