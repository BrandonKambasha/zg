"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
  ShoppingBag,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  User,
  Mail,
  Phone,
  Home,
  MapPin,
  Globe,
  Info,
  Loader2,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { apiBaseUrl } from "../lib/axios"
import DeliveryZoneMap from "../components/DeliveryZoneMap"
import { createGuestCheckoutSession, validateGuestCheckoutInfo } from "../lib/api/guest"

// Base shipping cost constant
const SHIPPING_COST = 5

// Schema for guest checkout
const guestCheckoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(6, "Phone number is required"),
  house_number: z.string().min(1, "House number is required"),
  city: z.string().min(2, "City is required"),
  street: z.string().min(2, "Street is required"),
  location: z.string().min(2, "Location is required"),
  country: z.string().min(2, "Country is required"),
  zim_contact: z.string().min(2, "Please enter a Zimbabwe Phone number to contact in Zimbabwe"),
  zim_name: z.string().min(2, "Please enter a name of the contact in Zimbabwe"),
  delivery_zone: z.number().nullable(),
  exact_distance: z.number().nullable().optional(),
  exact_fee: z.number().nullable().optional(),
  zim_contact_id: z.string().min(2, "Zimbabwe contact ID is required"),
})

type GuestCheckoutFormValues = z.infer<typeof guestCheckoutSchema>

