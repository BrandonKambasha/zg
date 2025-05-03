"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCart } from "../hooks/useCart"
import { useAuth } from "../hooks/useAuth"
import Image from "next/image"
import Link from "next/link"
import toast from "react-hot-toast"
import {
  ChevronLeft,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Apple,
  Smartphone,
  ShoppingBag,
  Package,
  CreditCardIcon as PaymentIcon,
  CheckSquare,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import CheckoutForm from "../components/CheckoutForm"
import PaymentMethodSelector from "../components/PaymentMethodSelector"
import OrderSummary from "../components/OrderSummary"
import { createOrder } from "../lib/api/orders"
import { createCheckoutSession, handleCheckoutCancellation } from "../lib/api/stripe"
import { apiBaseUrl } from "../lib/axios"
import type { ShippingInfo, ShippingFormValues } from "../Types"

// Base shipping cost constant
const SHIPPING_COST = 5

// Cancellation handler component
function CheckoutCancellationHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // Check for canceled parameter and order_id
    const canceled = searchParams.get("canceled")
    const orderId = searchParams.get("order_id")

    if (canceled === "true" && orderId) {
      // Handle the cancellation without using toast.promise
      // This prevents the promise from blocking navigation
      const handleCancellation = async () => {
        try {
          toast.loading("Cancelling your order...", { id: "cancel-order" })
          await handleCheckoutCancellation(orderId)
          toast.success("Order cancelled successfully", { id: "cancel-order" })

          // Redirect to cart page after a short delay
          setTimeout(() => {
            router.push("/cart")
          }, 500)
        } catch (error) {
          console.error("Failed to cancel order:", error)
          // Don't show error toast, just redirect to cart
          router.push("/cart")
        }
      }

      handleCancellation()
    }
  }, [searchParams, router])

  return null // This component doesn't render anything
}

