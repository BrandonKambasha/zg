"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "../hooks/useCart"
import Image from "next/image"
import Link from "next/link"
import toast from "react-hot-toast"
import {
  ChevronLeft,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ShoppingBag,
  Package,
  CreditCardIcon as PaymentIcon,
  CheckSquare,
  ChevronUp,
  ChevronDown,
  User,
  Mail,
  Phone,
  Home,
  MapPin,
  Info,
} from "lucide-react"
import { apiBaseUrl } from "../lib/axios"
import DeliveryZoneMap from "../components/DeliveryZoneMap"
import PaymentMethodSelector from "../components/PaymentMethodSelector"
import { createGuestOrder, createGuestCheckoutSession, validateGuestCheckoutInfo } from "../lib/api/guest"

// Base shipping cost constant
const SHIPPING_COST = 5

// Types
interface ShippingInfo {
  fullName: string // We'll keep this in the state but map it to guest_name when sending to API
  email: string
  phone: string
  house_number: string
  city: string
  street: string
  location: string
  country: string
  zim_contact: string
  zim_name: string
  delivery_zone: number | null
  exact_distance: number | null
  exact_fee: number | null
}

interface FormErrors {
  [key: string]: string
}

export default function GuestCheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1) // 1: Contact & Shipping, 2: Payment, 3: Review
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: "",
    email: "",
    phone: "",
    house_number: "",
    city: "Harare", // Fixed as Harare
    street: "",
    location: "",
    country: "Zimbabwe", // Fixed as Zimbabwe
    zim_contact: "",
    zim_name: "",
    delivery_zone: null,
    exact_distance: null,
    exact_fee: null,
  })
  const [paymentMethod, setPaymentMethod] = useState("credit_card")
  const [orderId, setOrderId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [showMobileOrderSummary, setShowMobileOrderSummary] = useState(false)
  const [instructions, setInstructions] = useState("")
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isMapLoaded, setIsMapLoaded] = useState(false)

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

  // Check cart status only after loading is complete
  useEffect(() => {
    if (!mounted) return

    // Check if cart is empty
    if (items.length === 0) {
      toast.error("Your cart is empty")
      router.push("/cart")
    }
  }, [items.length, router, mounted])

  // Handle zone change from DeliveryZoneMap
  const handleZoneChange = (zone: number | null, distance: number | null, fee: number | null) => {
    setShippingInfo((prev) => ({
      ...prev,
      delivery_zone: zone,
      exact_distance: distance,
      exact_fee: fee,
    }))

    // Clear any delivery zone error
    if (formErrors.delivery_zone) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.delivery_zone
        return newErrors
      })
    }

    setIsMapLoaded(true)
  }

  const validateShippingForm = () => {
    const errors: FormErrors = {}

    if (!shippingInfo.fullName.trim()) errors.fullName = "Full name is required"
    if (!shippingInfo.email.trim()) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) {
      errors.email = "Email is invalid"
    }
    if (!shippingInfo.phone.trim()) errors.phone = "Phone number is required"
    if (!shippingInfo.house_number.trim()) errors.house_number = "House number is required"
    if (!shippingInfo.street.trim()) errors.street = "Street is required"
    if (!shippingInfo.location.trim()) errors.location = "Location/suburb is required"
    if (!shippingInfo.zim_name.trim()) errors.zim_name = "Recipient name is required"
    if (!shippingInfo.zim_contact.trim()) errors.zim_contact = "Recipient contact is required"
    if (!shippingInfo.delivery_zone && !isMapLoaded)
      errors.delivery_zone = "Please select your delivery location on the map"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateShippingForm()) {
      toast.error("Please fill in all required fields")
      // Scroll to the first error
      const firstErrorField = Object.keys(formErrors)[0]
      const element = document.getElementById(firstErrorField)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
        element.focus()
      }
      return
    }

    try {
      // Validate checkout info with backend
      const validationResult = await validateGuestCheckoutInfo(
        shippingInfo.email,
        shippingInfo.phone,
        `${shippingInfo.house_number}, ${shippingInfo.street}, ${shippingInfo.location}, ${shippingInfo.city}, ${shippingInfo.country}`,
      )

      if (!validationResult.success) {
        toast.error(validationResult.message || "Invalid checkout information")
        return
      }

      // Proceed to payment step
      setStep(2)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (error) {
      console.error("Validation error:", error)
      toast.error("Could not validate checkout information. Please try again.")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Special handling for the fullName field when the input name is guest_name
    if (name === "guest_name") {
      setShippingInfo((prev) => ({ ...prev, fullName: value }))

      // Clear error for fullName if it exists
      if (formErrors.fullName) {
        setFormErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.fullName
          return newErrors
        })
      }
      return
    }

    setShippingInfo((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethod(method)
  }

  const handlePaymentSubmit = () => {
    setStep(3)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleCreateGuestOrder = async () => {
    setIsSubmitting(true)

    try {
      // Create the order with the correct data structure
      const orderData = {
        email: shippingInfo.email,
        guest_name: shippingInfo.fullName, // Map fullName to guest_name for the API
        items: items.map((item) => ({
          ...(item.type === "hamper" ? { hamper_id: item.product.id } : { product_id: item.product.id }),
          quantity: item.quantity,
        })),
        shipping_address: `${shippingInfo.house_number}, ${shippingInfo.street}, ${shippingInfo.location}, ${shippingInfo.city}, ${shippingInfo.country}`,
        zim_contact: shippingInfo.zim_contact,
        phone_number: shippingInfo.phone,
        zim_name: shippingInfo.zim_name,
        delivery_zone:
          shippingInfo.exact_fee ||
          (shippingInfo.delivery_zone ? getShippingCost(shippingInfo.delivery_zone, null) : SHIPPING_COST),
        instructions: instructions.trim() || undefined,
      }

      const order = await createGuestOrder(orderData)
      setOrderId(order.id.toString())
      return order.id.toString()
    } catch (error) {
      console.error("Failed to create order:", error)
      toast.error("Failed to process your order. Please try again.")
      setIsSubmitting(false)
      throw error
    }
  }

  const handlePlaceOrder = async () => {
    setIsSubmitting(true)
    try {
      // Create checkout session directly instead of creating order first
      const checkoutData = {
        email: shippingInfo.email,
        guest_name: shippingInfo.fullName, // Map fullName to guest_name for the API
        items: items.map((item) => ({
          ...(item.type === "hamper" ? { hamper_id: item.product.id } : { product_id: item.product.id }),
          quantity: item.quantity,
        })),
        shipping_address: `${shippingInfo.house_number}, ${shippingInfo.street}, ${shippingInfo.location}, ${shippingInfo.city}, ${shippingInfo.country}`,
        zim_contact: shippingInfo.zim_contact,
        phone_number: shippingInfo.phone,
        zim_name: shippingInfo.zim_name,
        delivery_zone:
          shippingInfo.exact_fee ||
          (shippingInfo.delivery_zone ? getShippingCost(shippingInfo.delivery_zone, null) : SHIPPING_COST),
        instructions: instructions.trim() || undefined,
      }

      console.log("Sending checkout data:", checkoutData)
      const checkoutSession = await createGuestCheckoutSession(checkoutData)

      // Store email and order ID for tracking
      localStorage.setItem("guest_checkout_email", shippingInfo.email)
      localStorage.setItem("guest_order_id", checkoutSession.order_id)

      // Redirect to Stripe checkout
      window.location.href = checkoutSession.checkout_url
    } catch (error) {
      console.error("Failed to process payment:", error)
      toast.error("Failed to process payment. Please try again.")
      setIsSubmitting(false)
    }
  }

  // Don't render anything until client-side hydration is complete
  if (!mounted) {
    return null
  }

  // Show loading state while checking cart
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    )
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
        <Link
          href="/checkout-options"
          className="text-teal-600 hover:text-teal-700 flex items-center transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Checkout Options
        </Link>
      </div>

      <h1 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-8">Guest Checkout</h1>

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
                {items.length} {items.length === 1 ? "item" : "items"} · ${total.toFixed(2)}
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
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-medium mb-3">Order Summary</h3>
            <div className="space-y-3 mb-3">
              {items.map((item) => (
                <div key={`${item.type}-${item.product.id}`} className="flex items-center">
                  <div className="h-12 w-12 relative flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                    <Image
                      src={getFullImageUrl(item.product.image_url) || "/placeholder.svg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="ml-3 flex-grow">
                    <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity} × ${Number(item.product.price).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-sm font-medium">${(Number(item.product.price) * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg mt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
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
              Contact & Shipping
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
                  {stepNumber === 1 ? "Contact" : stepNumber === 2 ? "Payment" : "Review"}
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
            <div className="bg-white rounded-xl overflow-hidden shadow-md">
              <div className="px-6 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                <h2 className="text-lg font-medium flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Contact & Shipping Information
                </h2>
              </div>
              <div className="p-6">
                <form onSubmit={handleShippingSubmit}>
                  {/* Contact Information Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="guest_name" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="guest_name"
                            name="guest_name"
                            value={shippingInfo.fullName}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                              formErrors.fullName ? "border-red-500" : "border-gray-300"
                            }`}
                            placeholder="John Doe"
                          />
                        </div>
                        {formErrors.fullName && <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>}
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={shippingInfo.email}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                              formErrors.email ? "border-red-500" : "border-gray-300"
                            }`}
                            placeholder="your@email.com"
                          />
                        </div>
                        {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={shippingInfo.phone}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                              formErrors.phone ? "border-red-500" : "border-gray-300"
                            }`}
                            placeholder="+1 234 567 8900"
                          />
                        </div>
                        {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200">Shipping Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="house_number" className="block text-sm font-medium text-gray-700 mb-1">
                          House/Building Number *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Home className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="house_number"
                            name="house_number"
                            value={shippingInfo.house_number}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                              formErrors.house_number ? "border-red-500" : "border-gray-300"
                            }`}
                            placeholder="123"
                          />
                        </div>
                        {formErrors.house_number && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.house_number}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                          Street Name *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="street"
                            name="street"
                            value={shippingInfo.street}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                              formErrors.street ? "border-red-500" : "border-gray-300"
                            }`}
                            placeholder="Main Street"
                          />
                        </div>
                        {formErrors.street && <p className="text-red-500 text-xs mt-1">{formErrors.street}</p>}
                      </div>

                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                          Location/Suburb *
                        </label>
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={shippingInfo.location}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                            formErrors.location ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Avondale"
                        />
                        {formErrors.location && <p className="text-red-500 text-xs mt-1">{formErrors.location}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            value={shippingInfo.city}
                            disabled
                            className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                          />
                          <p className="text-xs text-gray-500 mt-1">Fixed as Harare</p>
                        </div>

                        <div>
                          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                            Country
                          </label>
                          <input
                            type="text"
                            id="country"
                            name="country"
                            value={shippingInfo.country}
                            disabled
                            className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                          />
                          <p className="text-xs text-gray-500 mt-1">Fixed as Zimbabwe</p>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Zone Map */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Your Delivery Location *
                      </label>
                      <div className="bg-teal-50 border border-teal-200 rounded-md p-3 mb-4 flex items-start">
                        <Info className="h-5 w-5 text-teal-600 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-teal-800">
                          Please click on the map to select your exact delivery location. This helps us calculate the
                          correct delivery fee.
                        </p>
                      </div>
                      <div className="border border-gray-300 rounded-lg overflow-hidden">
                        <DeliveryZoneMap
                          onZoneChange={handleZoneChange}
                          initialAddress={{
                            house_number: shippingInfo.house_number,
                            street: shippingInfo.street,
                            city: shippingInfo.city,
                            location: shippingInfo.location,
                          }}
                          formId="guest-checkout-form"
                        />
                      </div>
                      {formErrors.delivery_zone && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.delivery_zone}</p>
                      )}
                      {shippingInfo.delivery_zone && (
                        <div className="mt-2 flex items-center">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm text-green-600 font-medium">
                            {shippingInfo.exact_distance
                              ? `Location selected: ${shippingInfo.exact_distance.toFixed(1)}km from CBD`
                              : `Delivery Zone ${shippingInfo.delivery_zone} selected`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Zimbabwe Recipient Information */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200">
                      Zimbabwe Recipient Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="zim_name" className="block text-sm font-medium text-gray-700 mb-1">
                          Recipient Name *
                        </label>
                        <input
                          type="text"
                          id="zim_name"
                          name="zim_name"
                          value={shippingInfo.zim_name}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                            formErrors.zim_name ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Jane Doe"
                        />
                        {formErrors.zim_name && <p className="text-red-500 text-xs mt-1">{formErrors.zim_name}</p>}
                      </div>

                      <div>
                        <label htmlFor="zim_contact" className="block text-sm font-medium text-gray-700 mb-1">
                          Recipient Contact Number *
                        </label>
                        <input
                          type="tel"
                          id="zim_contact"
                          name="zim_contact"
                          value={shippingInfo.zim_contact}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                            formErrors.zim_contact ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="+263 77 123 4567"
                        />
                        {formErrors.zim_contact && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.zim_contact}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all font-medium flex items-center justify-center"
                    >
                      Continue to Payment <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
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
                    onClick={handlePaymentSubmit}
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
                  {/* Contact Information */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-lg">Contact Information</h3>
                      <button
                        onClick={() => setStep(1)}
                        className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium">{shippingInfo.fullName}</p>
                      <p>{shippingInfo.email}</p>
                      <p>{shippingInfo.phone}</p>
                    </div>
                  </div>

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
                      <p>
                        {shippingInfo.house_number} {shippingInfo.street}
                      </p>
                      <p>
                        {shippingInfo.location}, {shippingInfo.city}
                      </p>
                      <p>{shippingInfo.country}</p>
                      {shippingInfo.delivery_zone && (
                        <div className="mt-3 inline-block bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium">
                          {shippingInfo.exact_distance
                            ? `${shippingInfo.exact_distance.toFixed(1)}km from CBD`
                            : `Delivery Zone: ${shippingInfo.delivery_zone}`}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Zimbabwe Recipient */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-lg">Zimbabwe Recipient</h3>
                      <button
                        onClick={() => setStep(1)}
                        className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium">{shippingInfo.zim_name}</p>
                      <p>{shippingInfo.zim_contact}</p>
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
                          <CreditCard className="h-5 w-5 mr-2 text-gray-600" />
                          <p>Credit/Debit Card (Stripe)</p>
                        </div>
                      )}
                      {paymentMethod === "apple_pay" && (
                        <div className="flex items-center">
                          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.6 12.9c-.1-1.2.5-2.4 1.4-3.1-.5-.8-1.3-1.4-2.2-1.7-1-.3-2 .1-2.6.3-.7.2-1.2.3-1.9.3-.7 0-1.3-.1-1.9-.3-.6-.2-1.2-.5-1.9-.5-1.5 0-2.9.9-3.6 2.2-1.3 2.2-.3 5.5.9 7.3.6.9 1.4 1.9 2.4 1.8.9 0 1.3-.6 2.4-.6s1.5.6 2.5.6c1 0 1.7-.9 2.3-1.8.5-.7.8-1.4 1.1-2.2-1.3-.5-2-1.9-1.9-3.3zM14.9 5.1c.8-1 .8-2.4.7-3.1-.8.1-1.6.5-2.2 1.1-.6.6-.9 1.4-1 2.2.8 0 1.7-.3 2.5-1.2z" />
                          </svg>
                          <p>Apple Pay (via Stripe)</p>
                        </div>
                      )}
                      {paymentMethod === "google_pay" && (
                        <div className="flex items-center">
                          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 24c6.6 0 12-5.4 12-12S18.6 0 12 0 0 5.4 0 12s5.4 12 12 12z" fill="#fff" />
                            <path
                              d="M12 5.5c1.8 0 3.4.6 4.6 1.7l3.4-3.4C17.9 1.6 15.1.5 12 .5 7.3.5 3.2 3.3 1.2 7.2l3.9 3c.9-2.7 3.5-4.7 6.9-4.7z"
                              fill="#EA4335"
                            />
                            <path
                              d="M23.5 12.2c0-.8-.1-1.6-.2-2.3H12v4.3h6.5c-.3 1.5-1.1 2.8-2.3 3.6l3.7 2.9c2.1-2 3.6-5 3.6-8.5z"
                              fill="#4285F4"
                            />
                            <path
                              d="M5.1 14.3l-3.9 3C3.2 20.7 7.3 23.5 12 23.5c3.1 0 5.9-1.1 8-2.9l-3.7-2.9c-1 .7-2.4 1.1-4.3 1.1-3.3 0-6.1-2.2-7.1-5.2l-.8.7z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M12 5.5c1.8 0 3.4.6 4.6 1.7l3.4-3.4C17.9 1.6 15.1.5 12 .5 7.3.5 3.2 3.3 1.2 7.2l3.9 3c.9-2.7 3.5-4.7 6.9-4.7z"
                              fill="#EA4335"
                            />
                          </svg>
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

                  {/* Order Instructions */}
                  <div>
                    <h3 className="font-medium text-lg mb-3">
                      Order Instructions <span className="text-sm font-normal text-gray-500">(Optional)</span>
                    </h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="Add any special instructions or notes for your order (e.g., delivery preferences, dietary requirements, etc.)"
                        className="w-full p-4 min-h-[100px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y"
                        maxLength={500}
                      />
                      <div className="bg-gray-50 px-4 py-2 text-right">
                        <span className="text-xs text-gray-500">{instructions.length}/500 characters</span>
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-medium text-lg mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={`${item.type}-${item.product.id}`} className="flex items-center">
                    <div className="h-16 w-16 relative flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                      <Image
                        src={getFullImageUrl(item.product.image_url) || "/placeholder.svg"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="ml-3 flex-grow">
                      <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity} × ${Number(item.product.price).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-sm font-medium">
                      ${(Number(item.product.price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg mt-4 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery Info */}
              {shippingInfo.delivery_zone && (
                <div className="mt-6 bg-teal-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-teal-800">Delivery Information</p>
                  <p className="text-xs text-teal-700 mt-1">
                    {shippingInfo.exact_distance
                      ? `Your location is ${shippingInfo.exact_distance.toFixed(1)}km from our store.`
                      : `You are in delivery zone ${shippingInfo.delivery_zone}.`}
                  </p>
                  <p className="text-xs text-teal-700 mt-1">Delivery fee: ${shipping.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add padding at the bottom to prevent content from being hidden behind the fixed checkout button */}
      <div className="lg:hidden h-20"></div>
    </div>
  )
}
