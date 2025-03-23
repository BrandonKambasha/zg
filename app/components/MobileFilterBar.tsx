"use client"

import { Filter, ArrowUpDown } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

interface MobileFilterBarProps {
  totalProducts: number
  currentSort: string
}

export default function MobileFilterBar({ totalProducts, currentSort }: MobileFilterBarProps) {
  const [isSortOpen, setIsSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

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
    setIsSortOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSortOpen && sortRef.current && !sortRef.current.contains(event.target as Element)) {
        setIsSortOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isSortOpen])

  return (
    <div className="flex items-center space-x-2">
      {/* Mobile Filter Button */}
      <button
        id="mobile-filter-button"
        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm"
        aria-label="Open filters"
      >
        <Filter className="h-3.5 w-3.5 text-gray-600" />
        <span>Filters</span>
      </button>

      {/* Mobile Sort Button */}
      <div className="relative" ref={sortRef}>
        <button
          onClick={() => setIsSortOpen(!isSortOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm"
          aria-label="Sort products"
          aria-expanded={isSortOpen}
        >
          <ArrowUpDown className="h-3.5 w-3.5 text-gray-600" />
          <span>Sort</span>
        </button>

        {/* Sort Dropdown */}
        {isSortOpen && (
          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
            <ul className="py-1" role="listbox">
              {sortOptions.map((option) => (
                <li
                  key={option.value}
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                    currentSort === option.value ? "bg-gray-50 text-teal-600" : ""
                  }`}
                  onClick={() => handleSortChange(option.value)}
                  role="option"
                  aria-selected={currentSort === option.value}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

