"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getUserHampers, deleteCustomHamper } from "../../lib/api/hampers"
import {
  Loader2,
  PlusCircle,
  Package,
  Edit,
  Trash2,
  ShoppingCart,
  AlertTriangle,
  ChevronLeft,
  Eye,
  Heart,
} from "lucide-react"
import type { Hamper } from "../../Types"
import { useAuth } from "../../hooks/useAuth"
import useCart from "../../hooks/useCart"
import { useWishlist } from "../../hooks/useWishlist"
import toast from "react-hot-toast"
import { apiBaseUrl } from "../../lib/axios"

export default function MyHampersPage() {
  const router = useRouter()
  const { isAuthenticated, user, isLoading: authLoading } = useAuth()
  const { addItem } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist, getWishlistItemId } = useWishlist()
  const [hampers, setHampers] = useState<Hamper[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !isAuthenticated) {
      toast.error("Please log in to view your custom hampers")
      router.push("/login?redirect=/hampers/my-hampers")
      return
    }

    // Fetch user's custom hampers
    if (isAuthenticated) {
      fetchHampers()
    }
  }, [isAuthenticated, authLoading, router])

  const fetchHampers = async () => {
    setIsLoading(true)
    try {
      const data = await getUserHampers()
      setHampers(data || [])
    } catch (error) {
      console.error("Failed to fetch hampers:", error)
      toast.error("Failed to load your custom hampers")
    } finally {
      setIsLoading(false)
    }
  }

  // Function to get full image URL with API prefix
  const getFullImageUrl = (url: string | undefined): string => {
    if (!url) return "/placeholder.svg"
    return url.startsWith("http") ? url : `${apiBaseUrl}${url}`
  }

  const handleAddToCart = (hamper: Hamper) => {
    if (hamper.stock_quantity <= 0) {
      toast.error("This hamper is out of stock")
      return
    }

    addItem(hamper, 1, "hamper")
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
      // Silent error handling
      console.error("Wishlist operation failed:", error)
    }
  }

  const handleDeleteHamper = async (hamperId: number) => {
    if (!confirm("Are you sure you want to delete this custom hamper?")) {
      return
    }

    setIsDeleting(hamperId)
    try {
      await deleteCustomHamper(hamperId.toString())
      toast.success("Custom hamper deleted successfully")
      // Remove the deleted hamper from the state
      setHampers((prev) => prev.filter((h) => h.id !== hamperId))
    } catch (error) {
      console.error("Failed to delete hamper:", error)
      toast.error("Failed to delete custom hamper")
    } finally {
      setIsDeleting(null)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your custom hampers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/hampers" className="inline-flex items-center text-teal-600 hover:text-teal-700 mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Hampers
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">My Custom Hampers</h1>
            <p className="text-gray-600">Manage the custom hampers you've created</p>
          </div>
          <Link
            href="/hampers/build"
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Hamper
          </Link>
        </div>
      </div>

      {/* Hampers List */}
      {hampers.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-800 mb-2">No Custom Hampers Yet</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You haven't created any custom hampers yet. Create your first custom hamper to see it here.
          </p>
          <Link
            href="/hampers/build"
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Your First Hamper
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hampers.map((hamper) => (
            <div
              key={hamper.id}
              className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row h-full">
                {/* Image */}
                <div className="relative md:w-1/3">
                  <img
                    src={getFullImageUrl(hamper.image_url) || "/placeholder.svg"}
                    alt={hamper.name}
                    className="w-full h-48 md:h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <button
                      onClick={(e) => handleToggleWishlist(hamper, e)}
                      className="p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                      aria-label={isInWishlist(hamper.id, "hamper") ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          isInWishlist(hamper.id, "hamper") ? "fill-red-500 text-red-500" : "text-gray-600"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full text-xs font-medium">
                    Custom
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-1">{hamper.name}</h2>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{hamper.description}</p>

                    {/* Products */}
                    {hamper.products && hamper.products.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">Contains {hamper.products.length} items:</p>
                        <div className="flex flex-wrap gap-1">
                          {hamper.products.slice(0, 3).map((product) => (
                            <span
                              key={product.id}
                              className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full truncate max-w-[120px]"
                            >
                              {product.name} {product.pivot?.quantity > 1 ? `(${product.pivot.quantity})` : ""}
                            </span>
                          ))}
                          {hamper.products.length > 3 && (
                            <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
                              +{hamper.products.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stock warning */}
                    {hamper.stock_quantity <= 0 && (
                      <div className="flex items-center text-amber-600 text-xs mb-3">
                        <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                        <span>Out of stock</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-auto pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-teal-600">${hamper.price}</span>

                      <div className="flex space-x-2">
                        <Link
                          href={`/hampers/${hamper.id}`}
                          className="inline-flex items-center px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View
                        </Link>
                        <Link
                          href={`/hampers/build?edit=${hamper.id}`}
                          className="inline-flex items-center px-2 py-1 text-xs text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteHamper(hamper.id)}
                          disabled={isDeleting === hamper.id}
                          className="inline-flex items-center px-2 py-1 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDeleting === hamper.id ? (
                            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(hamper)}
                      disabled={hamper.stock_quantity <= 0}
                      className={`mt-3 w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium ${
                        hamper.stock_quantity <= 0
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-teal-600 text-white hover:bg-teal-700"
                      }`}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

