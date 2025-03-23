"use client"

import type React from "react"

import { useState } from "react"
import { ShoppingCart, Heart, Share2 } from "lucide-react"
import { useCart } from "../hooks/useCart"
import { useWishlist } from "../hooks/useWishlist"
import { useAuth } from "../hooks/useAuth"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import type { Product } from "../Types"

interface ProductActionsProps {
  product: Product
}

export default function ClientSideProductActions({ product }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false)
  const { addItem } = useCart()
  const { isInWishlist, addToWishlist, removeFromWishlist, getWishlistItemId } = useWishlist()
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  const isInWishlistState = isInWishlist(product.id, "product")

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (value > 0 && value <= product.stock_quantity) {
      setQuantity(value)
    }
  }

  const increaseQuantity = () => {
    if (quantity < product.stock_quantity) {
      setQuantity(quantity + 1)
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
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
      toast.success(`${product.name} added to cart`)
      setIsAddingToCart(false)
    }, 500)
  }

  const handleWishlistClick = async () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/wishlist")
      return
    }

    setIsAddingToWishlist(true)

    try {
      if (isInWishlistState) {
        await removeFromWishlist(getWishlistItemId(product.id, "product"))
        // Toast is handled in WishlistProvider
      } else {
        await addToWishlist(product, "product")
        // Toast is handled in WishlistProvider
      }
    } catch (error) {
      console.error("Error updating wishlist:", error)
    } finally {
      setIsAddingToWishlist(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        })
        .catch((error) => console.log("Error sharing", error))
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex border border-gray-300 rounded-md max-w-[120px]">
          <button
            className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            onClick={decreaseQuantity}
            disabled={quantity <= 1}
          >
            -
          </button>
          <input
            type="number"
            min="1"
            max={product.stock_quantity}
            value={quantity}
            onChange={handleQuantityChange}
            className="w-full text-center border-x border-gray-300 focus:outline-none"
          />
          <button
            className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            onClick={increaseQuantity}
            disabled={quantity >= product.stock_quantity}
          >
            +
          </button>
        </div>

        <button
          className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-white font-medium ${
            product.stock_quantity > 0
              ? isAddingToCart
                ? "bg-teal-700"
                : "bg-teal-600 hover:bg-teal-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={product.stock_quantity === 0 || isAddingToCart}
          onClick={handleAddToCart}
        >
          {isAddingToCart ? (
            <>
              <span className="animate-spin mr-2">⟳</span>
              Adding...
            </>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart
            </>
          )}
        </button>
      </div>

      <div className="flex gap-3">
        <button
          className={`flex-1 flex items-center justify-center px-4 py-2 border rounded-md font-medium ${
            isInWishlistState
              ? "border-red-300 text-red-600 hover:bg-red-50"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
          onClick={handleWishlistClick}
          disabled={isAddingToWishlist}
        >
          <Heart className={`h-5 w-5 mr-2 ${isInWishlistState ? "fill-current" : ""}`} />
          {isAddingToWishlist ? "Processing..." : isInWishlistState ? "In Wishlist" : "Add to Wishlist"}
        </button>

        <button
          className="flex items-center justify-center p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          onClick={handleShare}
        >
          <Share2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