export default function GuestCheckoutPage() {
  const { items, totalPrice } = useCart()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showMobileOrderSummary, setShowMobileOrderSummary] = useState(false)
  const [instructions, setInstructions] = useState("")
  // Accordion state
  const [showMap, setShowMap] = useState(false)
  const [deliveryZone, setDeliveryZone] = useState<number | null>(null)
  const [exactDistance, setExactDistance] = useState<number | null>(null)
  const [exactFee, setExactFee] = useState<number | null>(null)
  const [zoneConfirmed, setZoneConfirmed] = useState(false)
  const [zoneError, setZoneError] = useState<string | null>(null)
  const [isZoneUpdate, setIsZoneUpdate] = useState(false)
  const [activeSection, setActiveSection] = useState<string>("contact")
  const [formProgress, setFormProgress] = useState(0)

  const form = useForm<GuestCheckoutFormValues>({
    resolver: zodResolver(guestCheckoutSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      house_number: "",
      city: "Harare",
      street: "",
      location: "",
      country: "Zimbabwe",
      zim_contact: "",
      zim_name: "",
      delivery_zone: null,
      exact_distance: null,
      exact_fee: null,
      zim_contact_id: "",
    },
    mode: "onChange",
  })

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    watch,
    setValue,
    trigger,
  } = form

  // Watch form fields
  const house_number = watch("house_number")
  const street = watch("street")
  const city = watch("city")
  const location = watch("location")
  const country = watch("country")
  const fullName = watch("fullName")
  const email = watch("email")
  const phone = watch("phone")
  const zim_name = watch("zim_name")
  const zim_contact = watch("zim_contact")
  const zim_contact_id = watch("zim_contact_id")

  // Function to ensure image URLs have the API prefix
  const getFullImageUrl = (url: string | undefined): string => {
    if (!url) return "/placeholder.svg"
    return url.startsWith("http") ? url : `${apiBaseUrl}${url}`
  }

  // Get shipping cost based on delivery zone or exact fee
  const getShippingCost = (zone: number | null, exactFee: number | null) => {
    if (exactFee !== null) {
      return exactFee
    }
    if (!zone) return SHIPPING_COST
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
  const shipping = getShippingCost(deliveryZone, exactFee ?? null)
  const total = subtotal + shipping

  // Calculate form progress
  useEffect(() => {
    const totalFields = Object.keys(guestCheckoutSchema.shape).length
    const filledFields = Object.keys(dirtyFields).length
    setFormProgress(Math.min(100, Math.round((filledFields / totalFields) * 100)))
  }, [dirtyFields])

  // Check cart status
  useEffect(() => {
    if (!mounted) return
    if (items.length === 0) {
      toast.error("Your cart is empty")
      router.push("/cart")
    }
  }, [items.length, router, mounted])

  // Show map when address fields are filled
  useEffect(() => {
    if (house_number && street && city) {
      setShowMap(true)
    } else {
      setShowMap(false)
      setDeliveryZone(null)
      setExactDistance(null)
      setExactFee(null)
      setValue("delivery_zone", null)
      setValue("exact_distance", null)
      setValue("exact_fee", null)
      setZoneConfirmed(false)
    }
  }, [house_number, street, city, location, setValue])

  // Handle zone change from the map
  const handleZoneChange = (zone: number | null, distance: number | null, fee: number | null) => {
    setIsZoneUpdate(true)

    const zoneIsConfirmed = zone !== null
    setValue("delivery_zone", zone)
    setDeliveryZone(zone)

    if (distance !== null) {
      setValue("exact_distance", distance)
      setExactDistance(distance)
    }

    if (fee !== null) {
      setValue("exact_fee", fee)
      setExactFee(fee)
    }

    setZoneConfirmed(zoneIsConfirmed)
    setZoneError(null)

    // Auto-advance to review if zone is confirmed
    if (zoneIsConfirmed) {
      setActiveSection("review")
      setTimeout(() => {
        const element = document.getElementById("review")
        if (element) {
          const yOffset = -20
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
          window.scrollTo({ top: y, behavior: "smooth" })
        }
      }, 100)
    }

    setTimeout(() => {
      setIsZoneUpdate(false)
    }, 100)
  }

  // Get current address for the map
  const currentAddress = {
    house_number: house_number || "",
    street: street || "",
    city: city || "",
    location: location || "",
  }

  // Function to validate a section and move to the next one
  const validateSectionAndProceed = async (currentSection: string, nextSection: string) => {
    let fieldsToValidate: string[] = []

    switch (currentSection) {
      case "contact":
        fieldsToValidate = ["fullName", "email", "phone"]
        break
      case "shipping":
        fieldsToValidate = ["house_number", "street", "location", "city", "country"]
        break
      case "zimbabwe":
        fieldsToValidate = ["zim_name", "zim_contact", "zim_contact_id"]
        break
    }

    const isValid = await trigger(fieldsToValidate as any)

    if (isValid) {
      setActiveSection(nextSection)
      setTimeout(() => {
        const element = document.getElementById(nextSection)
        if (element) {
          const yOffset = -20
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
          window.scrollTo({ top: y, behavior: "smooth" })
        }
      }, 100)
    }
  }

  // Form submission handler
  const onFormSubmit = async (data: GuestCheckoutFormValues) => {
    if (isZoneUpdate) {
      return
    }

    // Validate delivery zone
    if (showMap && country === "Zimbabwe") {
      if (!deliveryZone) {
        setZoneError("You must select a delivery zone to proceed")
        setActiveSection("delivery")
        return
      }
      if (!zoneConfirmed) {
        setZoneError("You must confirm your delivery zone to proceed")
        setActiveSection("delivery")
        return
      }
    }

    setIsSubmitting(true)
    try {
      // Validate checkout info with backend
      const validationResult = await validateGuestCheckoutInfo(
        data.email,
        data.phone,
        `${data.house_number}, ${data.street}, ${data.location}, ${data.city}, ${data.country}`,
        data.zim_contact_id,
      )

      if (!validationResult.success) {
        toast.error(validationResult.message || "Invalid checkout information")
        setIsSubmitting(false)
        return
      }

      // Create checkout session
      const checkoutData = {
        email: data.email,
        guest_name: data.fullName,
        items: items.map((item) => ({
          ...(item.type === "hamper" ? { hamper_id: item.product.id } : { product_id: item.product.id }),
          quantity: item.quantity,
        })),
        shipping_address: `${data.house_number}, ${data.street}, ${data.location}, ${data.city}, ${data.country}`,
        zim_contact: data.zim_contact,
        phone_number: data.phone,
        zim_name: data.zim_name,
        delivery_zone: exactFee || (deliveryZone ? getShippingCost(deliveryZone, null) : SHIPPING_COST),
        instructions: instructions.trim() || undefined,
        zim_contact_id: data.zim_contact_id,
      }

      const checkoutSession = await createGuestCheckoutSession(checkoutData)

      // Store for tracking
      localStorage.setItem("guest_checkout_email", data.email)
      localStorage.setItem("guest_order_id", checkoutSession.order_id)

      // Redirect to Stripe
      window.location.href = checkoutSession.checkout_url
    } catch (error) {
      console.error("Failed to process payment:", error)
      toast.error("Failed to process payment. Please try again.")
      setIsSubmitting(false)
    }
  }

  // Don't render until hydrated
  if (!mounted) {
    return null
  }

  // Show loading if cart is empty
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Checkout Form */}
        <div className="lg:col-span-2">
          <div className="max-w-3xl mx-auto">
            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Checkout Progress</span>
                <span className="text-sm font-medium text-teal-600">{formProgress}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-teal-400 to-teal-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${formProgress}%` }}
                ></div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8" id="guest-checkout-form">
              {/* Contact Information Section */}
              <div
                id="contact"
                className={`bg-white rounded-xl overflow-hidden shadow-sm border ${
                  activeSection === "contact" ? "border-teal-300 ring-1 ring-teal-300" : "border-gray-200"
                } transition-all duration-200`}
              >
                <div
                  className={`px-6 py-4 ${
                    activeSection === "contact"
                      ? "bg-gradient-to-r from-teal-500 to-teal-600"
                      : "bg-gradient-to-r from-gray-100 to-gray-200"
                  } transition-all duration-200`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveSection("contact")}
                    className="w-full text-left flex items-center justify-between"
                  >
                    <h3
                      className={`text-lg font-medium flex items-center ${activeSection === "contact" ? "text-white" : "text-gray-700"}`}
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-teal-600 mr-3 font-bold">
                        1
                      </span>
                      Contact Information
                    </h3>
                    {activeSection !== "contact" && (
                      <div className="flex items-center">
                        {fullName && email && phone && !errors.fullName && !errors.email && !errors.phone ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                        )}
                        <ChevronDown
                          className={`h-5 w-5 ${activeSection === "contact" ? "text-white" : "text-gray-500"}`}
                        />
                      </div>
                    )}
                  </button>
                </div>

                <AnimatePresence>
                  {activeSection === "contact" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                              Full Name*
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                id="fullName"
                                type="text"
                                {...register("fullName")}
                                className={`w-full pl-10 p-2.5 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                  errors.fullName
                                    ? "border-red-300 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                                }`}
                                placeholder="John Doe"
                              />
                            </div>
                            {errors.fullName && (
                              <p className="text-red-500 text-sm mt-1 flex items-center">
                                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                                {errors.fullName.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                              Email Address*
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                id="email"
                                type="email"
                                {...register("email")}
                                className={`w-full pl-10 p-2.5 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                  errors.email
                                    ? "border-red-300 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                                }`}
                                placeholder="your@email.com"
                              />
                            </div>
                            {errors.email && (
                              <p className="text-red-500 text-sm mt-1 flex items-center">
                                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                                {errors.email.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                              Phone Number*
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                id="phone"
                                type="tel"
                                {...register("phone")}
                                className={`w-full pl-10 p-2.5 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                  errors.phone
                                    ? "border-red-300 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                                }`}
                                placeholder="+1 (555) 123-4567"
                              />
                            </div>
                            {errors.phone && (
                              <p className="text-red-500 text-sm mt-1 flex items-center">
                                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                                {errors.phone.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                          <button
                            type="button"
                            onClick={() => validateSectionAndProceed("contact", "shipping")}
                            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md font-medium transition-colors"
                          >
                            Continue to Shipping
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {activeSection !== "contact" &&
                  fullName &&
                  email &&
                  phone &&
                  !errors.fullName &&
                  !errors.email &&
                  !errors.phone && (
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:justify-between text-sm">
                        <div className="flex items-center mb-2 sm:mb-0">
                          <User className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-gray-700">{fullName}</span>
                        </div>
                        <div className="flex items-center mb-2 sm:mb-0">
                          <Mail className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-gray-700">{email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-gray-700">{phone}</span>
                        </div>
                      </div>
                    </div>
                  )}
              </div>

              {/* Shipping Address Section */}
              <div
                id="shipping"
                className={`bg-white rounded-xl overflow-hidden shadow-sm border ${
                  activeSection === "shipping" ? "border-teal-300 ring-1 ring-teal-300" : "border-gray-200"
                } transition-all duration-200`}
              >
                <div
                  className={`px-6 py-4 ${
                    activeSection === "shipping"
                      ? "bg-gradient-to-r from-teal-500 to-teal-600"
                      : "bg-gradient-to-r from-gray-100 to-gray-200"
                  } transition-all duration-200`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveSection("shipping")}
                    className="w-full text-left flex items-center justify-between"
                    disabled={!fullName || !email || !phone || !!errors.fullName || !!errors.email || !!errors.phone}
                  >
                    <h3
                      className={`text-lg font-medium flex items-center ${activeSection === "shipping" ? "text-white" : "text-gray-700"}`}
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-teal-600 mr-3 font-bold">
                        2
                      </span>
                      Shipping Address
                    </h3>
                    {activeSection !== "shipping" && (
                      <div className="flex items-center">
                        {house_number &&
                        street &&
                        city &&
                        location &&
                        country &&
                        !errors.house_number &&
                        !errors.street &&
                        !errors.city &&
                        !errors.location &&
                        !errors.country ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                        )}
                        <ChevronDown
                          className={`h-5 w-5 ${activeSection === "shipping" ? "text-white" : "text-gray-500"}`}
                        />
                      </div>
                    )}
                  </button>
                </div>

                <AnimatePresence>
                  {activeSection === "shipping" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label htmlFor="house_number" className="block text-sm font-medium text-gray-700">
                              House/Apt Number*
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Home className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                id="house_number"
                                type="text"
                                {...register("house_number")}
                                className={`w-full pl-10 p-2.5 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                  errors.house_number
                                    ? "border-red-300 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                                }`}
                                placeholder="123"
                              />
                            </div>
                            {errors.house_number && (
                              <p className="text-red-500 text-sm mt-1 flex items-center">
                                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                                {errors.house_number.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                              Street*
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPin className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                id="street"
                                type="text"
                                {...register("street")}
                                className={`w-full pl-10 p-2.5 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                  errors.street
                                    ? "border-red-300 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                                }`}
                                placeholder="Main Street"
                              />
                            </div>
                            {errors.street && (
                              <p className="text-red-500 text-sm mt-1 flex items-center">
                                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                                {errors.street.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                              Location/Suburb*
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPin className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                id="location"
                                type="text"
                                {...register("location")}
                                className={`w-full pl-10 p-2.5 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                  errors.location
                                    ? "border-red-300 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                                }`}
                                placeholder="Avondale"
                              />
                            </div>
                            {errors.location && (
                              <p className="text-red-500 text-sm mt-1 flex items-center">
                                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                                {errors.location.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                              City*
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPin className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                id="city"
                                type="text"
                                value="Harare"
                                readOnly
                                {...register("city")}
                                className="w-full pl-10 p-2.5 border rounded-md bg-gray-50 cursor-not-allowed"
                              />
                            </div>
                            <p className="text-xs text-gray-500">Delivery is only available in Harare</p>
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                              Country*
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                <Globe className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                id="country"
                                type="text"
                                value="Zimbabwe"
                                readOnly
                                {...register("country")}
                                className="w-full pl-10 p-2.5 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                              />
                            </div>
                            <p className="text-xs text-gray-500">We currently only deliver within Zimbabwe</p>
                          </div>
                        </div>

                        <div className="mt-6 flex justify-between">
                          <button
                            type="button"
                            onClick={() => setActiveSection("contact")}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={() => validateSectionAndProceed("shipping", "zimbabwe")}
                            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md font-medium transition-colors"
                          >
                            Continue
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {activeSection !== "shipping" &&
                  house_number &&
                  street &&
                  city &&
                  location &&
                  country &&
                  !errors.house_number &&
                  !errors.street &&
                  !errors.city &&
                  !errors.location &&
                  !errors.country && (
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                      <div className="text-sm text-gray-700">
                        <p className="mb-1">
                          {house_number} {street}, {location}
                        </p>
                        <p>
                          {city}, {country}
                        </p>
                      </div>
                    </div>
                  )}
              </div>

              {/* Zimbabwe Contact Section */}
              <div
                id="zimbabwe"
                className={`bg-white rounded-xl overflow-hidden shadow-sm border ${
                  activeSection === "zimbabwe" ? "border-teal-300 ring-1 ring-teal-300" : "border-gray-200"
                } transition-all duration-200`}
              >
                <div
                  className={`px-6 py-4 ${
                    activeSection === "zimbabwe"
                      ? "bg-gradient-to-r from-teal-500 to-teal-600"
                      : "bg-gradient-to-r from-gray-100 to-gray-200"
                  } transition-all duration-200`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveSection("zimbabwe")}
                    className="w-full text-left flex items-center justify-between"
                    disabled={
                      !house_number ||
                      !street ||
                      !city ||
                      !location ||
                      !country ||
                      !!errors.house_number ||
                      !!errors.street ||
                      !!errors.city ||
                      !!errors.location ||
                      !!errors.country
                    }
                  >
                    <h3
                      className={`text-lg font-medium flex items-center ${activeSection === "zimbabwe" ? "text-white" : "text-gray-700"}`}
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-teal-600 mr-3 font-bold">
                        3
                      </span>
                      Zimbabwe Contact
                    </h3>
                    {activeSection !== "zimbabwe" && (
                      <div className="flex items-center">
                        {zim_name &&
                        zim_contact &&
                        zim_contact_id &&
                        !errors.zim_name &&
                        !errors.zim_contact &&
                        !errors.zim_contact_id ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                        )}
                        <ChevronDown
                          className={`h-5 w-5 ${activeSection === "zimbabwe" ? "text-white" : "text-gray-500"}`}
                        />
                      </div>
                    )}
                  </button>
                </div>

                <AnimatePresence>
                  {activeSection === "zimbabwe" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6">
                        {/* Enhanced warning message */}
                        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-md">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <Info className="h-5 w-5 text-amber-400" />
                            </div>
                            <div className="ml-3">
                              <h4 className="text-sm font-medium text-amber-800 mb-1">
                                Important: ID Verification Required
                              </h4>
                              <p className="text-sm text-amber-700">
                                Please provide accurate contact information for the recipient in Zimbabwe. We verify the
                                ID number with the contact person before delivery to ensure secure package handling.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label htmlFor="zim_name" className="block text-sm font-medium text-gray-700">
                              Contact Name*
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                id="zim_name"
                                type="text"
                                {...register("zim_name")}
                                className={`w-full pl-10 p-2.5 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                  errors.zim_name
                                    ? "border-red-300 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                                }`}
                                placeholder="Local contact name"
                              />
                            </div>
                            {errors.zim_name && (
                              <p className="text-red-500 text-sm mt-1 flex items-center">
                                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                                {errors.zim_name.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="zim_contact" className="block text-sm font-medium text-gray-700">
                              Contact Phone*
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                id="zim_contact"
                                type="tel"
                                {...register("zim_contact")}
                                className={`w-full pl-10 p-2.5 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                  errors.zim_contact
                                    ? "border-red-300 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                                }`}
                                placeholder="+263 7X XXX XXXX"
                              />
                            </div>
                            {errors.zim_contact && (
                              <p className="text-red-500 text-sm mt-1 flex items-center">
                                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                                {errors.zim_contact.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="zim_contact_id" className="block text-sm font-medium text-gray-700">
                              Contact ID Number*
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <CreditCard className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                id="zim_contact_id"
                                type="text"
                                {...register("zim_contact_id")}
                                className={`w-full pl-10 p-2.5 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                  errors.zim_contact_id
                                    ? "border-red-300 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                                }`}
                                placeholder="63-123456A12"
                              />
                            </div>
                            {errors.zim_contact_id && (
                              <p className="text-red-500 text-sm mt-1 flex items-center">
                                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                                {errors.zim_contact_id.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-6 flex justify-between">
                          <button
                            type="button"
                            onClick={() => setActiveSection("shipping")}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={() => validateSectionAndProceed("zimbabwe", "delivery")}
                            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md font-medium transition-colors"
                          >
                            Continue
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {activeSection !== "zimbabwe" &&
                  zim_name &&
                  zim_contact &&
                  zim_contact_id &&
                  !errors.zim_name &&
                  !errors.zim_contact &&
                  !errors.zim_contact_id && (
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:justify-between text-sm">
                        <div className="flex items-center mb-2 sm:mb-0">
                          <User className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-gray-700">{zim_name}</span>
                        </div>
                        <div className="flex items-center mb-2 sm:mb-0">
                          <Phone className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-gray-700">{zim_contact}</span>
                        </div>
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-gray-700 text-xs">ID: {zim_contact_id}</span>
                        </div>
                      </div>
                    </div>
                  )}
              </div>

              {/* Hidden fields for delivery zone, exact distance and fee */}
              <input type="hidden" {...register("delivery_zone")} />
              <input type="hidden" {...register("exact_distance")} />
              <input type="hidden" {...register("exact_fee")} />

              {/* Delivery Zone Map - Only show for Zimbabwe addresses */}
              {showMap && (
                <div
                  id="delivery"
                  className={`bg-white rounded-xl overflow-hidden shadow-sm border ${
                    activeSection === "delivery" ? "border-teal-300 ring-1 ring-teal-300" : "border-gray-200"
                  } transition-all duration-200 delivery-zone-map-section`}
                >
                  <div
                    className={`px-6 py-4 ${
                      activeSection === "delivery"
                        ? "bg-gradient-to-r from-teal-500 to-teal-600"
                        : "bg-gradient-to-r from-gray-100 to-gray-200"
                    } transition-all duration-200`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveSection("delivery")}
                      className="w-full text-left flex items-center justify-between"
                      disabled={
                        !zim_name ||
                        !zim_contact ||
                        !zim_contact_id ||
                        !!errors.zim_name ||
                        !!errors.zim_contact ||
                        !!errors.zim_contact_id
                      }
                    >
                      <h3
                        className={`text-lg font-medium flex items-center ${activeSection === "delivery" ? "text-white" : "text-gray-700"}`}
                      >
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-teal-600 mr-3 font-bold">
                          4
                        </span>
                        Delivery Zone Selection
                      </h3>
                      {activeSection !== "delivery" && (
                        <div className="flex items-center">
                          {deliveryZone && zoneConfirmed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                          )}
                          <ChevronDown
                            className={`h-5 w-5 ${activeSection === "delivery" ? "text-white" : "text-gray-500"}`}
                          />
                        </div>
                      )}
                    </button>
                  </div>

                  <AnimatePresence>
                    {activeSection === "delivery" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6">
                          {zoneError && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                              <p>{zoneError}</p>
                            </div>
                          )}

                          <DeliveryZoneMap
                            onZoneChange={handleZoneChange}
                            initialAddress={currentAddress}
                            formId="guest-checkout-form"
                          />

                          {showMap && !deliveryZone && (
                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="flex items-center">
                                <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
                                <p className="text-sm text-yellow-800">
                                  You must select and confirm a delivery zone to proceed with checkout.
                                </p>
                              </div>
                            </div>
                          )}

                          {deliveryZone && zoneConfirmed ? (
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                              <div className="flex items-start">
                                <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                                <div>
                                  <p className="font-medium">
                                    {exactDistance !== null
                                      ? `Your address is ${exactDistance.toFixed(1)}km from the city center (Confirmed)`
                                      : `Your address is in Zone ${deliveryZone} (Confirmed)`}
                                  </p>
                                  <p className="text-sm mt-1">
                                    Delivery Fee: $
                                    {exactFee !== null
                                      ? exactFee.toFixed(2)
                                      : deliveryZone === 1
                                        ? "5"
                                        : deliveryZone === 2
                                          ? "8"
                                          : deliveryZone === 3
                                            ? "12"
                                            : "15"}
                                    {exactDistance !== null && exactDistance > 10 && (
                                      <span className="block mt-1 text-xs">
                                        (Base fee: $5 + ${(exactFee! - 5).toFixed(2)} for{" "}
                                        {Math.ceil(exactDistance - 10)} additional km)
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : deliveryZone ? (
                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                              <div className="flex items-start">
                                <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                                <div>
                                  <p className="font-medium">
                                    {exactDistance !== null
                                      ? `Your address is ${exactDistance.toFixed(1)}km from the city center (Not Confirmed)`
                                      : `Your address is in Zone ${deliveryZone} (Not Confirmed)`}
                                  </p>
                                  <p className="text-sm mt-1">
                                    Please confirm your delivery zone on the map before proceeding.
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                              <div className="flex items-start">
                                <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                                <div>
                                  <p className="font-medium">Delivery zone not detected</p>
                                  <p className="text-sm mt-1">
                                    Please search for your neighborhood and select a location from the dropdown to
                                    determine your delivery zone.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="mt-6 flex justify-start">
                            <button
                              type="button"
                              onClick={() => setActiveSection("zimbabwe")}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            >
                              Back
                            </button>
                            {deliveryZone && zoneConfirmed ? (
                              <button
                                type="button"
                                onClick={() => setActiveSection("review")}
                                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md font-medium transition-colors"
                              >
                                Continue to Review
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setActiveSection("zimbabwe")}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                              >
                                Back
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {activeSection !== "delivery" && deliveryZone && zoneConfirmed && (
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                      <div className="text-sm text-gray-700 flex items-center">
                        <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                        <span>
                          {exactDistance !== null
                            ? `${exactDistance.toFixed(1)}km from city center - Delivery Fee: $${exactFee?.toFixed(2)}`
                            : `Zone ${deliveryZone} - Delivery Fee: $${
                                deliveryZone === 1 ? "5" : deliveryZone === 2 ? "8" : deliveryZone === 3 ? "12" : "15"
                              }`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Order Review Section */}
              <div
                id="review"
                className={`bg-white rounded-xl overflow-hidden shadow-sm border ${
                  activeSection === "review" ? "border-teal-300 ring-1 ring-teal-300" : "border-gray-200"
                } transition-all duration-200`}
              >
                <div
                  className={`px-6 py-4 ${
                    activeSection === "review"
                      ? "bg-gradient-to-r from-teal-500 to-teal-600"
                      : "bg-gradient-to-r from-gray-100 to-gray-200"
                  } transition-all duration-200`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveSection("review")}
                    className="w-full text-left flex items-center justify-between"
                    disabled={
                      (showMap && country === "Zimbabwe" && (!deliveryZone || !zoneConfirmed)) ||
                      !zim_name ||
                      !zim_contact ||
                      !zim_contact_id ||
                      !!errors.zim_name ||
                      !!errors.zim_contact ||
                      !!errors.zim_contact_id
                    }
                  >
                    <h3
                      className={`text-lg font-medium flex items-center ${activeSection === "review" ? "text-white" : "text-gray-700"}`}
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-teal-600 mr-3 font-bold">
                        5
                      </span>
                      Review & Submit
                    </h3>
                    <ChevronDown className={`h-5 w-5 ${activeSection === "review" ? "text-white" : "text-gray-500"}`} />
                  </button>
                </div>

                <AnimatePresence>
                  {activeSection === "review" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                              <div className="flex items-center">
                                <User className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="text-gray-700">{fullName}</span>
                              </div>
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="text-gray-700">{email}</span>
                              </div>
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="text-gray-700">{phone}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <p className="text-gray-700">
                                {house_number} {street}, {location}
                                <br />
                                {city}, {country}
                              </p>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Zimbabwe Contact</h4>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                              <div className="flex items-center">
                                <User className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="text-gray-700">{zim_name}</span>
                              </div>
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="text-gray-700">{zim_contact}</span>
                              </div>
                              <div className="flex items-center">
                                <CreditCard className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="text-gray-700 text-sm">ID: {zim_contact_id}</span>
                              </div>
                            </div>
                          </div>

                          {showMap && deliveryZone && zoneConfirmed && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Delivery Zone</h4>
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                                  <span className="text-gray-700">
                                    {exactDistance !== null
                                      ? `${exactDistance.toFixed(1)}km from city center - Delivery Fee: $${exactFee?.toFixed(2)}`
                                      : `Zone ${deliveryZone} - Delivery Fee: $${
                                          deliveryZone === 1
                                            ? "5"
                                            : deliveryZone === 2
                                              ? "8"
                                              : deliveryZone === 3
                                                ? "12"
                                                : "15"
                                        }`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Order Items */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                              <div className="divide-y divide-gray-200">
                                {items.map((item) => (
                                  <div key={`${item.type}-${item.product.id}`} className="flex items-center p-4">
                                    <div className="h-16 w-16 relative flex-shrink-0">
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
                                    <div className="font-medium">
                                      ${(item.product.price * item.quantity).toFixed(2)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Order Instructions */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">
                              Order Instructions <span className="text-sm font-normal text-gray-500">(Optional)</span>
                            </h4>
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
                        </div>

                        <div className="mt-8">
                          <button
                            type="submit"
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-6 rounded-md text-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={
                              isSubmitting || (showMap && country === "Zimbabwe" && (!deliveryZone || !zoneConfirmed))
                            }
                          >
                            {isSubmitting ? (
                              <span className="flex items-center justify-center">
                                <Loader2 className="animate-spin h-5 w-5 mr-3" />
                                Processing...
                              </span>
                            ) : (
                              "Complete Order"
                            )}
                          </button>

                          {!isSubmitting &&
                            !(showMap && country === "Zimbabwe" && (!deliveryZone || !zoneConfirmed)) && (
                              <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
                                <ShieldCheck className="h-4 w-4 mr-1" />
                                <span>You'll be redirected to Stripe's secure payment page</span>
                              </div>
                            )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </div>
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
              {deliveryZone && (
                <div className="mt-6 bg-teal-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-teal-800">Delivery Information</p>
                  <p className="text-xs text-teal-700 mt-1">
                    {exactDistance
                      ? `Your location is ${exactDistance.toFixed(1)}km from our store.`
                      : `You are in delivery zone ${deliveryZone}.`}
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
