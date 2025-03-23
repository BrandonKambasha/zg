"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useEffect, useState } from "react"
import { useAuth } from "./useAuth"
import type { Product, Hamper } from "../Types"
import { getCart, updateCart, clearCart as clearServerCart } from "../lib/api/cart"

// Updated server cart item interface to support both products and hampers
interface ServerCartItem {
  product: Product | Hamper
  quantity: number
  type: "product" | "hamper"
}

// Updated to send both products and hampers to the server
function convertToServerFormat(items: CartItem[]): ServerCartItem[] {
  return items.map((item) => ({
    product: item.product,
    quantity: item.quantity,
    type: item.type,
  }))
}

// Updated to handle both products and hampers from the server
function convertFromServerFormat(items: ServerCartItem[]): CartItem[] {
  return items.map((item) => ({
    product: item.product,
    quantity: item.quantity,
    type: item.type || "product", // Default to product if type is not specified
  }))
}

// Updated to support both products and hampers
interface CartItem {
  product: Product | Hamper
  quantity: number
  type: "product" | "hamper" // Add type to distinguish between products and hampers
}

interface CartState {
  items: CartItem[]
  totalPrice: number
  removedItemIds: number[]
  lastUpdated: number
  userId: string | null
}

interface CartActions {
  addItem: (product: Product | Hamper, quantity?: number, type?: "product" | "hamper") => void
  addHamper: (hamper: Hamper, quantity?: number) => void // New function for hampers
  removeItem: (productId: number, type?: "product" | "hamper") => void
  updateQuantity: (productId: number, quantity: number, type?: "product" | "hamper") => void
  clearCart: () => void
  syncWithServer: () => Promise<void>
  loadFromServer: () => Promise<void>
  calculateTotalPrice: () => void
  setUserId: (userId: string | null) => void
}

type CartStore = CartState & CartActions

// Create the store with persistence to localStorage
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalPrice: 0,
      removedItemIds: [],
      lastUpdated: Date.now(),
      userId: null, // Initialize with no user

      setUserId: (userId) => {
        set({ userId })
      },

      calculateTotalPrice: () => {
        const total = get().items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)
        set({ totalPrice: total })
      },

      // Modified to support type parameter
      addItem: (product: Product | Hamper, quantity = 1, type: "product" | "hamper" = "product") => {
        const currentItems = get().items
        const removedItemIds = get().removedItemIds.filter((id) => id !== product.id)
        const existingItem = currentItems.find((item) => item.product.id === product.id && item.type === type)

        let updatedItems
        if (existingItem) {
          updatedItems = currentItems.map((item) =>
            item.product.id === product.id && item.type === type
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          )
        } else {
          updatedItems = [...currentItems, { product, quantity, type }]
        }

        set({
          items: updatedItems,
          removedItemIds,
          lastUpdated: Date.now(),
        })
        get().calculateTotalPrice()
      },

      // New function specifically for hampers
      addHamper: (hamper: Hamper, quantity = 1) => {
        get().addItem(hamper, quantity, "hamper")
      },

      // Modified to support type parameter
      removeItem: (productId, type: "product" | "hamper" = "product") => {
        const updatedItems = get().items.filter((item) => !(item.product.id === productId && item.type === type))
        const removedItemIds = [...get().removedItemIds, productId]

        set({
          items: updatedItems,
          removedItemIds,
          lastUpdated: Date.now(),
        })
        get().calculateTotalPrice()
      },

      // Modified to support type parameter
      updateQuantity: (productId, quantity, type: "product" | "hamper" = "product") => {
        const updatedItems = get().items.map((item) =>
          item.product.id === productId && item.type === type ? { ...item, quantity } : item,
        )
        set({
          items: updatedItems,
          lastUpdated: Date.now(),
        })
        get().calculateTotalPrice()
      },

      clearCart: () => {
        const removedItemIds = [...get().removedItemIds, ...get().items.map((item) => item.product.id)]
        set({
          items: [],
          totalPrice: 0,
          removedItemIds,
          lastUpdated: Date.now(),
        })

        // Also clear server cart if user is logged in
        const userId = get().userId
        if (userId) {
          clearServerCart().catch((err) => console.error("Failed to clear server cart:", err))
        }

        // Force clear localStorage
        try {
          localStorage.removeItem("cart-storage")

          // Additional fallback to ensure cart is cleared
          localStorage.setItem(
            "cart-storage",
            JSON.stringify({
              state: {
                items: [],
                totalPrice: 0,
                removedItemIds: [],
                lastUpdated: Date.now(),
                userId: null,
              },
              version: 0,
            }),
          )

          // Force a page reload to ensure the cart is cleared in all components
          // This is a last resort and should be used carefully
          // window.location.reload()
        } catch (e) {
          console.error("Failed to clear localStorage:", e)
        }
      },

      // Save cart to server - updated to send all items
      syncWithServer: async () => {
        const userId = get().userId
        if (!userId) return // Don't sync if no user is logged in

        try {
          // Convert our cart items to the format expected by the server
          // Now sending all items, not just products
          const serverItems = convertToServerFormat(get().items)
          await updateCart(serverItems)
        } catch (error) {
          console.error("Failed to sync cart with server:", error)
        }
      },

      // Load cart from server
      loadFromServer: async () => {
        const userId = get().userId
        if (!userId) return // Don't load if no user is logged in

        try {
          const serverItems = await getCart()

          if (serverItems && serverItems.length > 0) {
            // Filter out any items that were explicitly removed by the user
            const serverFilteredItems = serverItems.filter((item) => !get().removedItemIds.includes(item.product.id))

            // Convert server items to our local format
            const filteredItems = convertFromServerFormat(serverFilteredItems)

            // Only update if we have items after filtering
            if (filteredItems.length > 0) {
              set({ items: filteredItems })
              get().calculateTotalPrice()
            }
          }
        } catch (error) {
          console.error("Failed to load cart from server:", error)
        }
      },
    }),
    {
      name: "cart-storage",
      // Force immediate storage updates
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          return JSON.parse(str)
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          localStorage.removeItem(name)
        },
      },
      // Persist all relevant fields
      partialize: (state: CartStore) => ({
        items: state.items,
        totalPrice: state.totalPrice,
        removedItemIds: state.removedItemIds,
        lastUpdated: state.lastUpdated,
        userId: state.userId,
      }),
    },
  ),
)

// Custom hook to handle cart logic including synchronization
export function useCart() {
  const cartStore = useCartStore()
  const { user, isAuthenticated } = useAuth()
  const [mounted, setMounted] = useState(false)

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true)
    // Calculate total price on initial load
    cartStore.calculateTotalPrice()
  }, [])

  // Set userId when auth state changes
  useEffect(() => {
    if (!mounted) return

    // Update the userId in the cart store when user logs in/out
    if (isAuthenticated && user) {
      cartStore.setUserId(user.id.toString())
    } else {
      cartStore.setUserId(null)
    }
  }, [isAuthenticated, user, mounted])

  // Sync with server when cart changes and user is logged in
  useEffect(() => {
    if (!mounted) return

    let timeoutId: NodeJS.Timeout

    if (isAuthenticated && user && cartStore.items.length > 0) {
      // Debounce the sync to avoid too many requests
      timeoutId = setTimeout(() => {
        cartStore.syncWithServer()
      }, 500)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isAuthenticated, user, cartStore.items, mounted])

  // Load from server when user logs in
  useEffect(() => {
    if (!mounted) return

    if (isAuthenticated && user) {
      // When user logs in, load their cart from server
      cartStore.loadFromServer()
    }
  }, [isAuthenticated, user, mounted])

  return cartStore
}

export default useCart

