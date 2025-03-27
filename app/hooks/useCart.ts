"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useEffect, useState, useCallback } from "react"
import { useAuth } from "./useAuth"
import type { Product, Hamper } from "../Types"
import { getCart, updateCart, clearCart as clearServerCart } from "../lib/api/cart"
import { safeStorage } from "../lib/auth-utils"

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
  isLoading: boolean
  cartVersion: number // Add version to force rehydration when needed
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
  setIsLoading: (isLoading: boolean) => void
  resetCartState: () => void // Add function to completely reset cart state
  incrementVersion: () => void // Add function to increment version
}

type CartStore = CartState & CartActions

// Create a custom storage implementation with error handling
const customStorage = {
  getItem: (name: string): string | null => {
    try {
      const str = safeStorage.getItem(name)
      if (!str) return null
      return str
    } catch (error) {
      console.error(`Error getting ${name} from storage:`, error)
      return null
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      safeStorage.setItem(name, value)
    } catch (error) {
      console.error(`Error setting ${name} in storage:`, error)
    }
  },
  removeItem: (name: string): void => {
    try {
      safeStorage.removeItem(name)
    } catch (error) {
      console.error(`Error removing ${name} from storage:`, error)
    }
  },
}

// Create the store with persistence to localStorage
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalPrice: 0,
      removedItemIds: [],
      lastUpdated: Date.now(),
      userId: null, // Initialize with no user
      isLoading: false,
      cartVersion: 1, // Initialize version

      incrementVersion: () => {
        set({ cartVersion: get().cartVersion + 1 })
      },

      resetCartState: () => {
        set({
          items: [],
          totalPrice: 0,
          removedItemIds: [],
          lastUpdated: Date.now(),
          userId: null,
          isLoading: false,
          cartVersion: get().cartVersion + 1, // Increment version to force rehydration
        })

        // Force clear localStorage
        try {
          customStorage.removeItem("cart-storage")
        } catch (e) {
          console.error("Failed to clear localStorage:", e)
        }
      },

      setIsLoading: (isLoading) => {
        set({ isLoading })
      },

      setUserId: (userId) => {
        set({ userId })
      },

      calculateTotalPrice: () => {
        const total = get().items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)
        set({ totalPrice: total })
      },

      // Modified to support type parameter and prevent duplicates
      addItem: (product: Product | Hamper, quantity = 1, type: "product" | "hamper" = "product") => {
        // Don't add if already loading
        if (get().isLoading) return

        const currentItems = [...get().items]
        const removedItemIds = get().removedItemIds.filter((id) => id !== product.id)

        // Find existing item with same product ID, type, and name to ensure uniqueness
        const existingItemIndex = currentItems.findIndex(
          (item) => item.product.id === product.id && item.type === type && item.product.name === product.name,
        )

        let updatedItems
        if (existingItemIndex >= 0) {
          // Update existing item quantity
          updatedItems = [...currentItems]
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity,
          }
        } else {
          // Add new item
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

      // Modified to support type parameter with more precise matching
      removeItem: (productId, type: "product" | "hamper" = "product") => {
        // Store the name of the product being removed for more precise matching
        const productToRemove = get().items.find((item) => item.product.id === productId && item.type === type)
        const productName = productToRemove?.product.name

        const updatedItems = get().items.filter((item) => {
          // If we have the name, use it for more precise matching
          if (productName) {
            return !(item.product.id === productId && item.type === type && item.product.name === productName)
          }
          // Fall back to the original logic if name is not available
          return !(item.product.id === productId && item.type === type)
        })

        const removedItemIds = [...get().removedItemIds, productId]

        set({
          items: updatedItems,
          removedItemIds,
          lastUpdated: Date.now(),
        })
        get().calculateTotalPrice()
      },

      // Modified to support type parameter with more precise matching
      updateQuantity: (productId, quantity, type: "product" | "hamper" = "product") => {
        // Find the specific item to update
        const itemToUpdate = get().items.find((item) => item.product.id === productId && item.type === type)
        const productName = itemToUpdate?.product.name

        const updatedItems = get().items.map((item) => {
          // If we have the name, use it for more precise matching
          if (productName) {
            return item.product.id === productId && item.type === type && item.product.name === productName
              ? { ...item, quantity }
              : item
          }
          // Fall back to the original logic if name is not available
          return item.product.id === productId && item.type === type ? { ...item, quantity } : item
        })
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
          cartVersion: get().cartVersion + 1, // Increment version to force rehydration
        })

        // Also clear server cart if user is logged in
        const userId = get().userId
        if (userId) {
          clearServerCart().catch((err) => console.error("Failed to clear server cart:", err))
        }

        // Force clear localStorage
        try {
          customStorage.removeItem("cart-storage")
        } catch (e) {
          console.error("Failed to clear localStorage:", e)
        }
      },

      // Save cart to server - updated to send all items
      syncWithServer: async () => {
        const userId = get().userId
        if (!userId || get().isLoading) return // Don't sync if no user is logged in or already loading

        try {
          get().setIsLoading(true)
          // Convert our cart items to the format expected by the server
          const serverItems = convertToServerFormat(get().items)
          await updateCart(serverItems)
        } catch (error) {
          console.error("Failed to sync cart with server:", error)
        } finally {
          get().setIsLoading(false)
        }
      },

      // Load cart from server with improved merging logic
      loadFromServer: async () => {
        const userId = get().userId
        if (!userId || get().isLoading) return // Don't load if no user is logged in or already loading

        try {
          get().setIsLoading(true)
          const serverItems = await getCart()

          if (serverItems && serverItems.length > 0) {
            // Filter out any items that were explicitly removed by the user
            const serverFilteredItems = serverItems.filter((item) => !get().removedItemIds.includes(item.product.id))

            // Convert server items to our local format
            const serverCartItems = convertFromServerFormat(serverFilteredItems)

            // Get current local items
            const localItems = [...get().items]

            // Create a new merged cart without duplicates
            const mergedCart: CartItem[] = []

            // First, add all local items
            localItems.forEach((localItem) => {
              // Check if this item exists in server items
              const serverItem = serverCartItems.find(
                (item) => item.product.id === localItem.product.id && item.type === localItem.type,
              )

              if (serverItem) {
                // If it exists in both, use the most recent quantity
                // We'll use local quantity as it's more likely to be up-to-date
                mergedCart.push(localItem)
              } else {
                // If it only exists locally, add it
                mergedCart.push(localItem)
              }
            })

            // Then add server items that don't exist locally
            serverCartItems.forEach((serverItem) => {
              const exists = mergedCart.some(
                (item) => item.product.id === serverItem.product.id && item.type === serverItem.type,
              )

              if (!exists) {
                mergedCart.push(serverItem)
              }
            })

            // Update the cart with merged items
            set({
              items: mergedCart,
              lastUpdated: Date.now(),
            })
            get().calculateTotalPrice()
          }
        } catch (error) {
          console.error("Failed to load cart from server:", error)
        } finally {
          get().setIsLoading(false)
        }
      },
    }),
    {
      name: "cart-storage",
      // Use custom storage with error handling
      // Persist all relevant fields
      partialize: (state: CartStore) => ({
        items: state.items,
        totalPrice: state.totalPrice,
        removedItemIds: state.removedItemIds,
        lastUpdated: state.lastUpdated,
        userId: state.userId,
        isLoading: state.isLoading,
        cartVersion: state.cartVersion,
      }),
    },
  ),
)

