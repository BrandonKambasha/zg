"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { getHampers } from "../lib/api/hampers"
import { getCategories } from "../lib/api/categories"
import {
  ShoppingCart,
  Loader2,
  PlusCircle,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Heart,
  Package,
  ShoppingBag,
  FolderHeart,
  Search,
} from "lucide-react"
import { motion } from "framer-motion"
import type { Hamper, Category } from "../Types"
import useCart from "../hooks/useCart"
import { useWishlist } from "../hooks/useWishlist"
import { useAuth } from "../hooks/useAuth"
import toast from "react-hot-toast"
import { apiBaseUrl } from "../lib/axios"

export default function HampersPage() {
  const [hampers, setHampers] = useState<Hamper[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { addHamper } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist, getWishlistItemId } = useWishlist()
  const { isAuthenticated } = useAuth()
  const hampersRef = useRef<HTMLElement>(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const hampersPerPage = 6 // Increased from 5 to 6 for better grid layout

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const [hampersData, categoriesData] = await Promise.all([getHampers(), getCategories()])
        setHampers(hampersData || [])

        // Filter categories to only include those with type 'hampers'
        const hamperCategories = categoriesData.filter((category) => category.type === "hampers") || []
        setCategories(hamperCategories)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Function to get full image URL with API prefix
  const getFullImageUrl = (url: string | undefined): string => {
    if (!url) return "/placeholder.svg?height=300&width=300"
    return url.startsWith("http") ? url : `${apiBaseUrl}${url}`
  }

  const handleAddToCart = (hamper: Hamper, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (hamper.stock_quantity <= 0) {
      toast.error("This hamper is out of stock")
      return
    }

    addHamper(hamper, 1)
    toast.success(`${hamper.name} added to cart`)
  }

  const handleToggleWishlist = async (hamper: Hamper, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    // Check if user is authenticated first
    if (!isAuthenticated) {
      toast.error("Please login to add items to your wishlist")
      return
    }

    try {
      if (isInWishlist(hamper.id, "hamper")) {
        const wishlistItemId = getWishlistItemId(hamper.id, "hamper")
        await removeFromWishlist(wishlistItemId)
        toast.success(`${hamper.name} removed from wishlist`)
      } else {
        await addToWishlist(hamper, "hamper")
        toast.success(`${hamper.name} added to wishlist`)
      }
    } catch (error) {
      console.error("Wishlist operation failed:", error)
      toast.error("Failed to update wishlist")
    }
  }

  const scrollToHampers = () => {
    hampersRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Filter hampers by category
  const filteredHampers = selectedCategory
    ? hampers.filter((hamper) => hamper.category_id && Number(hamper.category_id) === selectedCategory)
    : hampers

  // Calculate pagination
  const indexOfLastHamper = currentPage * hampersPerPage
  const indexOfFirstHamper = indexOfLastHamper - hampersPerPage
  const currentHampers = filteredHampers.slice(indexOfFirstHamper, indexOfLastHamper)
  const totalPages = Math.ceil(filteredHampers.length / hampersPerPage)

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1))

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory])

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading hampers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section - Reduced size and styled similar to products page */}
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
            <ShoppingBag className="h-12 w-12 text-white opacity-10" />
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
              Hampers
            </motion.h1>
            <motion.p
              className="text-base md:text-lg mb-4 text-teal-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Send quality products from Zimbabwe directly to your loved ones
            </motion.p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={scrollToHampers}
                className="flex items-center justify-center gap-2 bg-teal-700/30 backdrop-blur-sm text-white py-2 px-4 rounded-lg border border-teal-600/50 hover:bg-teal-700/40 transition-colors"
              >
                <Search className="h-4 w-4" />
                <span className="font-medium">Browse Hampers</span>
              </button>
              <Link
                href="/hampers/build"
                className="flex items-center justify-center gap-2 bg-white text-teal-800 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <PlusCircle className="h-4 w-4" />
                <span className="font-medium">Build Your Own</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Build Your Own Hamper - Enhanced with My Hampers button */}
      <section className="container mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-lg overflow-hidden shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between p-4">
            <div className="text-white mb-4 md:mb-0">
              <div className="flex items-center">
                <PlusCircle className="h-5 w-5 mr-2" />
                <h2 className="text-lg font-bold">Build Your Own Hamper</h2>
              </div>
              <div className="flex items-center mt-1">
                <Calendar className="h-4 w-4 mr-2 text-teal-200" />
                <p className="text-teal-100 text-sm">Create a custom gift with optional monthly delivery</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {isAuthenticated && (
                <Link
                  href="/hampers/my-hampers"
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors flex items-center justify-center whitespace-nowrap shadow-sm"
                >
                  <FolderHeart className="h-4 w-4 mr-2" />
                  My Hampers
                </Link>
              )}
              <Link
                href="/hampers/build"
                className="px-4 py-2 bg-white text-teal-700 rounded-lg font-medium hover:bg-teal-50 transition-colors flex items-center justify-center whitespace-nowrap shadow-sm"
              >
                Start Building
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400"></div>
        </div>
      </section>

      {/* Hamper Categories and Listing */}
      <section ref={hampersRef} id="hampers-section" className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Our Gift Hampers</h2>

          {/* Category Filter */}
          <div className="relative">
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === null ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Hampers
              </button>

              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredHampers.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
            <h3 className="text-xl font-medium text-gray-800 mb-3">No Hampers Found</h3>
            <p className="text-gray-600 mb-6">
              {selectedCategory
                ? "There are no hampers available in this category at the moment."
                : "We're currently preparing new hampers. Please check back soon!"}
            </p>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition inline-block"
              >
                View All Hampers
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Hamper Grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentHampers.map((hamper) => (
                <Link key={hamper.id} href={`/hampers/${hamper.id}`} className="group">
                  <div className="flex bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full border border-gray-100">
                    <div className="relative h-36 w-36 flex-shrink-0">
                      <img
                        src={getFullImageUrl(hamper.image_url) || "/placeholder.svg"}
                        alt={hamper.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />

                      {/* Stock badges */}
                      {hamper.stock_quantity <= 5 && hamper.stock_quantity > 0 && (
                        <div className="absolute top-2 left-2 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-medium">
                          Only {hamper.stock_quantity} left
                        </div>
                      )}

                      {hamper.stock_quantity === 0 && (
                        <div className="absolute top-2 left-2 bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium">
                          Out of Stock
                        </div>
                      )}

                      {/* Wishlist button */}
                      <button
                        onClick={(e) => handleToggleWishlist(hamper, e)}
                        className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                        aria-label={isInWishlist(hamper.id, "hamper") ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart
                          className={`h-4 w-4 ${isInWishlist(hamper.id, "hamper") ? "fill-red-500 text-red-500" : "text-gray-600"}`}
                        />
                      </button>
                    </div>

                    <div className="p-3 flex-grow flex flex-col relative">
                      <h3 className="text-base font-semibold text-gray-800 group-hover:text-teal-600 transition-colors mb-1 line-clamp-1">
                        {hamper.name}
                      </h3>

                      {/* Category badge */}
                      {hamper.category_id && (
                        <div className="mb-1">
                          <span className="inline-block bg-teal-50 text-teal-700 text-xs px-2 py-0.5 rounded-full">
                            {categories.find((cat) => cat.id === Number(hamper.category_id))?.name || "Uncategorized"}
                          </span>
                        </div>
                      )}

                      <p className="text-gray-600 text-xs mb-2 line-clamp-2">{hamper.description}</p>

                      {hamper.products && hamper.products.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs text-gray-500 mb-1">Includes {hamper.products.length} items:</p>
                          <div className="flex flex-wrap gap-1">
                            {hamper.products.slice(0, 2).map((product) => (
                              <span
                                key={product.id}
                                className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full truncate max-w-[120px]"
                              >
                                {product.name} {product.pivot?.quantity > 1 ? `(${product.pivot.quantity})` : ""}
                              </span>
                            ))}
                            {hamper.products.length > 2 && (
                              <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
                                +{hamper.products.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-lg font-bold text-teal-600">${hamper.price}</span>

                        <button
                          onClick={(e) => handleAddToCart(hamper, e)}
                          disabled={hamper.stock_quantity === 0}
                          className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${
                            hamper.stock_quantity === 0
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-teal-600 text-white hover:bg-teal-700 shadow-sm"
                          }`}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1.5" />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile Magazine-Style Layout */}
            <div className="md:hidden">
              <div className="grid grid-cols-2 gap-3">
                {currentHampers.map((hamper, index) => {
                  // Determine if this is a featured hamper (first item or every 4th item)
                  const isFeatured = index === 0 || (index + 1) % 4 === 0

                  return (
                    <div key={hamper.id} className={`${isFeatured ? "col-span-2" : "col-span-1"}`}>
                      <Link href={`/hampers/${hamper.id}`} className="block h-full">
                        <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full border border-gray-100 flex flex-col">
                          {/* Image section */}
                          <div className={`relative ${isFeatured ? "h-40" : "h-32"}`}>
                            <img
                              src={getFullImageUrl(hamper.image_url) || "/placeholder.svg"}
                              alt={hamper.name}
                              className="w-full h-full object-cover"
                            />

                            {/* Stock badges */}
                            {hamper.stock_quantity <= 5 && hamper.stock_quantity > 0 && (
                              <div className="absolute top-2 left-2 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                Low Stock
                              </div>
                            )}

                            {hamper.stock_quantity === 0 && (
                              <div className="absolute top-2 left-2 bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                Out of Stock
                              </div>
                            )}

                            {/* Wishlist button */}
                            <button
                              onClick={(e) => handleToggleWishlist(hamper, e)}
                              className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm"
                              aria-label={
                                isInWishlist(hamper.id, "hamper") ? "Remove from wishlist" : "Add to wishlist"
                              }
                            >
                              <Heart
                                className={`h-4 w-4 ${isInWishlist(hamper.id, "hamper") ? "fill-red-500 text-red-500" : "text-gray-600"}`}
                              />
                            </button>

                            {/* Price tag */}
                            <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-teal-700 px-2 py-0.5 rounded-full text-sm font-bold">
                              ${hamper.price}
                            </div>
                          </div>

                          {/* Content section */}
                          <div className="p-3 flex-grow flex flex-col">
                            <h3 className={`font-semibold text-gray-800 ${isFeatured ? "text-base" : "text-sm"} mb-1`}>
                              {hamper.name}
                            </h3>

                            {/* Category badge */}
                            {hamper.category_id && (
                              <div className="mb-1">
                                <span className="inline-block bg-teal-50 text-teal-700 text-xs px-2 py-0.5 rounded-full">
                                  {categories.find((cat) => cat.id === Number(hamper.category_id))?.name ||
                                    "Uncategorized"}
                                </span>
                              </div>
                            )}

                            {/* Hamper contents preview */}
                            <div className="mt-1 mb-2 flex-grow">
                              <div className="flex items-center mb-1">
                                <Package className="h-3.5 w-3.5 text-teal-600 mr-1" />
                                <span className="text-xs text-gray-600 font-medium">Hamper Contents:</span>
                              </div>

                              {hamper.products && hamper.products.length > 0 ? (
                                <ul className="text-xs text-gray-500 pl-5 list-disc space-y-0.5">
                                  {hamper.products.slice(0, isFeatured ? 3 : 2).map((product) => (
                                    <li key={product.id} className="line-clamp-1">
                                      {product.name} {product.pivot?.quantity > 1 ? `(${product.pivot.quantity})` : ""}
                                    </li>
                                  ))}
                                  {hamper.products.length > (isFeatured ? 3 : 2) && (
                                    <li className="text-teal-600">
                                      +{hamper.products.length - (isFeatured ? 3 : 2)} more items
                                    </li>
                                  )}
                                </ul>
                              ) : (
                                <p className="text-xs text-gray-500 italic">Contents information not available</p>
                              )}
                            </div>

                            {/* Action buttons */}
                            <div className="mt-auto pt-2 flex justify-between items-center">
                              {isFeatured ? (
                                <>
                                  <div className="flex items-center text-xs text-gray-500">
                                    <ShoppingBag className="h-3.5 w-3.5 mr-1 text-teal-600" />
                                    {hamper.products?.length || 0} items
                                  </div>
                                  <button
                                    onClick={(e) => handleAddToCart(hamper, e)}
                                    disabled={hamper.stock_quantity === 0}
                                    className={`flex items-center px-3 py-1.5 rounded text-xs font-medium ${
                                      hamper.stock_quantity === 0
                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        : "bg-teal-600 text-white hover:bg-teal-700"
                                    }`}
                                  >
                                    <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                                    Add to Cart
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={(e) => handleAddToCart(hamper, e)}
                                  disabled={hamper.stock_quantity === 0}
                                  className={`w-full flex items-center justify-center px-2 py-1.5 rounded text-xs font-medium ${
                                    hamper.stock_quantity === 0
                                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                      : "bg-teal-600 text-white hover:bg-teal-700"
                                  }`}
                                >
                                  <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                                  Add to Cart
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${
                      currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100"
                    }`}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md ${
                        currentPage === number ? "bg-teal-600 text-white" : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {number}
                    </button>
                  ))}

                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md ${
                      currentPage === totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Call to Action - Made more compact */}
      <section className="bg-gradient-to-r from-teal-700 to-teal-800 text-white py-8 mt-8">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-3">Ready to Delight Someone Special?</h2>
          <p className="text-teal-100 mb-6 max-w-2xl mx-auto text-sm md:text-base">
            Whether you choose one of our curated hampers or create your own, you'll be sending a gift that's sure to
            impress.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={scrollToHampers}
              className="px-5 py-2.5 bg-white text-teal-800 rounded-lg font-medium hover:bg-teal-50 transition-colors"
            >
              Shop Hampers
            </button>
            <Link
              href="/hampers/build"
              className="px-5 py-2.5 bg-transparent border-2 border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
            >
              Build Your Own
            </Link>
            {isAuthenticated && (
              <Link
                href="/hampers/my-hampers"
                className="px-5 py-2.5 bg-teal-600 border-2 border-teal-600 text-white rounded-lg font-medium hover:bg-teal-500 hover:border-teal-500 transition-colors"
              >
                <FolderHeart className="h-4 w-4 inline-block mr-2" />
                My Hampers
              </Link>
            )}
          </div>
        </div>
      </section>

      <style jsx global>{`
        .bg-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%  viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
