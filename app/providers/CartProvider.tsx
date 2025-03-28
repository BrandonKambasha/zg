"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { useCartStore } from "../hooks/useCart"
import { useAuth } from "../hooks/useAuth"

export default function CartProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const { setUserId, loadFromServer } = useCartStore()

  // Set userId when auth state changes
  useEffect(() => {
    // Update the userId in the cart store when user logs in/out
    if (isAuthenticated && user) {
      setUserId(user.id.toString())
      // When user logs in, load their cart from server
      loadFromServer()
    } else {
      setUserId(null)
    }
  }, [isAuthenticated, user, setUserId, loadFromServer])

  return children
}

