"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronDown, ChevronUp, MapPin, ShieldCheck, Truck, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { apiBaseUrl } from "../lib/axios"

interface OrderSummaryProps {
  items: any[]
  subtotal: number
  deliveryZone?: number | null
  exactDistance?: number | null
  exactFee?: number | null
}

export default function OrderSummary({ items, subtotal, deliveryZone, exactDistance, exactFee }: OrderSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [animateTotal, setAnimateTotal] = useState(false)

  // Function to get full image URL with API prefix
  const getFullImageUrl = (url: string | undefined): string => {
    if (!url) return "/placeholder.svg"
    return url.startsWith("http") ? url : `${apiBaseUrl}${url}`
  }

  // Get shipping cost based on delivery zone or exact fee
  const getShippingCost = () => {
    // If we have an exact fee, use that
    if (exactFee !== null && exactFee !== undefined) {
      return exactFee
    }

    // Otherwise fall back to zone-based pricing
    if (!deliveryZone) return 5 // Default shipping cost

    switch (deliveryZone) {
      case 1:
        return 5
      case 2:
        return 8
      case 3:
        return 12
      case 4:
        return 15
      default:
        return 5
    }
  }

  // Calculate shipping and total based on zone or exact fee
  const shipping = getShippingCost()
  const total = subtotal + shipping

  // Get zone description based on distance
  const getZoneDescription = () => {
    if (exactDistance !== null && exactDistance !== undefined) {
      if (exactDistance <= 10) {
        return `Within 10km of Harare CBD (${exactDistance.toFixed(1)}km)`
      } else {
        return `${exactDistance.toFixed(1)}km from Harare CBD`
      }
    } else if (deliveryZone) {
      return deliveryZone === 1
        ? "Within 10km of Harare CBD"
        : deliveryZone === 2
          ? "10-20km from Harare CBD"
          : deliveryZone === 3
            ? "20-30km from Harare CBD"
            : "30-40km from Harare CBD"
    }
    return "Standard delivery"
  }

  // Get delivery time estimate based on zone
  const getDeliveryEstimate = () => {
    if (!deliveryZone) return "1-3 business days"

    return deliveryZone <= 2 ? "1-2 business days" : "2-3 business days"
  }

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Animate total when mounted
  useEffect(() => {
    if (mounted) {
      setTimeout(() => {
        setAnimateTotal(true)
      }, 500)
    }
  }, [mounted])

  if (!mounted) return null

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white">
        <h2 className="text-lg font-medium">Order Summary</h2>
      </div>
      <div className="p-6">
        {/* Mobile toggle for order items */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-teal-600"
          >
            <span>
              {items.length} {items.length === 1 ? "item" : "items"} in cart
            </span>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {/* Order items - always visible on desktop, toggleable on mobile */}
        <div className={`space-y-4 mb-6 ${isExpanded ? "block" : "hidden lg:block"}`}>
          {items.map((item) => (
            <div key={`${item.type}-${item.product.id}`} className="flex items-center">
              <div className="h-16 w-16 relative flex-shrink-0">
                <Image
                  src={getFullImageUrl(item.product.image_url) || "/placeholder.svg"}
                  alt={item.product.name}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div className="ml-3 flex-grow">
                <p className="text-sm font-medium line-clamp-1">
                  {item.product.name}
                  {item.type === "hamper" && <span className="text-xs text-teal-600 ml-1">(Hamper)</span>}
                </p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                <p className="text-xs font-medium text-teal-600 mt-1">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery Information Card */}
        <div className="mb-5 p-4 bg-teal-50 rounded-lg border border-teal-100">
          <div className="flex items-start">
            <div className="mt-0.5">
              <Truck className="h-5 w-5 text-teal-600" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-teal-800">Delivery Information</h4>

              <div className="mt-2 space-y-2">
                <div className="flex items-center text-xs text-teal-700">
                  <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                  <span>{getZoneDescription()}</span>
                </div>

                <div className="flex items-center text-xs text-teal-700">
                  <Clock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                  <span>Estimated delivery: {getDeliveryEstimate()}</span>
                </div>

                {exactDistance !== null && exactDistance !== undefined && exactDistance > 10 && (
                  <div className="flex items-center text-xs text-teal-700">
                    <AlertCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                    <span>
                      Distance surcharge: ${(shipping - 5).toFixed(2)} for {Math.ceil(exactDistance - 10)}km beyond 10km
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order totals */}
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Shipping
              {deliveryZone ? ` (Zone ${deliveryZone})` : ""}
              {exactDistance !== null && exactDistance !== undefined ? ` (${exactDistance.toFixed(1)}km)` : ""}
            </span>
            <span>${shipping.toFixed(2)}</span>
          </div>

          <div
            className={`flex justify-between font-medium text-base pt-3 border-t border-gray-200 mt-3 ${animateTotal ? "animate-pulse" : ""}`}
          >
            <span>Total</span>
            <span className="text-lg text-teal-700">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Secure Checkout Badge */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center bg-gray-50 py-3 px-4 rounded-lg">
            <ShieldCheck className="h-5 w-5 text-teal-600 mr-2" />
            <span className="text-xs text-gray-700">Secure Checkout</span>
          </div>
        </div>

        {/* Order Benefits */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center">
            <CheckCircle2 className="h-4 w-4 text-teal-600 mr-2 flex-shrink-0" />
            <span className="text-xs text-gray-700">Free shipping on orders over $100</span>
          </div>
          <div className="flex items-center">
            <CheckCircle2 className="h-4 w-4 text-teal-600 mr-2 flex-shrink-0" />
            <span className="text-xs text-gray-700">Secure payment processing</span>
          </div>
        </div>
      </div>
    </div>
  )
}

