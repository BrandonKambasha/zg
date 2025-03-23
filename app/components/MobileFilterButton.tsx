"use client"

import { Filter } from "lucide-react"

interface MobileFilterButtonProps {
  activeFiltersCount: number
}

export default function MobileFilterButton({ activeFiltersCount = 0 }: MobileFilterButtonProps) {
  return (
    <button
      id="mobile-filter-button"
      className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm"
      aria-label="Open filters"
    >
      <Filter className="h-3.5 w-3.5 text-gray-600" />
      <span>Filters</span>
      {activeFiltersCount > 0 && (
        <span className="flex items-center justify-center h-5 w-5 bg-teal-600 text-white text-xs rounded-full">
          {activeFiltersCount}
        </span>
      )}
    </button>
  )
}

