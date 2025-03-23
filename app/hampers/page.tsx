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
} from "lucide-react"
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
  const hampersPerPage = 5

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
    if (!url) return "/placeholder.svg"
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

    try {
      if (isInWishlist(hamper.id, "hamper")) {
        const wishlistItemId = getWishlistItemId(hamper.id, "hamper")
        await removeFromWishlist(wishlistItemId)
      } else {
        await addToWishlist(hamper, "hamper")
      }
    } catch (error) {
      // Silent error handling - no toast notifications here
      console.error("Wishlist operation failed:", error)
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
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900 text-white">
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/placeholder.svg?height=600&width=1200')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(2px)",
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">Exquisite Gift Hampers</h1>
            <p className="text-lg md:text-xl text-teal-50 mb-8 max-w-2xl mx-auto">
              Send quality products from Zimbabwean stores directly to your loved ones in Zimbabwe.
            </p>

            <button
              onClick={scrollToHampers}
              className="px-6 py-3 bg-white text-teal-800 rounded-full font-medium hover:bg-teal-50 transition-colors shadow-md"
            >
              Shop Hampers
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Build Your Own Hamper - Enhanced with My Hampers button */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-lg overflow-hidden shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between p-5">
            <div className="text-white mb-4 md:mb-0">
              <div className="flex items-center">
                <PlusCircle className="h-5 w-5 mr-2" />
                <h2 className="text-xl font-bold">Build Your Own Hamper</h2>
              </div>
              <div className="flex items-center mt-1">
                <Calendar className="h-4 w-4 mr-2 text-teal-200" />
                <p className="text-teal-100">Create a custom gift with optional monthly delivery</p>
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
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400"></div>
        </div>
      </section>

      {/* Hamper Categories and Listing */}
      <section ref={hampersRef} id="hampers-section" className="container mx-auto px-4 py-8">
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
          <div className="bg-gray-50 rounded-xl p-8 text-center">
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
            <div className="hidden md:grid md:grid-cols-2 gap-6">
              {currentHampers.map((hamper) => (
                <Link key={hamper.id} href={`/hampers/${hamper.id}`} className="group">
                  <div className="flex bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full border border-gray-100">
                    <div className="relative h-40 w-40 md:h-48 md:w-48 flex-shrink-0">
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

                    <div className="p-4 flex-grow flex flex-col relative">
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-teal-600 transition-colors mb-1">
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

                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{hamper.description}</p>

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
                        <span className="text-xl font-bold text-teal-600">${hamper.price}</span>

                        <button
                          onClick={(e) => handleAddToCart(hamper, e)}
                          disabled={hamper.stock_quantity === 0}
                          className={`flex items-center px-4 py-2.5 rounded-md text-sm font-medium ${
                            hamper.stock_quantity === 0
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-teal-600 text-white hover:bg-teal-700 shadow-sm"
                          }`}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
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
                  // Determine if this is a featured hamper (first item or every 5th item)
                  const isFeatured = index === 0 || (index + 1) % 5 === 0

                  return (
                    <div key={hamper.id} className={`${isFeatured ? "col-span-2" : "col-span-1"}`}>
                      <Link href={`/hampers/${hamper.id}`} className="block h-full">
                        <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full border border-gray-100 flex flex-col">
                          {/* Image section */}
                          <div className={`relative ${isFeatured ? "h-48" : "h-32"}`}>
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
                                  {hamper.products.slice(0, isFeatured ? 4 : 2).map((product) => (
                                    <li key={product.id} className="line-clamp-1">
                                      {product.name} {product.pivot?.quantity > 1 ? `(${product.pivot.quantity})` : ""}
                                    </li>
                                  ))}
                                  {hamper.products.length > (isFeatured ? 4 : 2) && (
                                    <li className="text-teal-600">
                                      +{hamper.products.length - (isFeatured ? 4 : 2)} more items
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

      {/* Call to Action */}
      <section className="bg-teal-800 text-white py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Delight Someone Special?</h2>
          <p className="text-teal-100 mb-8 max-w-2xl mx-auto">
            Whether you choose one of our curated hampers or create your own, you'll be sending a gift that's sure to
            impress.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={scrollToHampers}
              className="px-6 py-3 bg-white text-teal-800 rounded-lg font-medium hover:bg-teal-50 transition-colors"
            >
              Shop Hampers
            </button>
            <Link
              href="/hampers/build"
              className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
            >
              Build Your Own
            </Link>
            {isAuthenticated && (
              <Link
                href="/hampers/my-hampers"
                className="px-6 py-3 bg-teal-700 border-2 border-teal-700 text-white rounded-lg font-medium hover:bg-teal-600 hover:border-teal-600 transition-colors"
              >
                <FolderHeart className="h-4 w-4 inline-block mr-2" />
                My Hampers
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

