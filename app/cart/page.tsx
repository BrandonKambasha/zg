"use client"

import { useCart } from "../hooks/useCart"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../hooks/useAuth"
import toast from "react-hot-toast"
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus } from "lucide-react"
import { apiBaseUrl } from "../lib/axios"


export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  // Force component to update when cart changes
  const [, forceUpdate] = useState({})

  // Add this effect to ensure the component updates when cart changes
  useEffect(() => {
    // Force a re-render when items change
    forceUpdate({})
  }, [items])

  // Function to get the correct link for each item type
  const getItemLink = (item: any) => {
    if (item.type === "hamper") {
      return `/hampers/${item.product.id}`
    }
    return `/products/${item.product.id}`
  }

  // Function to ensure image URLs have the API prefix
  const getFullImageUrl = (url: string | undefined): string => {
    if (!url) return "/placeholder.svg"
    return url.startsWith("http") ? url : `${apiBaseUrl}${url}`
  }

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please log in to checkout")
      router.push("/login?redirect=/cart")
      return
    }

    router.push("/checkout")
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="text-center max-w-md mx-auto">
          <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-300 mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Your Cart is Empty</h1>
          <p className="text-gray-500 mb-4 sm:mb-6">Looks like you haven't added any products to your cart yet.</p>
          <Link
            href="/products"
            className="bg-teal-600 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-teal-700 transition inline-flex items-center text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Your Cart</h1>

      <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
        <div className="md:col-span-2">
          {/* Mobile-friendly cart items list */}
          <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
            {/* Table header - visible only on tablet and up */}
            <div className="hidden sm:grid sm:grid-cols-12 bg-gray-50 px-4 py-3">
              <div className="sm:col-span-6 text-left text-sm font-medium text-gray-500">Item</div>
              <div className="sm:col-span-2 text-center text-sm font-medium text-gray-500">Quantity</div>
              <div className="sm:col-span-2 text-right text-sm font-medium text-gray-500">Price</div>
              <div className="sm:col-span-2 text-right text-sm font-medium text-gray-500">Actions</div>
            </div>

            {/* Cart items */}
            <div className="divide-y">
              {items.map((item) => (
                <div key={`${item.type}-${item.product.id}`} className="p-4">
                  {/* Mobile layout - stacked */}
                  <div className="sm:hidden space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-16 w-16 relative flex-shrink-0">
                          <Image
                            src={getFullImageUrl(item.product.image_url) || "/placeholder.svg"}
                            alt={item.product.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div className="ml-3">
                          <Link href={getItemLink(item)} className="font-medium hover:text-teal-600 line-clamp-2">
                            {item.product.name}
                            {item.type === "hamper" && <span className="text-xs ml-1 text-teal-600">(Hamper)</span>}
                          </Link>
                          <p className="text-gray-500 text-sm mt-1">${Number(item.product.price).toFixed(2)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id, item.type)}
                        className="text-red-600 hover:text-red-800 p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button
                          onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1), item.type)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <div className="w-8 h-8 flex items-center justify-center">{item.quantity}</div>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              Math.min(item.product.stock_quantity, item.quantity + 1),
                              item.type,
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100"
                          disabled={item.quantity >= item.product.stock_quantity}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Tablet and desktop layout - grid */}
                  <div className="hidden sm:grid sm:grid-cols-12 sm:gap-4 sm:items-center">
                    <div className="sm:col-span-6">
                      <div className="flex items-center">
                        <div className="h-16 w-16 relative flex-shrink-0">
                          <Image
                            src={getFullImageUrl(item.product.image_url) || "/placeholder.svg"}
                            alt={item.product.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div className="ml-4">
                          <Link href={getItemLink(item)} className="font-medium hover:text-teal-600">
                            {item.product.name}
                            {item.type === "hamper" && <span className="text-xs ml-1 text-teal-600">(Hamper)</span>}
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="sm:col-span-2 flex justify-center">
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button
                          onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1), item.type)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <div className="w-8 h-8 flex items-center justify-center">{item.quantity}</div>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              Math.min(item.product.stock_quantity, item.quantity + 1),
                              item.type,
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100"
                          disabled={item.quantity >= item.product.stock_quantity}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <div className="sm:col-span-2 text-right font-medium">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>

                    <div className="sm:col-span-2 text-right">
                      <button
                        onClick={() => removeItem(item.product.id, item.type)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-col xs:flex-row justify-between gap-3">
            <Link href="/products" className="text-teal-600 hover:underline flex items-center text-sm sm:text-base">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Continue Shopping
            </Link>
            <button onClick={() => clearCart()} className="text-red-600 hover:underline text-sm sm:text-base">
              Clear Cart
            </button>
          </div>
        </div>

        <div className="md:col-span-1 mt-6 md:mt-0">
          <div className="bg-white border rounded-lg p-4 sm:p-6 shadow-sm sticky top-20">
            <h2 className="text-lg font-medium mb-4">Order Summary</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm sm:text-base">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span>Shipping</span>
                <span className="text-gray-500">Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-4 sm:mb-6">
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 transition disabled:opacity-70 text-sm sm:text-base"
            >
              {isProcessing ? "Processing..." : "Proceed to Checkout"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

