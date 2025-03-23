"use client"

import { ShoppingCart } from "lucide-react"
import { useCart } from "../hooks/useCart"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function CartIcon() {
  const { items } = useCart()
  const [mounted, setMounted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [prevItemsCount, setPrevItemsCount] = useState(0)

  // Handle hydration mismatch by only showing accurate count after mount
  useEffect(() => {
    setMounted(true)
    setPrevItemsCount(items.length)
  }, [])

  // Animate when items count changes
  useEffect(() => {
    if (mounted && items.length !== prevItemsCount) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 300)
      setPrevItemsCount(items.length)
      return () => clearTimeout(timer)
    }
  }, [items.length, mounted, prevItemsCount])

  // Calculate total items count
  const itemsCount = items.reduce((total, item) => total + item.quantity, 0)

  return (
    <Link href="/cart" className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
      <ShoppingCart className="h-5 w-5 text-gray-700" />
      {mounted && itemsCount > 0 && (
        <span
          className={`absolute -top-1 -right-1 bg-teal-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ${
            isAnimating ? "animate-ping-once" : ""
          }`}
        >
          {itemsCount}
        </span>
      )}
    </Link>
  )
}

