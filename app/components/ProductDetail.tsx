"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ShoppingCart,
  Heart,
  Share2,
  Minus,
  Plus,
  ChevronRight,
  Star,
  Check,
  Truck,
  ArrowLeft,
  ArrowRight,
  Info,
  Shield,
  RefreshCcw,
  Zap,
} from "lucide-react"
import type { Product } from "../Types"
import { useCart } from "../hooks/useCart"
import { useWishlist } from "../hooks/useWishlist"
import { useAuth } from "../hooks/useAuth"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { apiBaseUrl } from "../lib/axios"

interface ProductDetailProps {
  product: Product
}

export default function ProductDetail({ product}: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const { addItem } = useCart()
  const { isInWishlist, addToWishlist, removeFromWishlist, getWishlistItemId } = useWishlist()
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  // Handle hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Get product images or use main image as fallback
  const productImages =
    product.productImages && product.productImages.length > 0
      ? product.productImages.map((img) => img.image_url)
      : [product.image_url]

  // Filter out any undefined or null images
  const images = productImages.filter(Boolean)

  // If no images available, use placeholder
  const activeImage = images.length > 0 ? images[activeImageIndex] : "/placeholder.svg"

  // Ensure image URLs have the API prefix
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
    if (quantity < (product.stock_quantity || 10)) {
      setQuantity(quantity + 1)
    }
  }

  const handleAddToCart = () => {
    if (product.stock_quantity <= 0) {
      toast.error("This product is out of stock")
      return
    }

    setIsAddingToCart(true)

    // Simulate a small delay for better UX
    setTimeout(() => {
      addItem(product, quantity)
      toast.success(`${quantity} ${quantity === 1 ? "item" : "items"} of ${product.name} added to cart`)
      setIsAddingToCart(false)
    }, 500)
  }

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/products/" + product.id)
      return
    }

    if (isInWishlist(product.id, "product")) {
      await removeFromWishlist(getWishlistItemId(product.id, "product"))
    } else {
      await addToWishlist(product, "product")
    }
  }

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return null
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-0">
          {/* Product Images - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 p-6 border-r border-gray-100">
            <div className="space-y-6">
              {/* Breadcrumbs */}
              <nav className="flex text-sm text-gray-500 mb-4">
                <Link href="/" className="hover:text-teal-600">
                  Home
                </Link>
                <ChevronRight className="h-4 w-4 mx-1" />
                <Link href="/products" className="hover:text-teal-600">
                  Products
                </Link>
                {product.category && (
                  <>
                    <ChevronRight className="h-4 w-4 mx-1" />
                    <Link href={`/products?category=${product.category_id}`} className="hover:text-teal-600">
                      {product.category.name}
                    </Link>
                  </>
                )}
              </nav>

              {/* Main Image */}
              <div
                className="aspect-square relative rounded-xl overflow-hidden border border-gray-200 cursor-pointer"
                onClick={() => setShowImageModal(true)}
              >
                <Image
                  src={getFullImageUrl(activeImage) || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                  priority
                />

                {/* Image Navigation Buttons */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        prevImage()
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-gray-800 hover:text-teal-600 transition-all"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        nextImage()
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-gray-800 hover:text-teal-600 transition-all"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                    <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                      Low Stock
                    </div>
                  )}

                  {product.stock_quantity === 0 && (
                    <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                      Out of Stock
                    </div>
                  )}
                </div>

                {/* Zoom hint */}
                <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded-md flex items-center">
                  <Zap className="h-3 w-3 mr-1" />
                  Click to zoom
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                        activeImageIndex === index
                          ? "border-teal-600 shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Image
                        src={getFullImageUrl(image) || "/placeholder.svg"}
                        alt={`${product.name} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Info - Takes 3 columns on large screens */}
          <div className="lg:col-span-3 p-6 md:p-8">
            <div className="space-y-6">
              {/* Product Category */}
              {product.category && (
                <div className="inline-block bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm font-medium">
                  {product.category.name}
                </div>
              )}

              {/* Product Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>


              {/* Price */}
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-teal-600">${product.price}</span>

              </div>

              {/* Description */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              {/* Product Details */}
              <div className="space-y-4 border-t border-b border-gray-200 py-6">
                {/* Stock Status */}
                <div className="flex items-center">
                  <div
                    className={`p-2 rounded-full ${product.stock_quantity > 0 ? "bg-green-100" : "bg-red-100"} mr-3`}
                  >
                    <Check className={`h-5 w-5 ${product.stock_quantity > 0 ? "text-green-600" : "text-red-600"}`} />
                  </div>
                  <span className="font-medium">
                    {product.stock_quantity > 5
                      ? "In Stock"
                      : product.stock_quantity > 0
                        ? `Only ${product.stock_quantity} left in stock`
                        : "Out of Stock"}
                  </span>
                </div>

                {/* Shipping */}
                <div className="flex items-center text-gray-700">
                  <div className="p-2 rounded-full bg-blue-100 mr-3">
                    <Truck className="h-5 w-5 text-blue-600" />
                  </div>
                  <span>Free shipping on orders over $100</span>
                </div>

                {/* Returns */}

                {/* Secure Checkout */}
                <div className="flex items-center text-gray-700">
                  <div className="p-2 rounded-full bg-amber-100 mr-3">
                    <Shield className="h-5 w-5 text-amber-600" />
                  </div>
                  <span>Secure checkout</span>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Quantity Selector */}
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                    <button
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className="px-4 py-3 text-gray-600 hover:text-teal-600 hover:bg-gray-50 disabled:text-gray-300 disabled:hover:bg-white"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          Math.max(1, Math.min(Number.parseInt(e.target.value) || 1, product.stock_quantity || 10)),
                        )
                      }
                      className="w-14 text-center border-none focus:ring-0"
                      min="1"
                      max={product.stock_quantity || 10}
                    />
                    <button
                      onClick={increaseQuantity}
                      disabled={quantity >= (product.stock_quantity || 10)}
                      className="px-4 py-3 text-gray-600 hover:text-teal-600 hover:bg-gray-50 disabled:text-gray-300 disabled:hover:bg-white"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock_quantity === 0 || isAddingToCart}
                    className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium shadow-sm transition-all ${
                      product.stock_quantity === 0
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : isAddingToCart
                          ? "bg-teal-700 text-white"
                          : "bg-teal-600 text-white hover:bg-teal-700 transform hover:scale-[1.01] active:scale-[0.99]"
                    }`}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {product.stock_quantity === 0 ? "Out of Stock" : isAddingToCart ? "Adding..." : "Add to Cart"}
                  </button>
                </div>

                {/* Wishlist and Share Buttons */}
                <div className="flex gap-4">
                  {/* Wishlist Button */}
                  <button
                    onClick={handleWishlistToggle}
                    className={`flex-1 flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
                      isInWishlist(product.id, "product")
                        ? "text-red-500 border-red-200 bg-red-50 hover:bg-red-50"
                        : "text-gray-600"
                    }`}
                  >
                    <Heart className={`h-5 w-5 mr-2 ${isInWishlist(product.id, "product") ? "fill-current" : ""}`} />
                    <span>{isInWishlist(product.id, "product") ? "Saved to Wishlist" : "Add to Wishlist"}</span>
                  </button>

                  {/* Share Button */}
                  <button className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Share2 className="h-5 w-5 mr-2 text-gray-600" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  This product is bought from local stores in Zimbabwe, bringing you authentic flavors from home. Please
                  allow 3-5 business days for delivery within Harare.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative w-full max-w-4xl max-h-[90vh]">
            <button
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white z-10"
              onClick={() => setShowImageModal(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative h-[80vh]">
              <Image
                src={getFullImageUrl(activeImage) || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-contain"
              />
            </div>

            {images.length > 1 && (
              <div className="absolute left-0 right-0 bottom-4 flex justify-center gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveImageIndex(index)
                    }}
                    className={`w-3 h-3 rounded-full ${
                      activeImageIndex === index ? "bg-white" : "bg-white/40 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Image Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    prevImage()
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full text-white"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    nextImage()
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full text-white"
                >
                  <ArrowRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

