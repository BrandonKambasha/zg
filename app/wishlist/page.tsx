"use client"

import { useWishlist } from "../hooks/useWishlist"
import { useEffect, useState } from "react"
import { useAuth } from "../hooks/useAuth"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, Trash2, ArrowLeft, Heart } from "lucide-react"
import { useCart } from "../hooks/useCart"
import toast from "react-hot-toast"
import { apiBaseUrl } from "../lib/axios"

export default function WishlistPage() {
  const { items, isLoading, removeFromWishlist } = useWishlist()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { addItem } = useCart()
  const [isAddingToCart, setIsAddingToCart] = useState<Record<number, boolean>>({})

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
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Your Wishlist</h1>
        <Link href="/products" className="flex items-center text-teal-600 hover:text-teal-700 transition-colors">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                    <p className="text-gray-500 text-sm p-4 text-center">Product no longer available</p>
                  </div>
                )}
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>

              <div className="p-4">
                {item.wishlistable ? (
                  <>
                    <Link href={`/products/${item.wishlistable.id}`}>
                      <h3 className="font-medium text-gray-800 mb-1 hover:text-teal-600 transition-colors">
                        {item.wishlistable.name}
                      </h3>
                    </Link>

                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{item.wishlistable.description}</p>

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-teal-600">${item.wishlistable.price}</span>

                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={isAddingToCart[item.id] || item.wishlistable.stock_quantity === 0}
                        className={`p-2 rounded-full transition-all transform hover:scale-110 ${
                          item.wishlistable.stock_quantity === 0
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : isAddingToCart[item.id]
                              ? "bg-teal-600 text-white"
                              : "bg-teal-100 text-teal-600 hover:bg-teal-600 hover:text-white"
                        }`}
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div>
                    <h3 className="font-medium text-gray-800 mb-1">Product Unavailable</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      This product has been removed or is no longer available.
                    </p>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove from wishlist
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

