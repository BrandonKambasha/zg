"use client"

import { Heart } from "lucide-react"
import { useWishlist } from "../hooks/useWishlist"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function WishlistIcon() {
  const { items } = useWishlist()
  const [mounted, setMounted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [prevItemsCount, setPrevItemsCount] = useState(0)

  // Handle hydration mismatch by only showing accurate count after mount
  useEffect(() => {
    setMounted(true)
    setPrevItemsCount(items.length)
  }, [items.length])

  // Animate when items count changes
  useEffect(() => {
    if (mounted && items.length !== prevItemsCount) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 300)
      setPrevItemsCount(items.length)
      return () => clearTimeout(timer)
    }
  }, [items.length, mounted, prevItemsCount])

  return (
    <Link href="/wishlist" className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
      <Heart className="h-5 w-5 text-gray-700" />
      {mounted && items.length > 0 && (
        <span
          className={`absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ${
            isAnimating ? "animate-ping-once" : ""
          }`}
        >
          {items.length}
        </span>
      )}
    </Link>
  )
}

