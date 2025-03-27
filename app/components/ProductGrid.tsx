"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, Heart, Eye, Star } from "lucide-react"
import type { Product } from "../Types"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useWishlist } from "../hooks/useWishlist"
import { useCart } from "../hooks/useCart"
import toast from "react-hot-toast"
import { useAuth } from "../hooks/useAuth"
import { useRouter } from "next/navigation"
import { apiBaseUrl } from "../lib/axios"

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products}: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} apiBaseUrl={apiBaseUrl} />
      ))}
    </div>
  )
}

interface ProductCardProps {
  product: Product
  index: number
  apiBaseUrl: string
}

function ProductCard({ product, index, apiBaseUrl }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { isInWishlist, addToWishlist, removeFromWishlist, getWishlistItemId } = useWishlist()
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { addItem } = useCart()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isInWishlistState, setIsInWishlistState] = useState(false)

  // Check if we're on a mobile device
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

  // Check if product is in wishlist and update state
  useEffect(() => {
    setIsInWishlistState(isInWishlist(product.id, "product"))
  }, [isInWishlist, product.id])

  // Get the first product image or use a placeholder
  const getFullImageUrl = (url: string | undefined): string => {
    if (!url) return "/placeholder.svg"
    return url.startsWith("http") ? url : `${apiBaseUrl}${url}`
  }

  // Get the first product image or use a placeholder
  const imageUrl =
    product.productImages && product.productImages.length > 0
      ? getFullImageUrl(product.productImages[0].image_url)
      : getFullImageUrl(product.image_url || "/placeholder.svg")

  // Get the second product image for hover effect if available
  const secondImageUrl =
    product.productImages && product.productImages.length > 1
      ? getFullImageUrl(product.productImages[1].image_url)
      : imageUrl

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      router.push("/login?redirect=/wishlist")
      return
    }

    // Optimistically update UI
    const newState = !isInWishlistState
    setIsInWishlistState(newState)

    try {
      if (isInWishlist(product.id, "product")) {
        await removeFromWishlist(getWishlistItemId(product.id, "product"))
        // Toast is handled in WishlistProvider
      } else {
        await addToWishlist(product, "product")
        // Toast is handled in WishlistProvider
      }
    } catch (error) {
      // If there's an error, revert the optimistic update
      setIsInWishlistState(!newState)
      console.error("Error updating wishlist:", error)
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (product.stock_quantity <= 0) {
      toast.error("This product is out of stock")
      return
    }

    setIsAddingToCart(true)

    // Simulate a small delay for better UX
    setTimeout(() => {
      addItem(product, 1)
      toast.success(`${product.name} added to cart`)
      setIsAddingToCart(false)
    }, 500)
  }

  return (
    <motion.div
      className="product-card group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-t-xl">
        <Link href={`/products/${product.id}`}>
          <div className="aspect-square relative overflow-hidden">
            <Image
              src={isHovered ? secondImageUrl : imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-all duration-700"
            />
          </div>

          {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
            <div className="absolute top-2 left-2 badge badge-warning">Low Stock</div>
          )}

          {product.stock_quantity === 0 && <div className="absolute top-2 left-2 badge badge-danger">Out of Stock</div>}
        </Link>

        {/* Desktop wishlist and quick view buttons */}
        <div className="absolute right-2 top-2 hidden md:flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleWishlistClick}
            className={`bg-white rounded-full p-2 shadow-md hover:bg-teal-50 transition-colors ${
              isInWishlistState ? "text-red-500" : "text-teal-600"
            }`}
            aria-label={isInWishlistState ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`h-4 w-4 ${isInWishlistState ? "fill-current" : ""}`} />
          </button>
          <Link
            href={`/products/${product.id}`}
            className="bg-white rounded-full p-2 shadow-md hover:bg-teal-50 transition-colors"
            aria-label="Quick view"
          >
            <Eye className="h-4 w-4 text-teal-600" />
          </Link>
        </div>

        {/* Mobile wishlist button - always visible */}
        <button
          onClick={handleWishlistClick}
          className={`md:hidden absolute right-2 top-2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md ${
            isInWishlistState ? "text-red-500" : "text-teal-600"
          }`}
          aria-label={isInWishlistState ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`h-4 w-4 ${isInWishlistState ? "fill-current" : ""}`} />
        </button>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent h-1/3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="p-3 sm:p-4">
        {product.category && <div className="text-xs text-teal-600 font-medium mb-1">{product.category.name}</div>}

        <Link href={`/products/${product.id}`}>
          <h3 className="font-medium text-gray-800 mb-1 hover:text-teal-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>


        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{product.description}</p>

        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-teal-600">${product.price}</span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0 || isAddingToCart}
            className={`p-2 rounded-full transition-all transform hover:scale-110 ${
              product.stock_quantity === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : isAddingToCart
                  ? "bg-teal-600 text-white"
                  : "bg-teal-100 text-teal-600 hover:bg-teal-600 hover:text-white"
            }`}
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

