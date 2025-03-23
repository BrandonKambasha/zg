"use client"

import type { Product } from "../Types"
import { useCart } from "../hooks/useCart"
import { useState } from "react"
import toast from "react-hot-toast"

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = () => {
    if (product.stock_quantity <= 0) {
      toast.error("This product is out of stock")
      return
    }

    setIsAdding(true)

    setTimeout(() => {
      addItem(product)
      toast.success(`${product.name} added to cart`)
      setIsAdding(false)
    }, 500)
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding || product.stock_quantity <= 0}
      className={`w-full py-2 rounded-md transition ${
        product.stock_quantity <= 0
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-green-600 text-white hover:bg-green-700"
      }`}
    >
      {product.stock_quantity <= 0 ? "Out of Stock" : isAdding ? "Adding..." : "Add to Cart"}
    </button>
  )
}

