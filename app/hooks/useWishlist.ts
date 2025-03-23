"use client"

import { createContext, useContext } from "react"
import type { Product, Hamper } from "../Types"

type WishlistItem = {
  id: number
  wishlistable: Product | Hamper
  wishlistable_type: string
  wishlistable_id: number
}

type WishlistContextType = {
  items: WishlistItem[]
  isLoading: boolean
  addToWishlist: (item: Product | Hamper, type: "product" | "hamper") => Promise<void>
  removeFromWishlist: (wishlistItemId: number) => Promise<void>
  isInWishlist: (id: number, type: "product" | "hamper") => boolean
  getWishlistItemId: (id: number, type: "product" | "hamper") => number
}

const WishlistContext = createContext<WishlistContextType>({
  items: [],
  isLoading: true,
  addToWishlist: async () => {},
  removeFromWishlist: async () => {},
  isInWishlist: () => false,
  getWishlistItemId: () => 0,
})

export const useWishlist = () => useContext(WishlistContext)

export default WishlistContext

