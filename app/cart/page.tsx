"use client"

import { useCart } from "../hooks/useCart"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../hooks/useAuth"
import toast from "react-hot-toast"
import { AlertCircle, ShoppingBag, ArrowLeft, Trash2, Plus, Minus, CheckCircle2, TrendingUp } from "lucide-react"
import { apiBaseUrl } from "../lib/axios"

const pulseAnimation = `
  @keyframes gentle-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.03); }
    100% { transform: scale(1); }
  }
`

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Ensure component is mounted before rendering to prevent hydration issues
  useEffect(() => {
    setMounted(true)

    // Check if mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

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
    if (totalPrice < 20) {
      toast.error(`Minimum order amount is $20. You need to add $${(20 - totalPrice).toFixed(2)} more to checkout.`)
      return
    }

    if (!user) {
      toast.error("Please log in to checkout")
      router.push("/login?redirect=/cart")
      return
    }

    router.push("/checkout")
  }

  useEffect(() => {
    if (totalPrice >= 20) {
      // Small celebration when minimum is reached
      const orderSummary = document.querySelector(".order-summary-card")
      if (orderSummary) {
        orderSummary.classList.add("minimum-reached")
        setTimeout(() => {
          orderSummary.classList.remove("minimum-reached")
        }, 1500)
      }
    }
  }, [totalPrice >= 20])

  if (!mounted) {
    return <div className="container mx-auto px-4 py-8">Loading cart...</div>
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

      {/* Mobile Order Summary - Sticky at top for easy access */}
      <div className="md:hidden mb-6">
        <style jsx>{pulseAnimation}</style>
        <div
          className="bg-white border rounded-lg p-4 shadow-sm order-summary-card transition-all duration-300 ease-in-out sticky top-0 z-10"
          style={{
            boxShadow: totalPrice >= 20 ? "0 0 15px rgba(16, 185, 129, 0.2)" : "",
          }}
        >
          {/* Minimum order progress section - Mobile optimized */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Minimum: $20.00</span>
              <span className="text-sm font-medium">${Math.min(totalPrice, 20).toFixed(2)} / $20.00</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div
                className={`h-3 rounded-full transition-all duration-500 ease-out ${
                  totalPrice >= 20 ? "bg-green-500" : totalPrice >= 15 ? "bg-yellow-500" : "bg-teal-600"
                }`}
                style={{ width: `${Math.min((totalPrice / 20) * 100, 100)}%` }}
              ></div>
            </div>

            {totalPrice < 20 ? (
              <div className="flex items-center p-2 bg-amber-50 border border-amber-200 rounded-md mb-3">
                <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                <p className="ml-2 text-xs font-medium text-amber-800">
                  Add ${(20 - totalPrice).toFixed(2)} more to unlock checkout
                </p>
              </div>
            ) : (
              <div className="flex items-center p-2 bg-green-50 border border-green-200 rounded-md mb-3">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <p className="ml-2 text-xs font-medium text-green-800">Minimum reached! Ready for checkout 🎉</p>
              </div>
            )}

            <div className="flex justify-between items-center mb-3 pt-1">
              <span className="font-medium text-sm">Total:</span>
              <span className="font-bold text-base">${totalPrice.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isProcessing || totalPrice < 20}
              className={`w-full py-3 rounded-md transition text-sm font-medium flex items-center justify-center ${
                totalPrice >= 20 ? "bg-teal-600 hover:bg-teal-700 text-white" : "bg-gray-100 text-gray-500"
              }`}
            >
              {isProcessing ? (
                "Processing..."
              ) : totalPrice < 20 ? (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />${(20 - totalPrice).toFixed(2)} More to Checkout
                </>
              ) : (
                "Checkout Now"
              )}
            </button>

            {totalPrice >= 20 && (
              <div className="mt-2 text-center text-xs text-gray-500">Free shipping on orders over $100!</div>
            )}
          </div>
        </div>
      </div>

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
                <div key={`${item.type}-${item.product.id}-${item.product.name}`} className="p-4">
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

        {/* Desktop Order Summary - Right side */}
        <div className="hidden md:block md:col-span-1 mt-6 md:mt-0">
          <style jsx>{pulseAnimation}</style>
          <div
            className="bg-white border rounded-lg p-4 sm:p-6 shadow-sm sticky top-20 order-summary-card transition-all duration-300 ease-in-out"
            style={{
              boxShadow: totalPrice >= 20 ? "0 0 15px rgba(16, 185, 129, 0.2)" : "",
            }}
          >
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

              {/* Minimum order progress section */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Minimum Order: $20.00</span>
                  <span className="text-sm font-medium">${Math.min(totalPrice, 20).toFixed(2)} / $20.00</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
                      totalPrice >= 20 ? "bg-green-500" : totalPrice >= 15 ? "bg-yellow-500" : "bg-teal-600"
                    }`}
                    style={{ width: `${Math.min((totalPrice / 20) * 100, 100)}%` }}
                  ></div>
                </div>

                {totalPrice < 20 ? (
                  <div className="flex items-start mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md animate-pulse">
                    <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="ml-2">
                      <p className="text-sm font-medium text-amber-800">
                        You're ${(20 - totalPrice).toFixed(2)} away from checkout!
                      </p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        Add a few more items to unlock checkout and complete your order.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="ml-2">
                      <p className="text-sm font-medium text-green-800">Minimum order reached! 🎉</p>
                      <p className="text-xs text-green-700 mt-0.5">
                        You've met the $20 minimum order requirement and can proceed to checkout.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isProcessing || totalPrice < 20}
              className={`w-full py-2 rounded-md transition text-sm sm:text-base flex items-center justify-center ${
                totalPrice >= 20 ? "bg-teal-600 hover:bg-teal-700 text-white" : "bg-gray-100 text-gray-500"
              }`}
            >
              {isProcessing ? (
                "Processing..."
              ) : totalPrice < 20 ? (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Add ${(20 - totalPrice).toFixed(2)} More to Unlock
                </>
              ) : (
                "Proceed to Checkout"
              )}
            </button>

            {totalPrice >= 20 && (
              <div className="mt-2 text-center text-xs text-gray-500">Free shipping on orders over $100!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

