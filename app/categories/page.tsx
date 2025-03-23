"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { getCategories } from "../lib/api/categories"
import { getProductsByCategory } from "../lib/api/products"
import {
  ChevronRight,
  Loader2,
  Search,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  ShoppingBag,
  ChevronDown,
  ArrowRight,
} from "lucide-react"
import type { Category } from "../Types"
import { motion } from "framer-motion"
import { apiBaseUrl } from "../lib/axios"

interface EnhancedCategory extends Category {
  productCount: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<EnhancedCategory[]>([])
  const [filteredCategories, setFilteredCategories] = useState<EnhancedCategory[]>([])
  const [featuredCategories, setFeaturedCategories] = useState<EnhancedCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOption, setSortOption] = useState("name-asc")
  const [showFilters, setShowFilters] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    async function fetchCategoriesWithProductCounts() {
      setIsLoading(true)
      try {
        const categoriesData = await getCategories()

        // Create an array of promises to fetch product counts for each category
        const categoriesWithCountsPromises = categoriesData.map(async (category) => {
          try {
            const products = await getProductsByCategory(category.id.toString())
            return {
              ...category,
              productCount: products.length,
            }
          } catch (error) {
            console.error(`Error fetching products for category ${category.id}:`, error)
            return {
              ...category,
              productCount: 0,
            }
          }
        })

        // Wait for all promises to resolve
        const categoriesWithCounts = await Promise.all(categoriesWithCountsPromises)

        // Sort by product count to get featured categories
        const sortedByCount = [...categoriesWithCounts].sort((a, b) => b.productCount - a.productCount)
        setFeaturedCategories(sortedByCount.slice(0, 4))

        setCategories(categoriesWithCounts)
        setFilteredCategories(categoriesWithCounts)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategoriesWithProductCounts()
  }, [])

  // Function to get full image URL with API prefix
  const getFullImageUrl = (url: string | undefined): string => {
    if (!url) return "/placeholder.svg"
    return url.startsWith("http") ? url : `${apiBaseUrl}${url}`
  }

  // Filter and sort categories when search query or sort option changes
  useEffect(() => {
    let result = [...categories]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (category) =>
          category.name.toLowerCase().includes(query) ||
          (category.description && category.description.toLowerCase().includes(query)),
      )
    }

    // Apply sorting
    switch (sortOption) {
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name))
        break
      case "product-count-high":
        result.sort((a, b) => b.productCount - a.productCount)
        break
      case "product-count-low":
        result.sort((a, b) => a.productCount - b.productCount)
        break
      case "newest":
        result.sort((a, b) => {
          // Assuming there's a created_at field, fallback to id if not
          const dateA = a.created_at ? new Date(a.created_at).getTime() : a.id
          const dateB = b.created_at ? new Date(b.created_at).getTime() : b.id
          return dateB - dateA
        })
        break
      case "oldest":
        result.sort((a, b) => {
          // Assuming there's a created_at field, fallback to id if not
          const dateA = a.created_at ? new Date(a.created_at).getTime() : a.id
          const dateB = b.created_at ? new Date(b.created_at).getTime() : b.id
          return dateA - dateB
        })
        break
    }

    setFilteredCategories(result)
  }, [categories, searchQuery, sortOption])

  const clearSearch = () => {
    setSearchQuery("")
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600 mr-2" />
        <p>Loading categories...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Shop by Category</h1>
        <p className="text-gray-600">Find what you're looking for in our collections</p>
      </div>

      {/* Featured Categories - Horizontal Scroll on Mobile */}
      {featuredCategories.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Featured Categories</h2>
            {isMobile && (
              <button onClick={scrollRight} className="flex items-center text-teal-600 text-sm font-medium">
                See more <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            )}
          </div>

          <div ref={scrollContainerRef} className="flex overflow-x-auto pb-4 -mx-4 px-4 space-x-4 hide-scrollbar">
            {featuredCategories.map((category, index) => (
              <Link
                key={category.id}
                href={`/categories/${category.id}`}
                className="flex-shrink-0 w-[85%] sm:w-[45%] md:w-[30%] lg:w-[22%]"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative h-40 rounded-xl overflow-hidden group"
                >
                  <img
                    src={getFullImageUrl(category.image_url) || "/placeholder.svg"}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <div className="absolute bottom-0 left-0 p-4 w-full">
                      <h3 className="text-white font-bold text-lg mb-1">{category.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-white/90 text-sm flex items-center">
                          <ShoppingBag className="h-3 w-3 mr-1" />
                          {category.productCount} Products
                        </span>
                        <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-full">
                          <ArrowRight className="h-3.5 w-3.5 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="sticky top-0 z-10 mb-6 bg-white rounded-lg shadow-md p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Search Input */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            {searchQuery && (
              <button onClick={clearSearch} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Sort and Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <span>Filters</span>
              <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* Expanded Filter Options */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center">
                <label htmlFor="sort" className="mr-2 text-sm font-medium text-gray-700">
                  Sort by:
                </label>
                <div className="relative">
                  <select
                    id="sort"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-10 py-1.5 focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm"
                  >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="product-count-high">Most Products</option>
                    <option value="product-count-low">Fewest Products</option>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ArrowUpDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                Showing {filteredCategories.length} of {categories.length} categories
              </div>
            </div>
          </div>
        )}
      </div>

      {filteredCategories.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 sm:p-8 text-center">
          <h2 className="text-xl font-medium text-gray-800 mb-2">No Categories Found</h2>
          <p className="text-gray-600 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
          <button
            onClick={clearSearch}
            className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <Link href={`/categories/${category.id}`} className="block h-full">
                <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                  <div className="relative overflow-hidden">
                    <div className="aspect-square">
                      <img
                        src={getFullImageUrl(category.image_url) || "/placeholder.svg"}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                      />
                    </div>

                    {/* Product count badge */}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-teal-700 shadow-sm flex items-center">
                      <ShoppingBag className="h-3 w-3 mr-1" />
                      {category.productCount}
                    </div>
                  </div>

                  <div className="p-3 flex-grow flex flex-col justify-between">
                    <h2 className="text-base font-semibold text-gray-800 line-clamp-1">{category.name}</h2>

                    {/* View Products Button - Always visible for better mobile UX */}
                    <div className="mt-2 flex items-center justify-between text-teal-600 text-xs font-medium">
                      <span>View Products</span>
                      <div className="bg-teal-50 p-1 rounded-full">
                        <ChevronRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

