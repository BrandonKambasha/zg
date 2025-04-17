"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { Category } from "../Types"
import { Search, ChevronDown, X, Sliders, Check } from "lucide-react"

interface ProductFiltersProps {
  categories: Category[]
  selectedCategory?: number
  minPrice?: number
  maxPrice?: number
  initialQuery?: string
}

export default function ProductFilters({
  categories,
  selectedCategory,
  minPrice = 0,
  maxPrice = 1000,
  initialQuery = "",
}: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get initial values from URL params
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [priceRange, setPriceRange] = useState<[number, number]>([
    searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : minPrice,
    searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : maxPrice,
  ])
  const [selectedRating, setSelectedRating] = useState<number | null>(
    searchParams.get("rating") ? Number(searchParams.get("rating")) : null,
  )
  const [showCategories, setShowCategories] = useState(true)
  const [showPrice, setShowPrice] = useState(true)
  const [showRating, setShowRating] = useState(true)
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  // Mobile collapsible sections
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(true)
  const [mobilePriceOpen, setMobilePriceOpen] = useState(true)

  // Track filter changes for mobile apply button
  const [hasFilterChanges, setHasFilterChanges] = useState(false)
  const initialFiltersRef = useRef({
    query: initialQuery,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    rating: selectedRating,
    category: selectedCategory,
  })

  // Current filter values for mobile apply button
  const currentFiltersRef = useRef({
    query: searchQuery,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    rating: selectedRating,
    category: selectedCategory,
  })

  // Handle mobile filter button click
  useEffect(() => {
    const filterButton = document.getElementById("mobile-filter-button")
    if (filterButton) {
      filterButton.addEventListener("click", (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsFilterDrawerOpen(true)
        document.body.style.overflow = "hidden" // Prevent scrolling when drawer is open

        // Reset current filters ref when opening drawer
        currentFiltersRef.current = {
          query: searchInputRef.current?.value || searchQuery,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          rating: selectedRating,
          category: selectedCategory,
        }

        // No changes yet
        setHasFilterChanges(false)
      })

      // Add touch event handler
      filterButton.addEventListener(
        "touchstart",
        (e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsFilterDrawerOpen(true)
          document.body.style.overflow = "hidden"

          currentFiltersRef.current = {
            query: searchInputRef.current?.value || searchQuery,
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
            rating: selectedRating,
            category: selectedCategory,
          }

          setHasFilterChanges(false)
        },
        { passive: false },
      )
    }

    // Close drawer when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node) && isFilterDrawerOpen) {
        closeDrawer()
      }
    }

    // Close drawer on escape key
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFilterDrawerOpen) {
        closeDrawer()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscKey)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscKey)
      document.body.style.overflow = "" // Reset overflow when component unmounts
    }
  }, [isFilterDrawerOpen, searchQuery, priceRange, selectedRating, selectedCategory])

  // Update state when URL params change
  useEffect(() => {
    const query = searchParams.get("query")
    if (query !== null) {
      setSearchQuery(query)
      // Also update the ref value if the input exists
      if (searchInputRef.current) {
        searchInputRef.current.value = query
      }
    }

    const urlMinPrice = searchParams.get("minPrice")
    const urlMaxPrice = searchParams.get("maxPrice")

    if (urlMinPrice !== null || urlMaxPrice !== null) {
      setPriceRange([urlMinPrice ? Number(urlMinPrice) : minPrice, urlMaxPrice ? Number(urlMaxPrice) : maxPrice])
    }

    const rating = searchParams.get("rating")
    if (rating !== null) {
      setSelectedRating(Number(rating))
    }

    // Update initial filters ref when URL changes
    initialFiltersRef.current = {
      query: query || "",
      minPrice: urlMinPrice ? Number(urlMinPrice) : minPrice,
      maxPrice: urlMaxPrice ? Number(urlMaxPrice) : maxPrice,
      rating: rating ? Number(rating) : null,
      category: selectedCategory,
    }
  }, [searchParams, minPrice, maxPrice, selectedCategory])

  // Check for filter changes
  useEffect(() => {
    if (isFilterDrawerOpen) {
      const currentFilters = {
        query: searchInputRef.current?.value || searchQuery,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        rating: selectedRating,
        category: selectedCategory,
      }

      currentFiltersRef.current = currentFilters

      // Compare with initial filters
      const hasChanges =
        currentFilters.query !== initialFiltersRef.current.query ||
        currentFilters.minPrice !== initialFiltersRef.current.minPrice ||
        currentFilters.maxPrice !== initialFiltersRef.current.maxPrice ||
        currentFilters.rating !== initialFiltersRef.current.rating ||
        currentFilters.category !== initialFiltersRef.current.category

      setHasFilterChanges(hasChanges)
    }
  }, [isFilterDrawerOpen, searchQuery, priceRange, selectedRating, selectedCategory])

  const closeDrawer = () => {
    setIsFilterDrawerOpen(false)
    document.body.style.overflow = "" // Re-enable scrolling
  }

  // Build URL with current filters
  const buildFilterUrl = (params: {
    category?: number
    query?: string
    minPrice?: number
    maxPrice?: number
    rating?: number | null
  }) => {
    // Start with current URL parameters
    const urlParams = new URLSearchParams(searchParams.toString())

    // Update or add new parameters
    if (params.category !== undefined) {
      if (params.category) {
        urlParams.set("category", params.category.toString())
      } else {
        urlParams.delete("category")
      }
    }

    if (params.query !== undefined) {
      if (params.query && params.query.trim() !== "") {
        urlParams.set("query", params.query.trim())
      } else {
        urlParams.delete("query")
      }
    }

    if (params.minPrice !== undefined) {
      if (params.minPrice !== minPrice) {
        urlParams.set("minPrice", params.minPrice.toString())
      } else {
        urlParams.delete("minPrice")
      }
    }

    if (params.maxPrice !== undefined) {
      if (params.maxPrice !== maxPrice) {
        urlParams.set("maxPrice", params.maxPrice.toString())
      } else {
        urlParams.delete("maxPrice")
      }
    }

    if (params.rating !== undefined) {
      if (params.rating) {
        urlParams.set("rating", params.rating.toString())
      } else {
        urlParams.delete("rating")
      }
    }

    return `/products${urlParams.toString() ? `?${urlParams.toString()}` : ""}`
  }

  const handleCategoryClick = (categoryId: number, e?: React.MouseEvent) => {
    // Prevent event bubbling
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    // Update current filters ref
    currentFiltersRef.current.category = categoryId
    setHasFilterChanges(true)

    // For desktop, navigate immediately
    if (!isFilterDrawerOpen) {
      router.push(
        buildFilterUrl({
          category: categoryId,
        }),
      )
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Get the search query from the ref instead of state
    const query = searchInputRef.current?.value || ""

    // Update the state for consistency
    setSearchQuery(query)

    // Update current filters ref
    currentFiltersRef.current.query = query
    setHasFilterChanges(true)

    // For desktop, navigate immediately
    if (!isFilterDrawerOpen) {
      router.push(
        buildFilterUrl({
          query: query,
        }),
      )
    }
  }

  // Modified to update local state without navigation
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value)) {
      setPriceRange((prev) => {
        const newRange = [...prev] as [number, number]
        newRange[index] = value

        // Ensure min <= max
        if (index === 0 && value > newRange[1]) {
          newRange[1] = value
        } else if (index === 1 && value < newRange[0]) {
          newRange[0] = value
        }

        // Update current filters ref
        if (index === 0) {
          currentFiltersRef.current.minPrice = value
        } else {
          currentFiltersRef.current.maxPrice = value
        }
        setHasFilterChanges(true)

        return newRange as [number, number]
      })
    }
  }

  const handleRatingChange = (rating: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    const newRating = selectedRating === rating ? null : rating
    setSelectedRating(newRating)

    // Update current filters ref
    currentFiltersRef.current.rating = newRating
    setHasFilterChanges(true)

    // For desktop, navigate immediately
    if (!isFilterDrawerOpen) {
      router.push(
        buildFilterUrl({
          rating: newRating,
        }),
      )
    }
  }

  const handleClearFilters = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    setSearchQuery("")
    // Clear the search input ref
    if (searchInputRef.current) {
      searchInputRef.current.value = ""
    }

    setPriceRange([minPrice, maxPrice])
    setSelectedRating(null)

    // Update current filters ref
    currentFiltersRef.current = {
      query: "",
      minPrice: minPrice,
      maxPrice: maxPrice,
      rating: null,
      category: undefined,
    }
    setHasFilterChanges(true)

    // Always navigate immediately for clear filters
    router.push("/products")
    closeDrawer()
  }

  // Apply all filters at once (for mobile)
  const handleApplyAllFilters = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    const { query, minPrice: min, maxPrice: max, rating, category } = currentFiltersRef.current

    router.push(
      buildFilterUrl({
        query,
        minPrice: min,
        maxPrice: max,
        rating,
        category,
      }),
    )

    closeDrawer()
  }

  // Add touch event handling for mobile
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // If we're touching a filter button or section, prevent default behavior
      const target = e.target as Element
      if (
        target.closest(".filter-category-item") ||
        target.closest(".filter-section-toggle") ||
        target.closest(".filter-price-input") ||
        target.closest(".filter-button")
      ) {
        e.stopPropagation()
      }
    }

    document.addEventListener("touchstart", handleTouchStart, { passive: true })
    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
    }
  }, [])

  const FilterContent = () => (
    <div className="divide-y divide-gray-200">
      {/* Search filter */}
      <div className="py-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-16 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm"
            defaultValue={searchQuery}
            ref={searchInputRef}
            onChange={(e) => {
              // Only update changes flag for mobile
              if (isFilterDrawerOpen) {
                currentFiltersRef.current.query = e.target.value
                setHasFilterChanges(true)
              }
            }}
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <button
            type="submit"
            className="absolute right-2 top-1.5 px-2 py-1 bg-teal-600 text-white text-xs rounded hover:bg-teal-700 filter-button"
            onClick={(e) => {
              e.stopPropagation()
            }}
            onTouchStart={(e) => {
              e.stopPropagation()
            }}
          >
            Search
          </button>
        </form>
      </div>

      {/* Categories filter */}
      <div className="py-4">
        <button
          className="flex justify-between items-center w-full text-left font-medium mb-3 filter-section-toggle"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setShowCategories(!showCategories)
          }}
          onTouchStart={(e) => {
            e.preventDefault()
            setShowCategories(!showCategories)
          }}
          aria-expanded={showCategories}
          aria-controls="categories-panel"
        >
          Categories
          <ChevronDown className={`h-5 w-5 transition-transform ${showCategories ? "rotate-180" : ""}`} />
        </button>

        {showCategories && (
          <div id="categories-panel" className="space-y-1 mt-2 max-h-60 overflow-y-auto pr-2">
            <div
              className={`flex items-center cursor-pointer py-1.5 px-2 rounded-md filter-category-item ${
                !selectedCategory ? "bg-teal-50 text-teal-700" : "hover:bg-gray-50"
              }`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()

                // Update current filters ref
                currentFiltersRef.current.category = undefined
                setHasFilterChanges(true)

                // For desktop, navigate immediately
                if (!isFilterDrawerOpen) {
                  router.push("/products")
                }
              }}
              onTouchStart={(e) => {
                e.preventDefault()

                // Update current filters ref
                currentFiltersRef.current.category = undefined
                setHasFilterChanges(true)

                // For desktop, navigate immediately
                if (!isFilterDrawerOpen) {
                  router.push("/products")
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="All Products"
            >
              <span className="text-sm">All Products</span>
              {!selectedCategory && <span className="ml-auto text-xs text-teal-600">•</span>}
            </div>

            {categories.map((category) => (
              <div
                key={category.id}
                className={`flex items-center cursor-pointer py-1.5 px-2 rounded-md filter-category-item ${
                  selectedCategory === category.id ? "bg-teal-50 text-teal-700" : "hover:bg-gray-50"
                }`}
                onClick={(e) => handleCategoryClick(category.id, e)}
                onTouchStart={(e) => {
                  e.preventDefault()
                  handleCategoryClick(category.id)
                }}
                role="button"
                tabIndex={0}
                aria-label={category.name}
              >
                <span className="text-sm">{category.name}</span>
                {selectedCategory === category.id && <span className="ml-auto text-xs text-teal-600">•</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Price filter */}
      <div className="py-4">
        <button
          className="flex justify-between items-center w-full text-left font-medium mb-3 filter-section-toggle"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setShowPrice(!showPrice)
          }}
          onTouchStart={(e) => {
            e.preventDefault()
            setShowPrice(!showPrice)
          }}
          aria-expanded={showPrice}
          aria-controls="price-panel"
        >
          Price Range
          <ChevronDown className={`h-5 w-5 transition-transform ${showPrice ? "rotate-180" : ""}`} />
        </button>

        {showPrice && (
          <div id="price-panel" className="mt-2">
            <div className="flex space-x-2">
              <div className="flex-1">
                <label htmlFor="min-price" className="text-xs text-gray-500 mb-1 block">
                  Min
                </label>
                <input
                  id="min-price"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min={minPrice}
                  max={maxPrice}
                  value={priceRange[0]}
                  onChange={(e) => {
                    e.stopPropagation()
                    const value = e.target.value === "" ? minPrice : Number.parseInt(e.target.value)
                    if (!isNaN(value)) {
                      handlePriceChange({ target: { value: String(value) } } as React.ChangeEvent<HTMLInputElement>, 0)
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="w-full p-1.5 text-sm border border-gray-300 rounded-md filter-price-input"
                  onBlur={() => {
                    if (priceRange[0] < minPrice) {
                      handlePriceChange(
                        { target: { value: String(minPrice) } } as React.ChangeEvent<HTMLInputElement>,
                        0,
                      )
                    } else if (priceRange[0] > priceRange[1]) {
                      handlePriceChange(
                        { target: { value: String(priceRange[1]) } } as React.ChangeEvent<HTMLInputElement>,
                        0,
                      )
                    }
                  }}
                />
              </div>
              <div className="flex-1">
                <label htmlFor="max-price" className="text-xs text-gray-500 mb-1 block">
                  Max
                </label>
                <input
                  id="max-price"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min={minPrice}
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={(e) => {
                    e.stopPropagation()
                    const value = e.target.value === "" ? maxPrice : Number.parseInt(e.target.value)
                    if (!isNaN(value)) {
                      handlePriceChange({ target: { value: String(value) } } as React.ChangeEvent<HTMLInputElement>, 1)
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="w-full p-1.5 text-sm border border-gray-300 rounded-md filter-price-input"
                  onBlur={() => {
                    if (priceRange[1] > maxPrice) {
                      handlePriceChange(
                        { target: { value: String(maxPrice) } } as React.ChangeEvent<HTMLInputElement>,
                        1,
                      )
                    } else if (priceRange[1] < priceRange[0]) {
                      handlePriceChange(
                        { target: { value: String(priceRange[0]) } } as React.ChangeEvent<HTMLInputElement>,
                        1,
                      )
                    }
                  }}
                />
              </div>
            </div>

            {/* Only show Apply Price button on desktop */}
            {!isFilterDrawerOpen && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  router.push(
                    buildFilterUrl({
                      minPrice: priceRange[0],
                      maxPrice: priceRange[1],
                    }),
                  )
                }}
                onTouchStart={(e) => {
                  e.preventDefault()
                  router.push(
                    buildFilterUrl({
                      minPrice: priceRange[0],
                      maxPrice: priceRange[1],
                    }),
                  )
                }}
                className="mt-3 w-full py-1.5 bg-teal-600 text-white text-sm rounded-md hover:bg-teal-700 transition-colors filter-button"
              >
                Apply Price Filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Clear all filters - only show on desktop */}
      {!isFilterDrawerOpen && (
        <div className="py-4">
          <button
            onClick={(e) => handleClearFilters(e)}
            onTouchStart={(e) => {
              e.preventDefault()
              handleClearFilters()
            }}
            className="w-full py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors filter-button"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  )

  // Desktop filters
  const DesktopFilters = () => (
    <div className="hidden lg:block sticky top-4">
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h2 className="font-medium text-lg mb-4">Filters</h2>
        <FilterContent />
      </div>
    </div>
  )

  // Completely redesigned mobile filters with collapsible sections and improved slider
  const MobileFilters = () =>
    isFilterDrawerOpen && (
      <div className="fixed inset-0 bg-white z-50 lg:hidden overflow-hidden flex flex-col" ref={drawerRef}>
        {/* Header */}
        <div className="px-4 py-3 border-b flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                closeDrawer()
              }}
              onTouchStart={(e) => {
                e.preventDefault()
                closeDrawer()
              }}
              className="mr-3 p-1.5 rounded-full hover:bg-gray-100 filter-button"
              aria-label="Close filters"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>
          <button
            onClick={(e) => handleClearFilters(e)}
            onTouchStart={(e) => {
              e.preventDefault()
              handleClearFilters()
            }}
            className="text-sm text-teal-600 font-medium filter-button"
          >
            Clear All
          </button>
        </div>

        {/* Filter content - scrollable area */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {/* Active filters summary */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Sliders className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm text-gray-500">Active Filters</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedCategory && (
                <div className="bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded-full flex items-center">
                  <span>Category: {categories.find((c) => c.id === selectedCategory)?.name}</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      currentFiltersRef.current.category = undefined
                      setHasFilterChanges(true)
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault()
                      currentFiltersRef.current.category = undefined
                      setHasFilterChanges(true)
                    }}
                    className="ml-1 p-0.5 filter-button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {(priceRange[0] > minPrice || priceRange[1] < maxPrice) && (
                <div className="bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded-full flex items-center">
                  <span>
                    Price: ${priceRange[0]} - ${priceRange[1]}
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setPriceRange([minPrice, maxPrice])
                      currentFiltersRef.current.minPrice = minPrice
                      currentFiltersRef.current.maxPrice = maxPrice
                      setHasFilterChanges(true)
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault()
                      setPriceRange([minPrice, maxPrice])
                      currentFiltersRef.current.minPrice = minPrice
                      currentFiltersRef.current.maxPrice = maxPrice
                      setHasFilterChanges(true)
                    }}
                    className="ml-1 p-0.5 filter-button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {searchQuery && (
                <div className="bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded-full flex items-center">
                  <span>Search: {searchQuery}</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setSearchQuery("")
                      if (searchInputRef.current) {
                        searchInputRef.current.value = ""
                      }
                      currentFiltersRef.current.query = ""
                      setHasFilterChanges(true)
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault()
                      setSearchQuery("")
                      if (searchInputRef.current) {
                        searchInputRef.current.value = ""
                      }
                      currentFiltersRef.current.query = ""
                      setHasFilterChanges(true)
                    }}
                    className="ml-1 p-0.5 filter-button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search box - kept as is */}
          <div className="mb-6">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-16 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm"
                defaultValue={searchQuery}
                ref={searchInputRef}
                onChange={(e) => {
                  e.stopPropagation()
                  currentFiltersRef.current.query = e.target.value
                  setHasFilterChanges(true)
                }}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-1.5 px-2 py-1 bg-teal-600 text-white text-xs rounded hover:bg-teal-700 filter-button"
                onClick={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                Search
              </button>
            </form>
          </div>

          {/* Categories - Collapsible */}
          <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-left filter-section-toggle"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setMobileCategoriesOpen(!mobileCategoriesOpen)
              }}
              onTouchStart={(e) => {
                e.preventDefault()
                setMobileCategoriesOpen(!mobileCategoriesOpen)
              }}
              aria-expanded={mobileCategoriesOpen}
            >
              <h3 className="font-medium text-base">Categories</h3>
              <ChevronDown
                className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                  mobileCategoriesOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {mobileCategoriesOpen && (
              <div className="p-3 border-t border-gray-200">
                <div className="grid grid-cols-1 gap-2">
                  <button
                    className={`text-left px-3 py-2.5 rounded-md flex items-center justify-between filter-category-item ${
                      !selectedCategory ? "bg-teal-50 text-teal-700" : "bg-gray-50 text-gray-700"
                    }`}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      currentFiltersRef.current.category = undefined
                      setHasFilterChanges(true)
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault()
                      currentFiltersRef.current.category = undefined
                      setHasFilterChanges(true)
                    }}
                  >
                    <span>All Products</span>
                    {!selectedCategory && <Check className="h-4 w-4" />}
                  </button>

                  {categories.map((category) => (
                    <button
                      key={category.id}
                      className={`text-left px-3 py-2.5 rounded-md flex items-center justify-between filter-category-item ${
                        selectedCategory === category.id ? "bg-teal-50 text-teal-700" : "bg-gray-50 text-gray-700"
                      }`}
                      onClick={(e) => handleCategoryClick(category.id, e)}
                      onTouchStart={(e) => {
                        e.preventDefault()
                        handleCategoryClick(category.id)
                      }}
                    >
                      <span>{category.name}</span>
                      {selectedCategory === category.id && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Price Range - Collapsible */}
          <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-left filter-section-toggle"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setMobilePriceOpen(!mobilePriceOpen)
              }}
              onTouchStart={(e) => {
                e.preventDefault()
                setMobilePriceOpen(!mobilePriceOpen)
              }}
              aria-expanded={mobilePriceOpen}
            >
              <h3 className="font-medium text-base">Price Range</h3>
              <ChevronDown
                className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                  mobilePriceOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {mobilePriceOpen && (
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <label htmlFor="mobile-min-price" className="text-sm text-gray-500 mb-1 block">
                      Min Price
                    </label>
                    <input
                      id="mobile-min-price"
                      type="number"
                      inputMode="numeric"
                      min={minPrice}
                      max={maxPrice}
                      defaultValue={priceRange[0]}
                      className="w-full p-2 text-base border border-gray-300 rounded-md filter-price-input"
                      style={{ fontSize: "16px" }} /* Prevents zoom on mobile */
                      onClick={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const value = Number.parseInt((e.target as HTMLInputElement).value)
                          if (!isNaN(value)) {
                            handlePriceChange(
                              { target: { value: String(value) } } as React.ChangeEvent<HTMLInputElement>,
                              0,
                            )
                          }
                          ;(e.target as HTMLInputElement).blur()
                        }
                      }}
                      onBlur={(e) => {
                        const value = Number.parseInt(e.target.value)
                        if (!isNaN(value)) {
                          handlePriceChange(
                            { target: { value: String(value) } } as React.ChangeEvent<HTMLInputElement>,
                            0,
                          )
                        }
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="mobile-max-price" className="text-sm text-gray-500 mb-1 block">
                      Max Price
                    </label>
                    <input
                      id="mobile-max-price"
                      type="number"
                      inputMode="numeric"
                      min={minPrice}
                      max={maxPrice}
                      defaultValue={priceRange[1]}
                      className="w-full p-2 text-base border border-gray-300 rounded-md filter-price-input"
                      style={{ fontSize: "16px" }} /* Prevents zoom on mobile */
                      onClick={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const value = Number.parseInt((e.target as HTMLInputElement).value)
                          if (!isNaN(value)) {
                            handlePriceChange(
                              { target: { value: String(value) } } as React.ChangeEvent<HTMLInputElement>,
                              1,
                            )
                          }
                          ;(e.target as HTMLInputElement).blur()
                        }
                      }}
                      onBlur={(e) => {
                        const value = Number.parseInt(e.target.value)
                        if (!isNaN(value)) {
                          handlePriceChange(
                            { target: { value: String(value) } } as React.ChangeEvent<HTMLInputElement>,
                            1,
                          )
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Apply button */}
        <div className="border-t px-4 py-3 bg-white sticky bottom-0 z-10">
          <button
            onClick={(e) => handleApplyAllFilters(e)}
            onTouchStart={(e) => {
              e.preventDefault()
              if (hasFilterChanges) {
                handleApplyAllFilters()
              }
            }}
            disabled={!hasFilterChanges}
            className={`w-full py-3 rounded-md font-medium text-center filter-button ${
              hasFilterChanges ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Apply Filters
          </button>
        </div>
      </div>
    )

  useEffect(() => {
    // Add passive touch handler to improve mobile performance
    const drawerElement = drawerRef.current

    const handleTouchMove = (e: TouchEvent) => {
      // Allow scrolling within the drawer
      if (drawerElement && drawerElement.contains(e.target as Node)) {
        e.stopPropagation()
      }
    }

    if (drawerElement) {
      drawerElement.addEventListener("touchmove", handleTouchMove, { passive: true })
    }

    return () => {
      if (drawerElement) {
        drawerElement.removeEventListener("touchmove", handleTouchMove)
      }
    }
  }, [isFilterDrawerOpen])

  return (
    <>
      <DesktopFilters />
      <MobileFilters />
    </>
  )
}
