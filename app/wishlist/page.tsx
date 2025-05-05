"use client"

import { useWishlist } from "../hooks/useWishlist"
import { useEffect, useState } from "react"
import { useAuth } from "../hooks/useAuth"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, Trash2, ArrowLeft, Heart, ChevronRight, Clock } from "lucide-react"
import { useCart } from "../hooks/useCart"
import toast from "react-hot-toast"
import { apiBaseUrl } from "../lib/axios"

export default function WishlistPage() {
  const { items, isLoading, removeFromWishlist } = useWishlist()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { addItem } = useCart()
  const [isAddingToCart, setIsAddingToCart] = useState<Record<number, boolean>>({})
  const [activeFilter, setActiveFilter] = useState<string>("all")

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/wishlist")
    }
  }, [isAuthenticated, authLoading, router])

  const handleAddToCart = (item: any) => {
    // Skip if wishlistable is null
    if (!item.wishlistable) {
      toast.error("This product is no longer available")
      return
    }

    setIsAddingToCart((prev) => ({ ...prev, [item.id]: true }))

    // Simulate a small delay for better UX
    setTimeout(() => {
      addItem(item.wishlistable, 1)
      toast.success(`${item.wishlistable.name} added to cart`)
      setIsAddingToCart((prev) => ({ ...prev, [item.id]: false }))
    }, 500)
  }

  // Ensure image URLs have the API prefix
  const getFullImageUrl = (url: string | undefined): string => {
    if (!url) return "/placeholder.svg"
    return url.startsWith("http") ? url : `${apiBaseUrl}${url}`
  }

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent"></div>
          <p className="ml-2">Loading your wishlist...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Handled by useEffect redirect
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-800 to-red-800 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center">
            <div className="bg-white/10 p-3 rounded-full mr-4">
              <Heart className="h-6 w-6" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Your Wishlist</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        {/* Continue Shopping Button - Mobile */}
        <div className="md:hidden mb-4">
          <Link
            href="/products"
            className="flex items-center justify-center w-full bg-gray-100 hover:bg-gray-200 transition-colors px-4 py-3 rounded-full text-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Link>
        </div>

        {/* Continue Shopping Button - Desktop */}
        <div className="hidden md:block mb-4 text-right">
          <Link
            href="/products"
            className="inline-flex items-center bg-gray-100 hover:bg-gray-200 transition-colors px-4 py-2 rounded-full text-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="flex justify-center mb-4">
              <Heart className="h-16 w-16 text-gray-300" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">
              Add items to your wishlist by clicking the heart icon on products you love.
            </p>
            <Link
              href="/products"
              className="inline-block bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Filter tabs - Mobile only */}
            <div className="md:hidden bg-white rounded-lg shadow-sm p-3 overflow-x-auto scrollbar-hide">
              <div className="flex space-x-2 min-w-max">
                {["all", "recent", "price: low to high", "price: high to low"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                      activeFilter === filter ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Recently Added Section */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-teal-600 mr-2" />
                  <h2 className="text-lg font-medium">Recently Added</h2>
                </div>
                <Link href="#all-items" className="text-sm text-teal-600 flex items-center">
                  View all <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>

              <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                <div className="flex space-x-4">
                  {items.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="w-[160px] bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0"
                    >
                      <div className="relative h-[160px]">
                        {item.wishlistable ? (
                          <Link href={`/products/${item.wishlistable.id}`}>
                            <Image
                              src={getFullImageUrl(item.wishlistable.image_url) || "/placeholder.svg"}
                              alt={item.wishlistable.name}
                              fill
                              className="object-cover"
                            />
                          </Link>
                        ) : (
                          <div className="flex items-center justify-center h-full bg-gray-100">
                            <p className="text-gray-500 text-xs p-2 text-center">Product unavailable</p>
                          </div>
                        )}
                        <button
                          onClick={() => removeFromWishlist(item.id)}
                          className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm"
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-600" />
                        </button>

                        {item.wishlistable && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                            <p className="text-white font-bold">${item.wishlistable.price}</p>
                          </div>
                        )}
                      </div>

                      <div className="p-2">
                        {item.wishlistable ? (
                          <>
                            <Link href={`/products/${item.wishlistable.id}`}>
                              <h3 className="font-medium text-gray-800 text-sm line-clamp-1">
                                {item.wishlistable.name}
                              </h3>
                            </Link>

                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center">
                                <span className="text-amber-400 text-xs">★</span>
                                <span className="text-xs text-gray-500 ml-1">4.5</span>
                              </div>

                              <button
                                onClick={() => handleAddToCart(item)}
                                disabled={isAddingToCart[item.id] || item.wishlistable.stock_quantity === 0}
                                className="p-1.5 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-600 hover:text-white transition-colors"
                                aria-label="Add to cart"
                              >
                                <ShoppingCart className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <div>
                            <h3 className="font-medium text-gray-800 text-sm mb-1">Unavailable</h3>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* All Saved Items Section */}
            <div id="all-items" className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Heart className="h-5 w-5 text-teal-600 mr-2" />
                  <h2 className="text-lg font-medium">All Saved Items</h2>
                  <span className="ml-2 bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                    {items.length}
                  </span>
                </div>

                <div className="hidden md:flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <select className="text-sm border border-gray-200 rounded py-1 px-2 focus:outline-none">
                    <option>Recently Added</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="relative aspect-square">
                      {item.wishlistable ? (
                        <Link href={`/products/${item.wishlistable.id}`}>
                          <Image
                            src={getFullImageUrl(item.wishlistable.image_url) || "/placeholder.svg"}
                            alt={item.wishlistable.name}
                            fill
                            className="object-cover"
                          />
                        </Link>
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gray-100">
                          <p className="text-gray-500 text-xs p-2 text-center">Product unavailable</p>
                        </div>
                      )}

                      {/* Price tag */}
                      {item.wishlistable && (
                        <div className="absolute top-2 left-2 bg-teal-600 text-white text-xs font-bold px-2 py-1 rounded">
                          ${item.wishlistable.price}
                        </div>
                      )}

                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-600" />
                      </button>
                    </div>

                    <div className="p-2">
                      {item.wishlistable ? (
                        <>
                          <Link href={`/products/${item.wishlistable.id}`}>
                            <h3 className="font-medium text-gray-800 text-sm line-clamp-1">{item.wishlistable.name}</h3>
                          </Link>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center">
                              <span className="text-amber-400 text-xs">★</span>
                              <span className="text-xs text-gray-500 ml-1">4.5</span>
                            </div>

                            <button
                              onClick={() => handleAddToCart(item)}
                              disabled={isAddingToCart[item.id] || item.wishlistable.stock_quantity === 0}
                              className="p-1.5 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-600 hover:text-white transition-colors"
                              aria-label="Add to cart"
                            >
                              <ShoppingCart className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div>
                          <h3 className="font-medium text-gray-800 text-sm mb-1">Unavailable</h3>
                          <button
                            onClick={() => removeFromWishlist(item.id)}
                            className="text-xs text-red-600 hover:text-red-700 mt-1"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
