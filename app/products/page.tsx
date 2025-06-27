"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { getProducts } from "../lib/api/products"
import { getCategories } from "../lib/api/categories"
import { ShoppingCart, Loader2, Heart, Search, Package, ChevronDown, X, Filter, ArrowUpDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { Product, Category } from "../Types"
import useCart from "../hooks/useCart"
import { useWishlist } from "../hooks/useWishlist"
import { apiBaseUrl } from "../lib/axios"
import toast from "react-hot-toast"
import { useAuth } from "../hooks/useAuth"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [sortOption, setSortOption] = useState("featured")
  const [minPrice, setMinPrice] = useState("0")
  const [maxPrice, setMaxPrice] = useState("1000")
  const [appliedPriceRange, setAppliedPriceRange] = useState<[number, number]>([0, 1000])
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showMobileSort, setShowMobileSort] = useState(false)
  const { addItem } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist, getWishlistItemId } = useWishlist()
  const filtersRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)
  const mobileFiltersRef = useRef<HTMLDivElement>(null)
  const [productCount, setProductCount] = useState(0)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const [productsData, categoriesData] = await Promise.all([getProducts(), getCategories()])
        setProducts(productsData || [])
        setProductCount(productsData?.length || 0)
        const productCategories = (categoriesData || []).filter((category) => category.type === "product")
        setCategories(productCategories)
        } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Close mobile sort dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowMobileSort(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [sortRef])

  // Handle body scroll locking for mobile filters
  useEffect(() => {
    // Save the original body style
    const originalStyle = window.getComputedStyle(document.body).overflow

    // Function to disable scrolling
    const disableScroll = () => {
      document.body.style.overflow = "hidden"
    }

    // Function to enable scrolling
    const enableScroll = () => {
      document.body.style.overflow = originalStyle
    }

    if (showMobileFilters) {
      disableScroll()
    } else {
      enableScroll()
    }

    // Cleanup function
    return () => {
      enableScroll()
    }
  }, [showMobileFilters])

  // Function to get full image URL with API prefix
  const getFullImageUrl = (url: string | undefined): string => {
    if (!url) return "/placeholder.svg?height=300&width=300"
    return url.startsWith("http") ? url : `${apiBaseUrl}${url}`
  }

  const handleAddToCart = (product: Product, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (product.stock_quantity <= 0) {
      toast.error("This product is out of stock")
      return
    }

    addItem(product, 1)
    toast.success(`${product.name} added to cart`)
  }

  const handleToggleWishlist = async (product: Product, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    // Check if user is authenticated first
    if (!isAuthenticated) {
      toast.error("Please login to add items to your wishlist")
      return
    }

    try {
      if (isInWishlist(product.id, "product")) {
        const wishlistItemId = getWishlistItemId(product.id, "product")
        await removeFromWishlist(wishlistItemId)
        toast.success(`${product.name} removed from wishlist`)
      } else {
        await addToWishlist(product, "product")
        toast.success(`${product.name} added to wishlist`)
      }
    } catch (error) {
      console.error("Wishlist operation failed:", error)
      toast.error("Failed to update wishlist")
    }
  }

  const applyPriceFilter = () => {
    setAppliedPriceRange([Number(minPrice), Number(maxPrice)])
    if (showMobileFilters) {
      setShowMobileFilters(false)
    }
  }

  const clearAllFilters = () => {
    setSelectedCategory(null)
    setSearchQuery("")
    setMinPrice("0")
    setMaxPrice("1000")
    setAppliedPriceRange([0, 1000])
    setSortOption("featured")
  }

  // Handle opening mobile filters
  const openMobileFilters = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowMobileFilters(true)
  }

  // Handle closing mobile filters
  const closeMobileFilters = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowMobileFilters(false)
  }

  // Filter products by category, search query, and price range
  const filteredProducts = products.filter((product) => {
    // Filter by category
    if (selectedCategory !== null && product.category_id !== selectedCategory) {
      return false
    }

    // Filter by search query
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Filter by price range
    if (product.price < appliedPriceRange[0] || product.price > appliedPriceRange[1]) {
      return false
    }

    return true
  })

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "name-asc":
        return a.name.localeCompare(b.name)
      case "name-desc":
        return b.name.localeCompare(a.name)
      case "newest":
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      default:
        return 0 // featured - no specific sort
    }
  })

  // Get category name by ID
  const getCategoryName = (categoryId: number | null) => {
    if (categoryId === null) return null
    const category = categories.find((cat) => cat.id === categoryId)
    return category ? category.name : null
  }

  // Sort options for mobile dropdown
  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "name-asc", label: "Name: A to Z" },
    { value: "name-desc", label: "Name: Z to A" },
    { value: "newest", label: "Newest First" },
  ]

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section - Styled similar to shipping page but more compact */}
      <section className="relative bg-gradient-to-r from-teal-600 to-teal-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
        </div>

        {/* Animated elements */}
        <div className="absolute -bottom-3 left-1/4 transform -translate-x-1/2">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Package className="h-16 w-16 text-white opacity-10" />
          </motion.div>
        </div>

        <div className="absolute -top-3 right-1/4 transform translate-x-1/2 rotate-12">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            <ShoppingCart className="h-12 w-12 text-white opacity-10" />
          </motion.div>
        </div>

        <div className="container mx-auto px-4 py-6 md:py-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              className="text-2xl md:text-3xl font-bold mb-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Shop Our Products
            </motion.h1>
            <motion.p
              className="text-base md:text-lg mb-4 text-teal-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Quality Zimbabwean groceries delivered to your loved ones
            </motion.p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/categories"
                className="flex items-center justify-center gap-2 bg-teal-700/30 backdrop-blur-sm text-white py-2 px-4 rounded-lg border border-teal-600/50 hover:bg-teal-700/40 transition-colors"
              >
                <Search className="h-4 w-4" />
                <span className="font-medium">Browse Categories</span>
              </Link>
              <Link
                href="/hampers"
                className="flex items-center justify-center gap-2 bg-white text-teal-800 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Package className="h-4 w-4" />
                <span className="font-medium">Buy/Build Hampers</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 md:hidden">All Products</h2>

        {/* Product Count and Filters/Sort - Mobile */}
        <div className="bg-white rounded-lg p-2 mb-4 md:hidden sticky top-[70px] z-20 shadow-sm border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div className="text-gray-700 text-sm">{filteredProducts.length} products</div>
            <div className="flex gap-2">
              <button
                onClick={openMobileFilters}
                onTouchStart={openMobileFilters}
                className="flex items-center justify-center gap-1 border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-sm"
              >
                <Filter className="h-3.5 w-3.5" />
                <span>Filters</span>
              </button>

              {/* Sort dropdown for mobile */}
              <div className="relative" ref={sortRef}>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowMobileSort(!showMobileSort)
                  }}
                  className="flex items-center justify-center gap-1 border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-sm"
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  <span>Sort</span>
                </button>

                {showMobileSort && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-48">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          sortOption === option.value
                            ? "bg-teal-50 text-teal-600 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setSortOption(option.value)
                          setShowMobileSort(false)
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden md:block w-72 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 sticky top-20">
              <h3 className="font-bold text-xl mb-4 text-gray-800">Filters</h3>

              {/* Search */}
              <div className="mb-6">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-teal-500 focus:border-teal-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <button className="absolute right-2 top-2 bg-teal-600 text-white px-2 py-1 rounded text-xs">
                    Search
                  </button>
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">Categories</h4>
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                </div>
                <div className="space-y-1 max-h-60 overflow-y-auto pr-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-2 py-1.5 rounded text-sm flex items-center ${
                      selectedCategory === null
                        ? "bg-teal-50 text-teal-600 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>
                    All Products
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-2 py-1.5 rounded text-sm ${
                        selectedCategory === category.id
                          ? "text-teal-600 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">Price Range</h4>
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Min</label>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full border border-gray-300 rounded-md py-1 px-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Max</label>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full border border-gray-300 rounded-md py-1 px-2 text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={applyPriceFilter}
                  className="w-full py-2 px-4 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700 transition-colors"
                >
                  Apply Price Filter
                </button>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearAllFilters}
                className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Product Count and Sort - Desktop */}
            <div className="hidden md:flex justify-between items-center mb-6">
              <div className="text-gray-700 font-medium">{filteredProducts.length} products found</div>
              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm"
                >
                  <option value="featured">Sort by: Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                  <option value="newest">Newest First</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <h3 className="text-xl font-medium text-gray-800 mb-3">No Products Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || selectedCategory !== null || appliedPriceRange[0] > 0 || appliedPriceRange[1] < 1000
                    ? "Try adjusting your filters to see more products."
                    : "We're currently adding new products. Please check back soon!"}
                </p>
                {(searchQuery ||
                  selectedCategory !== null ||
                  appliedPriceRange[0] > 0 ||
                  appliedPriceRange[1] < 1000) && (
                  <button
                    onClick={clearAllFilters}
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition inline-block"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {sortedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <Link href={`/products/${product.id}`} className="block relative">
                      <div className="aspect-square relative overflow-hidden bg-gray-50">
                        <img
                          src={getFullImageUrl(product.image_url) || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.stock_quantity <= 0 && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="bg-white text-red-600 px-3 py-1 rounded-full text-xs font-medium">
                              Out of Stock
                            </span>
                          </div>
                        )}
                        {product.stock_quantity > 0 && product.stock_quantity < 5 && (
                          <div className="absolute top-2 left-2">
                            <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium">
                              Low Stock
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleToggleWishlist(product, e)}
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:shadow-md z-10 transition-all duration-200"
                        aria-label={isInWishlist(product.id, "product") ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            isInWishlist(product.id, "product")
                              ? "fill-red-500 text-red-500"
                              : "text-gray-400 group-hover:text-gray-600"
                          }`}
                        />
                      </button>
                    </Link>
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-xs font-medium px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full">
                          {getCategoryName(product.category_id) || "Uncategorized"}
                        </div>
                      </div>
                      <Link
                        href={`/products/${product.id}`}
                        className="block group-hover:text-teal-700 transition-colors"
                      >
                        <h3 className="font-medium text-gray-800 text-sm md:text-base line-clamp-1 mb-0.5">
                          {product.name}
                        </h3>
                        <p className="text-gray-500 text-xs line-clamp-1 mb-2">{product.description}</p>
                      </Link>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-teal-700 font-bold text-base md:text-lg">${product.price}</span>
                        </div>
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          disabled={product.stock_quantity <= 0}
                          className={`flex items-center justify-center rounded-full w-8 h-8 md:w-9 md:h-9 transition-colors ${
                            product.stock_quantity <= 0
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-teal-600 text-white hover:bg-teal-700"
                          }`}
                          aria-label="Add to cart"
                        >
                          <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal with AnimatePresence for smooth transitions */}
      <AnimatePresence>
        {showMobileFilters && (
          <div className="fixed inset-0 z-[9999] md:hidden" aria-modal="true" role="dialog" aria-label="Filters">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={closeMobileFilters}
              onTouchStart={closeMobileFilters}
            />

            {/* Filters panel */}
            <motion.div
              ref={mobileFiltersRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute top-0 right-0 w-full max-w-sm h-full bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b">
                <h3 className="font-bold text-lg">Filters</h3>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowMobileFilters(false)
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowMobileFilters(false)
                  }}
                  className="p-2 rounded-full hover:bg-gray-100"
                  aria-label="Close filters"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-64px)]">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setShowMobileFilters(false)
                        }
                      }}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setShowMobileFilters(false)
                      }}
                      className="absolute right-2 top-2 bg-teal-600 text-white px-2 py-1 rounded text-xs"
                    >
                      Search
                    </button>
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Categories</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setSelectedCategory(null)
                        setShowMobileFilters(false)
                      }}
                      className={`text-left px-3 py-2 rounded-md text-sm ${
                        selectedCategory === null ? "bg-teal-100 text-teal-700 font-medium" : "bg-gray-50 text-gray-700"
                      }`}
                    >
                      All Products
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setSelectedCategory(category.id)
                          setShowMobileFilters(false)
                        }}
                        className={`text-left px-3 py-2 rounded-md text-sm ${
                          selectedCategory === category.id
                            ? "bg-teal-100 text-teal-700 font-medium"
                            : "bg-gray-50 text-gray-700"
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Price Range</h4>
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Min Price</label>
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Max Price</label>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      applyPriceFilter()
                      setShowMobileFilters(false)
                    }}
                    className="w-full py-2 px-4 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700 transition-colors"
                  >
                    Apply Price Filter
                  </button>
                </div>

                {/* Sort */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Sort By</h4>
                  <div className="bg-gray-50 rounded-md p-1">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setSortOption(option.value)
                          setShowMobileFilters(false)
                        }}
                        className={`w-full text-left px-3 py-2 mb-1 rounded-md text-sm ${
                          sortOption === option.value
                            ? "bg-teal-100 text-teal-700 font-medium"
                            : "bg-white text-gray-700 border border-gray-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t flex gap-3">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      clearAllFilters()
                      setShowMobileFilters(false)
                    }}
                    className="flex-1 py-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setShowMobileFilters(false)
                    }}
                    className="flex-1 py-3 bg-teal-600 text-white rounded-md font-medium hover:bg-teal-700"
                  >
                    View Results
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .bg-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  )
}
