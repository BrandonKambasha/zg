"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Category } from "../Types"
import { Search, ChevronDown } from "lucide-react"

interface ProductFiltersProps {
  categories: Category[]
  selectedCategory?: number
}

export default function ClientSideProductFilters({ categories, selectedCategory }: ProductFiltersProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100])
  const [showCategories, setShowCategories] = useState(true)
  const [showPrice, setShowPrice] = useState(true)
  const [showRating, setShowRating] = useState(true)

  const handleCategoryClick = (categoryId: number) => {
    router.push(`/products?category=${categoryId}`)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?query=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = Number.parseInt(e.target.value)
    setPriceRange((prev) => {
      const newRange = [...prev] as [number, number]
      newRange[index] = value
      return newRange as [number, number]
    })
  }

  const handlePriceFilter = () => {
    // This would be implemented to filter by price range
    console.log(`Filter by price range: $${priceRange[0]} - $${priceRange[1]}`)
  }

  return (
    <div className="divide-y divide-gray-200">
      {/* Search filter */}
      <div className="py-4 px-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <button type="submit" className="sr-only">
            Search
          </button>
        </form>
      </div>

      {/* Categories filter */}
      <div className="py-4 px-4">
        <button
          className="flex justify-between items-center w-full text-left font-medium text-gray-900 mb-3"
          onClick={() => setShowCategories(!showCategories)}
        >
          Categories
          <ChevronDown className={`h-5 w-5 transition-transform ${showCategories ? "rotate-180" : ""}`} />
        </button>

        {showCategories && (
          <div className="space-y-2 mt-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            <div
              className={`flex items-center cursor-pointer py-1 px-2 rounded-md ${
                !selectedCategory ? "bg-teal-50 text-teal-700" : "hover:bg-gray-50"
              }`}
              onClick={() => router.push("/products")}
            >
              <span className="text-sm">All Products</span>
              {!selectedCategory && <span className="ml-auto text-xs text-teal-600">•</span>}
            </div>

            {categories.map((category) => (
              <div
                key={category.id}
                className={`flex items-center cursor-pointer py-1 px-2 rounded-md ${
                  selectedCategory === category.id ? "bg-teal-50 text-teal-700" : "hover:bg-gray-50"
                }`}
                onClick={() => handleCategoryClick(category.id)}
              >
                <span className="text-sm">{category.name}</span>
                {selectedCategory === category.id && <span className="ml-auto text-xs text-teal-600">•</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Price filter */}
      <div className="py-4 px-4">
        <button
          className="flex justify-between items-center w-full text-left font-medium text-gray-900 mb-3"
          onClick={() => setShowPrice(!showPrice)}
        >
          Price Range
          <ChevronDown className={`h-5 w-5 transition-transform ${showPrice ? "rotate-180" : ""}`} />
        </button>

        {showPrice && (
          <div className="mt-2">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-500">${priceRange[0]}</span>
              <span className="text-sm text-gray-500">${priceRange[1]}</span>
            </div>

            <div className="relative mb-4">
              <div className="absolute h-1 bg-gray-200 left-0 right-0 top-1/2 -translate-y-1/2 rounded-full"></div>
              <div
                className="absolute h-1 bg-teal-500 rounded-full"
                style={{
                  left: `${priceRange[0]}%`,
                  right: `${100 - priceRange[1]}%`,
                }}
              ></div>

              <input
                type="range"
                min="0"
                max="100"
                value={priceRange[0]}
                onChange={(e) => handlePriceChange(e, 0)}
                className="absolute w-full h-1 appearance-none bg-transparent pointer-events-auto"
              />

              <input
                type="range"
                min="0"
                max="100"
                value={priceRange[1]}
                onChange={(e) => handlePriceChange(e, 1)}
                className="absolute w-full h-1 appearance-none bg-transparent pointer-events-auto"
              />
            </div>

            <div className="flex space-x-2">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Min</label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={priceRange[0]}
                  onChange={(e) => handlePriceChange(e, 0)}
                  className="w-full p-1 text-sm border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Max</label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={priceRange[1]}
                  onChange={(e) => handlePriceChange(e, 1)}
                  className="w-full p-1 text-sm border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <button
              onClick={handlePriceFilter}
              className="mt-3 w-full py-1.5 bg-teal-600 text-white text-sm rounded-md hover:bg-teal-700 transition-colors"
            >
              Apply Filter
            </button>
          </div>
        )}
      </div>

      {/* Rating filter */}
      <div className="py-4 px-4">
        <button
          className="flex justify-between items-center w-full text-left font-medium text-gray-900 mb-3"
          onClick={() => setShowRating(!showRating)}
        >
          Customer Rating
          <ChevronDown className={`h-5 w-5 transition-transform ${showRating ? "rotate-180" : ""}`} />
        </button>

        {showRating && (
          <div className="space-y-2 mt-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded-md">
                <input
                  type="checkbox"
                  id={`rating-${rating}`}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label htmlFor={`rating-${rating}`} className="ml-2 flex items-center">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <svg
                      key={index}
                      className={`h-4 w-4 ${index < rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                  <span className="ml-1 text-sm text-gray-500">& Up</span>
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clear all filters */}
      <div className="py-4 px-4">
        <button
          onClick={() => router.push("/products")}
          className="w-full py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  )
}

