"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Product, Hamper } from "../Types"
import toast from "react-hot-toast"
import {
  getWishlist,
  addToWishlist as addToWishlistApi,
  removeFromWishlist as removeFromWishlistApi,
} from "../lib/api/wishlist"
import WishlistContext from "../hooks/useWishlist"

export default function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Fetch wishlist items on mount
  useEffect(() => {
    setMounted(true)
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setItems([])
        setIsLoading(false)
        return
      }

      const data = await getWishlist()
      setItems(data)
    } catch (error) {
      console.error("Failed to fetch wishlist:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addToWishlist = async (item: Product | Hamper, type: "product" | "hamper") => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Please login to add items to your wishlist")
        return
      }

      await addToWishlistApi(item.id, type)

      // Refresh wishlist
      fetchWishlist()
      toast.success(`${item.name} added to wishlist`)
    } catch (error: any) {
      if (error.response?.status === 422) {
        // Item already in wishlist
        toast.error("This item is already in your wishlist")
      } else {
        console.error("Failed to add to wishlist:", error)
        toast.error("Failed to add to wishlist")
      }
    }
  }

  const removeFromWishlist = async (wishlistItemId: number) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Please login to manage your wishlist")
        return
      }

      // Find the item before removing it so we can show its name in the toast
      const removedItem = items.find((item) => item.id === wishlistItemId)
      const itemName = removedItem?.wishlistable?.name || "Item"

      await removeFromWishlistApi(wishlistItemId)

      // Update local state
      setItems(items.filter((item) => item.id !== wishlistItemId))

      toast.success(`${itemName} removed from wishlist`)
    } catch (error) {
      console.error("Failed to remove from wishlist:", error)
      toast.error("Failed to remove from wishlist")
    }
  }

  const isInWishlist = (id: number, type: "product" | "hamper") => {
    return items.some(
      (item) =>
        item.wishlistable_id === id &&
        ((type === "product" && item.wishlistable_type.includes("Product")) ||
          (type === "hamper" && item.wishlistable_type.includes("Hamper"))),
    )
  }

  const getWishlistItemId = (id: number, type: "product" | "hamper") => {
    const wishlistItem = items.find(
      (item) =>
        item.wishlistable_id === id &&
        ((type === "product" && item.wishlistable_type.includes("Product")) ||
          (type === "hamper" && item.wishlistable_type.includes("Hamper"))),
    )
    return wishlistItem?.id || 0
  }

  // Only provide the context if we're mounted (to avoid hydration mismatch)
  const value = mounted
    ? {
        items,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        getWishlistItemId,
      }
    : {
        items: [],
        isLoading: true,
        addToWishlist: async () => {},
        removeFromWishlist: async () => {},
        isInWishlist: () => false,
        getWishlistItemId: () => 0,
      }

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