function CheckoutContent() {
  // Use the Zustand cart store
  const { items, totalPrice, clearCart } = useCart()
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1) // 1: Shipping, 2: Payment, 3: Review
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: "",
    email: "",
    phone: "",
    house_number: "",
    city: "",
    street: "",
    location: "",
    country: "Zimbabwe",
    zim_contact: "",
    zim_name: "",
    delivery_zone: null,
    exact_distance: null,
    exact_fee: null,
  })
  const [paymentMethod, setPaymentMethod] = useState("credit_card")
  const [orderId, setOrderId] = useState<number | null>(null)
  const [zoneConfirmed, setZoneConfirmed] = useState(false)
  const [isZoneUpdate, setIsZoneUpdate] = useState(false)
  const [pageReady, setPageReady] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showMobileOrderSummary, setShowMobileOrderSummary] = useState(false)

  // Function to ensure image URLs have the API prefix
  const getFullImageUrl = (url: string | undefined): string => {
    if (!url) return "/placeholder.svg"
    return url.startsWith("http") ? url : `${apiBaseUrl}${url}`
  }

  // Get shipping cost based on delivery zone or exact fee
  const getShippingCost = (zone: number | null, exactFee: number | null) => {
    // If we have an exact fee, use that
    if (exactFee !== null) {
      return exactFee
    }

    // Otherwise fall back to zone-based pricing
    if (!zone) return SHIPPING_COST

    // This is now just a fallback for backward compatibility
    switch (zone) {
      case 1:
        return 5
      case 2:
        return 8
      case 3:
        return 12
      case 4:
        return 15
      default:
        return SHIPPING_COST
    }
  }

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate total with shipping
  const subtotal = totalPrice
  const shipping = getShippingCost(shippingInfo.delivery_zone, shippingInfo.exact_fee ?? null)
  const total = subtotal + shipping
  const deliveryZone = shippingInfo.delivery_zone

  // Initialize user data once it's available
  useEffect(() => {
    if (user && !isAuthLoading && mounted) {
      setShippingInfo((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone_number || prev.phone,
        house_number: user.house_number || prev.house_number,
        city: user.city || prev.city,
        street: user.street || prev.street,
        location: user.location || prev.location,
        zim_contact: user.zim_contact || prev.zim_contact,
        zim_name: user.zim_name || prev.zim_name,
      }))
    }
  }, [user, isAuthLoading, mounted])

  // Check authentication and cart status only after loading is complete
  useEffect(() => {
    if (!mounted) return

    // Only proceed if auth data is loaded and component is mounted
    if (!isAuthLoading && mounted) {
      // Wait a bit to ensure cart is loaded
      const timer = setTimeout(() => {
        setPageReady(true)

        // Check authentication
        if (!isAuthenticated && !redirecting) {
          setRedirecting(true)
          toast.error("Please log in to checkout")
          router.push("/login?redirect=/checkout")
          return
        }

        // Check if cart is empty
        if (items.length === 0 && !redirecting) {
          setRedirecting(true)
          toast.error("Your cart is empty")
          router.push("/cart")
          return
        }
      }, 300) // Small delay to ensure cart is loaded

      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, items.length, router, isAuthLoading, redirecting, mounted])

  // In the handleShippingSubmit function, ensure delivery_zone is handled correctly
  const handleShippingSubmit = (data: ShippingFormValues) => {
    // Check if this is just a zone update
    const isJustZoneUpdate =
      data.delivery_zone !== shippingInfo.delivery_zone && Object.keys(data).length === Object.keys(shippingInfo).length

    // Make sure delivery_zone is not undefined
    const updatedData = {
      ...data,
      delivery_zone: data.delivery_zone || null,
      exact_distance: data.exact_distance || null,
      exact_fee: data.exact_fee || null,
    }

    // Always update the shipping info with the new data
    setShippingInfo(updatedData)

    // Only proceed to the next step if this is a full form submission
    // AND it's not just a zone update
    if (
      !isJustZoneUpdate &&
      updatedData.fullName &&
      updatedData.email &&
      updatedData.phone &&
      updatedData.delivery_zone
    ) {
      // This is a complete form submission with the "Proceed to Payment" button
      setStep(2)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
    // Otherwise, this is just a zone update, so we stay on the current step
  }

  // In the handlePaymentMethodSelect function, update it to properly set the payment method
  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethod(method)
  }

  const handlePaymentSubmit = (method: string, data: any = {}) => {
    setPaymentMethod(method)
    setStep(3)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleCreateOrder = async () => {
    setIsSubmitting(true)

    try {
      // Create the order with basic parameters
      const orderData = {
        items: items.map((item) => ({
          ...(item.type === "hamper" ? { hamper_id: item.product.id } : { product_id: item.product.id }),
          quantity: item.quantity,
          type: item.type,
        })),
        shipping_address: `${shippingInfo.house_number}, ${shippingInfo.city}, ${shippingInfo.street}, ${shippingInfo.location}, ${shippingInfo.country}`,
        zim_contact: shippingInfo.zim_contact,
        phone_number: shippingInfo.phone,
        payment_method: "credit_card", // Always use credit_card for Stripe
        zim_name: shippingInfo.zim_name,
        delivery_zone:
          shippingInfo.exact_fee ||
          (shippingInfo.delivery_zone ? getShippingCost(shippingInfo.delivery_zone, null) : SHIPPING_COST),
        exact_distance: shippingInfo.exact_distance,
        exact_fee: shippingInfo.exact_fee,
        skip_confirmation_email: true, // Add this flag to prevent sending email immediately
      }
      console.log("Creating order with data:", JSON.stringify(orderData, null, 2))

      const order = await createOrder(orderData)
      console.log("Order created:", order)
      setOrderId(order.id)
      return order.id
    } catch (error) {
      console.error("Failed to create order:", error)
      toast.error("Failed to process your order. Please try again.")
      setIsSubmitting(false)
      throw error
    }
  }

  const handlePlaceOrder = async () => {
    // Always use Stripe checkout regardless of the selected payment method
    // This allows us to show different payment methods in the UI but always use Stripe
    setIsSubmitting(true)
    try {
      const newOrderId = await handleCreateOrder()

      // Create Stripe Checkout session
      const data = await createCheckoutSession(newOrderId)

      if (!data.checkout_url) {
        throw new Error("Failed to create checkout session")
      }

      // Redirect to Stripe Checkout
      window.location.href = data.checkout_url
    } catch (error) {
      console.error("Failed to process payment:", error)
      toast.error("Failed to process payment. Please try again.")
      setIsSubmitting(false)
    }
    return
  }

  // Don't render anything until client-side hydration is complete
  if (!mounted) {
    return null
  }

  // Show loading state while checking auth and cart
  if (!pageReady) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if we're redirecting
  if (redirecting || !isAuthenticated || items.length === 0) {
    return null
  }

  // Get step icon based on current step
  const getStepIcon = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return <Package className="h-5 w-5" />
      case 2:
        return <PaymentIcon className="h-5 w-5" />
      case 3:
        return <CheckSquare className="h-5 w-5" />
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
      <div className="mb-4 sm:mb-6">
        <Link href="/cart" className="text-teal-600 hover:text-teal-700 flex items-center transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Cart
        </Link>
      </div>

      <h1 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-8">Checkout</h1>

      {/* Mobile Order Summary Toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowMobileOrderSummary(!showMobileOrderSummary)}
          className="flex items-center justify-between w-full bg-white p-4 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <ShoppingBag className="h-5 w-5 text-teal-600 mr-2" />
            <div>
              <span className="font-medium text-sm">Order Summary</span>
              <p className="text-xs text-gray-500">
                {items.length} items · ${total.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="font-bold text-teal-700 mr-2">${total.toFixed(2)}</span>
            {showMobileOrderSummary ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </button>
      </div>

      {/* Mobile Order Summary - Collapsible */}
      {showMobileOrderSummary && (
        <div className="lg:hidden mb-6 animate-slideDown">
          <OrderSummary
            items={items}
            subtotal={subtotal}
            deliveryZone={shippingInfo.delivery_zone}
            exactDistance={shippingInfo.exact_distance}
            exactFee={shippingInfo.exact_fee}
          />
        </div>
      )}

      {/* Checkout Progress - Desktop */}
      <div className="hidden sm:block mb-10 bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex flex-col items-center cursor-pointer group" onClick={() => setStep(1)}>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                step >= 1 ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-600 group-hover:bg-gray-300"
              }`}
            >
              1
            </div>
            <span className={`text-sm mt-2 ${step === 1 ? "font-medium" : ""} group-hover:text-teal-700`}>
              Shipping
            </span>
          </div>
          <div className={`flex-1 h-1 mx-2 ${step >= 2 ? "bg-teal-600" : "bg-gray-200"}`}></div>
          <div
            className={`flex flex-col items-center cursor-pointer group ${
              !deliveryZone && step === 1 ? "opacity-50 pointer-events-none" : ""
            }`}
            onClick={() => {
              if (step >= 2 || deliveryZone) setStep(2)
            }}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                step >= 2 ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-600 group-hover:bg-gray-300"
              }`}
            >
              2
            </div>
            <span className={`text-sm mt-2 ${step === 2 ? "font-medium" : ""} group-hover:text-teal-700`}>Payment</span>
          </div>
          <div className={`flex-1 h-1 mx-2 ${step >= 3 ? "bg-teal-600" : "bg-gray-200"}`}></div>
          <div
            className={`flex flex-col items-center cursor-pointer group ${
              step < 3 && (!paymentMethod || step === 1) ? "opacity-50 pointer-events-none" : ""
            }`}
            onClick={() => {
              if (step >= 3 || (deliveryZone && paymentMethod)) setStep(3)
            }}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                step >= 3 ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-600 group-hover:bg-gray-300"
              }`}
            >
              3
            </div>
            <span className={`text-sm mt-2 ${step === 3 ? "font-medium" : ""} group-hover:text-teal-700`}>Review</span>
          </div>
        </div>
      </div>

      {/* Checkout Progress - Mobile */}
      <div className="sm:hidden mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`flex flex-col items-center ${
                  stepNumber === step ? "text-teal-600" : stepNumber < step ? "text-gray-500" : "text-gray-300"
                } ${
                  (stepNumber === 2 && !deliveryZone && step === 1) ||
                  (stepNumber === 3 && (!paymentMethod || step === 1))
                    ? "opacity-50"
                    : "cursor-pointer"
                }`}
                onClick={() => {
                  // Apply the same navigation logic as desktop
                  if (
                    (stepNumber === 2 && (step >= 2 || deliveryZone)) ||
                    (stepNumber === 3 && (step >= 3 || (deliveryZone && paymentMethod))) ||
                    stepNumber === 1
                  ) {
                    setStep(stepNumber)
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                }}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    stepNumber === step
                      ? "bg-teal-100 text-teal-600 border-2 border-teal-600"
                      : stepNumber < step
                        ? "bg-teal-600 text-white"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {getStepIcon(stepNumber)}
                </div>
                <span className="text-xs mt-1 font-medium">
                  {stepNumber === 1 ? "Shipping" : stepNumber === 2 ? "Payment" : "Review"}
                </span>
              </div>
            ))}
          </div>
          <div className="flex mt-2">
            <div className={`h-1 flex-1 ${step > 1 ? "bg-teal-600" : "bg-gray-200"}`}></div>
            <div className={`h-1 flex-1 ${step > 2 ? "bg-teal-600" : "bg-gray-200"}`}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Checkout Form */}
        <div className="lg:col-span-2">
          {step === 1 && (
            <CheckoutForm initialValues={shippingInfo} onSubmit={handleShippingSubmit} isSubmitting={isSubmitting} />
          )}

          {step === 2 && (
            <div className="bg-white rounded-xl overflow-hidden shadow-md">
              <div className="px-6 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                <h2 className="text-lg font-medium flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Method
                </h2>
              </div>
              <div className="p-6">
                <PaymentMethodSelector
                  onSelect={handlePaymentMethodSelect}
                  isSubmitting={isSubmitting}
                  selectedMethod={paymentMethod}
                />

                <div className="mt-8">
                  <button
                    onClick={() => {
                      handlePaymentSubmit(paymentMethod)
                    }}
                    className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-4 rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all transform hover:scale-[1.01] active:scale-[0.99] font-medium text-lg shadow-md flex items-center justify-center"
                  >
                    Continue to Review <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white rounded-xl overflow-hidden shadow-md">
              <div className="px-6 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                <h2 className="text-lg font-medium flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Review Your Order
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-8">
                  {/* Shipping Information */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-lg">Shipping Information</h3>
                      <button
                        onClick={() => setStep(1)}
                        className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium">{shippingInfo.fullName}</p>
                      <p>{shippingInfo.house_number}</p>
                      <p>
                        {shippingInfo.street}, {shippingInfo.city} {shippingInfo.location}
                      </p>
                      <p>{shippingInfo.country}</p>
                      <p className="mt-2">{shippingInfo.email}</p>
                      <p>{shippingInfo.phone}</p>
                      {shippingInfo.zim_contact && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">Zimbabwe Contact:</p>
                          <p>{shippingInfo.zim_name}</p>
                          <p>{shippingInfo.zim_contact}</p>
                        </div>
                      )}
                      {shippingInfo.delivery_zone && (
                        <div className="mt-3 inline-block bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium">
                          {shippingInfo.exact_distance
                            ? `${shippingInfo.exact_distance.toFixed(1)}km from CBD`
                            : `Delivery Zone: ${shippingInfo.delivery_zone}`}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-lg">Payment Method</h3>
                      <button
                        onClick={() => setStep(2)}
                        className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {paymentMethod === "credit_card" && (
                        <div className="flex items-center">
                          <CreditCard className="h-5 w-5 mr-2 text-teal-600" />
                          <p>Credit/Debit Card (Stripe)</p>
                        </div>
                      )}
                      {paymentMethod === "apple_pay" && (
                        <div className="flex items-center">
                          <Apple className="h-5 w-5 mr-2 text-teal-600" />
                          <p>Apple Pay (via Stripe)</p>
                        </div>
                      )}
                      {paymentMethod === "google_pay" && (
                        <div className="flex items-center">
                          <Smartphone className="h-5 w-5 mr-2 text-teal-600" />
                          <p>Google Pay (via Stripe)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="font-medium text-lg mb-3">Order Items</h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="divide-y divide-gray-200">
                        {items.map((item) => (
                          <div key={`${item.type}-${item.product.id}`} className="flex items-center p-4">
                            <div className="h-20 w-20 relative flex-shrink-0">
                              <Image
                                src={getFullImageUrl(item.product.image_url) || "/placeholder.svg"}
                                alt={item.product.name}
                                fill
                                className="object-cover rounded-md"
                              />
                            </div>
                            <div className="ml-4 flex-grow">
                              <p className="font-medium">{item.product.name}</p>
                              <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                            </div>
                            <div className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-4 rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 font-medium text-lg shadow-md"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        "Continue to Payment"
                      )}
                    </button>
                    <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
                      <ShieldCheck className="h-4 w-4 mr-1" />
                      <span>You'll be redirected to Stripe's secure payment page</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary - Desktop Only */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-4">
            <OrderSummary
              items={items}
              subtotal={subtotal}
              deliveryZone={shippingInfo.delivery_zone}
              exactDistance={shippingInfo.exact_distance}
              exactFee={shippingInfo.exact_fee}
            />
          </div>
        </div>
      </div>

      {/* Add padding at the bottom to prevent content from being hidden behind the fixed checkout button */}
      <div className="lg:hidden h-20"></div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mb-4"></div>
            <p className="text-gray-600">Loading checkout...</p>
          </div>
        </div>
      }
    >
      <CheckoutCancellationHandler />
      <CheckoutContent />
    </Suspense>
  )
}
