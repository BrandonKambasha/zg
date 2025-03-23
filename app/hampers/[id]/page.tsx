"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getHamperById } from "../../lib/api/hampers"
import { ShoppingCart, ChevronLeft, Minus, Plus, Check, Truck, Star } from "lucide-react"
import type { Hamper } from "../../Types"
import useCart from "../../hooks/useCart"
import toast from "react-hot-toast"
import { apiBaseUrl } from "../../lib/axios"


export default function HamperDetailPage() {
  const params = useParams()
  const router = useRouter()
  const hamperId = params.id as string

  const [hamper, setHamper] = useState<Hamper | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const { addHamper } = useCart()

  useEffect(() => {
    async function fetchHamper() {
      setIsLoading(true)
      try {
        const data = await getHamperById(hamperId)
        setHamper(data)
      } catch (error) {
        console.error("Failed to fetch hamper:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (hamperId) {
      fetchHamper()
    }
  }, [hamperId])

  // Function to get full image URL with API prefix
  const getFullImageUrl = (url: string | undefined): string => {
    if (!url) return "/placeholder.svg"
    return url.startsWith("http") ? url : `${apiBaseUrl}${url}`
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const increaseQuantity = () => {
    if (hamper && quantity < (hamper.stock_quantity || 10)) {
      setQuantity(quantity + 1)
    }
  }

  const handleAddToCart = () => {
    if (!hamper) return

    if (hamper.stock_quantity <= 0) {
      toast.error("This hamper is out of stock")
      return
    }

    setIsAddingToCart(true)

    // Simulate a small delay for better UX
    setTimeout(() => {
      addHamper(hamper, quantity)
      toast.success(`${quantity} ${quantity === 1 ? "item" : "items"} of ${hamper.name} added to cart`)
      setIsAddingToCart(false)
    }, 500)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600 mr-2"></div>
        <p>Loading hamper details...</p>
      </div>
    )
  }

  if (!hamper) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Hamper Not Found</h1>
        <p className="text-gray-600 mb-6">The hamper you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => router.push("/hampers")}
          className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition"
        >
          View All Hampers
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.push("/hampers")}
        className="flex items-center text-teal-600 hover:text-teal-800 mb-6"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Hampers
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Hamper Image */}
        <div className="space-y-4">
          <div className="aspect-square relative rounded-xl overflow-hidden border border-gray-200">
            <img
              src={getFullImageUrl(hamper.image_url) || "/placeholder.svg"}
              alt={hamper.name}
              className="w-full h-full object-cover"
            />

            {hamper.stock_quantity <= 5 && hamper.stock_quantity > 0 && (
              <div className="absolute top-4 left-4 bg-amber-100 text-amber-800 px-2 py-1 rounded-md text-xs font-medium">
                Low Stock
              </div>
            )}

            {hamper.stock_quantity === 0 && (
              <div className="absolute top-4 left-4 bg-red-100 text-red-800 px-2 py-1 rounded-md text-xs font-medium">
                Out of Stock
              </div>
            )}
          </div>
        </div>

        {/* Hamper Info */}
        <div className="space-y-6">
          {/* Hamper Title */}
          <h1 className="text-3xl font-bold text-gray-900">{hamper.name}</h1>

          {/* Ratings */}
          <div className="flex items-center">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${star <= 4 ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-2">(12 reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-4">
            <span className="text-2xl font-bold text-teal-600">${hamper.price}</span>
          </div>

          {/* Description */}
          <p className="text-gray-600">{hamper.description}</p>

          {/* Product Details */}
          <div className="space-y-4 border-t border-b border-gray-200 py-4">
            {/* Stock Status */}
            <div className="flex items-center">
              <Check className={`h-5 w-5 mr-2 ${hamper.stock_quantity > 0 ? "text-green-500" : "text-red-500"}`} />
              <span>
                {hamper.stock_quantity > 5
                  ? "In Stock"
                  : hamper.stock_quantity > 0
                    ? `Only ${hamper.stock_quantity} left in stock`
                    : "Out of Stock"}
              </span>
            </div>

            {/* Shipping */}
            <div className="flex items-center text-gray-600">
              <Truck className="h-5 w-5 mr-2 text-teal-600" />
              <span>Free shipping on orders over $100</span>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Quantity Selector */}
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                className="px-3 py-2 text-gray-600 hover:text-teal-600 disabled:text-gray-300"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Math.min(Number.parseInt(e.target.value) || 1, hamper.stock_quantity || 10)))
                }
                className="w-12 text-center border-none focus:ring-0"
                min="1"
                max={hamper.stock_quantity || 10}
              />
              <button
                onClick={increaseQuantity}
                disabled={quantity >= (hamper.stock_quantity || 10)}
                className="px-3 py-2 text-gray-600 hover:text-teal-600 disabled:text-gray-300"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={hamper.stock_quantity === 0 || isAddingToCart}
              className={`flex-1 flex items-center justify-center px-6 py-3 rounded-md font-medium ${
                hamper.stock_quantity === 0
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : isAddingToCart
                    ? "bg-teal-700 text-white"
                    : "bg-teal-600 text-white hover:bg-teal-700"
              }`}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {hamper.stock_quantity === 0 ? "Out of Stock" : isAddingToCart ? "Adding..." : "Add to Cart"}
            </button>
          </div>

          {/* Hamper Contents */}
          {hamper.products && hamper.products.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Hamper Contents</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="space-y-3">
                  {hamper.products.map((product) => (
                    <li key={product.id} className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{product.name}</span>
                        <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                      </div>
                      <div className="text-sm text-gray-600">
                        {product.pivot.quantity > 1 ? `${product.pivot.quantity}x` : ""}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