// Custom hook to handle cart logic including synchronization
export function useCart() {
  const cartStore = useCartStore()
  const { user, isAuthenticated, checkAndRefreshAuth } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [syncTimeout, setSyncTimeout] = useState<NodeJS.Timeout | null>(null)

  // Function to check auth and reset cart if needed
  const checkAuthAndResetIfNeeded = useCallback(async () => {
    if (!mounted) return

    const isAuthValid = await checkAndRefreshAuth()

    if (!isAuthValid && cartStore.userId) {
      console.log("Auth is invalid but cart has userId, resetting cart state")
      cartStore.resetCartState()
    }
  }, [mounted, checkAndRefreshAuth, cartStore])

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true)
    // Calculate total price on initial load
    cartStore.calculateTotalPrice()

    // Check auth status on initial load
    checkAuthAndResetIfNeeded()

    // Set up periodic auth checks
    const authCheckInterval = setInterval(() => {
      checkAuthAndResetIfNeeded()
    }, 300000) // Check every 5 minutes

    return () => clearInterval(authCheckInterval)
  }, [checkAuthAndResetIfNeeded])

  // Set userId when auth state changes
  useEffect(() => {
    if (!mounted) return

    // Update the userId in the cart store when user logs in/out
    if (isAuthenticated && user) {
      cartStore.setUserId(user.id.toString())
    } else {
      // If user was previously logged in but now logged out, reset cart
      if (cartStore.userId && !isAuthenticated) {
        cartStore.resetCartState()
      } else {
        cartStore.setUserId(null)
      }
    }
  }, [isAuthenticated, user, mounted, cartStore])

  // Sync with server when cart changes and user is logged in
  useEffect(() => {
    if (!mounted) return

    // Clear any existing timeout to prevent multiple syncs
    if (syncTimeout) {
      clearTimeout(syncTimeout)
    }

    if (isAuthenticated && user && cartStore.items.length > 0) {
      // Check auth before syncing
      checkAuthAndResetIfNeeded().then(async () => {
        // Debounce the sync to avoid too many requests
        const timeoutId = setTimeout(() => {
          cartStore.syncWithServer()
        }, 1000) // Increased debounce time to reduce chances of race conditions

        setSyncTimeout(timeoutId)
      })
    }

    return () => {
      if (syncTimeout) clearTimeout(syncTimeout)
    }
  }, [isAuthenticated, user, cartStore.items, mounted, checkAuthAndResetIfNeeded])

  // Load from server when user logs in - only once
  useEffect(() => {
    if (!mounted) return

    let hasLoaded = false

    if (isAuthenticated && user && !hasLoaded) {
      hasLoaded = true
      // When user logs in, load their cart from server
      cartStore.loadFromServer()
    }
  }, [isAuthenticated, user, mounted, cartStore])

  return cartStore
}

export default useCart

