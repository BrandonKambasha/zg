"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronDown, ChevronUp, MapPin } from "lucide-react"
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm sticky top-20">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
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
              <div className="h-12 w-12 relative flex-shrink-0">
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
              </div>
              <div className="text-sm font-medium">${(item.product.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
        </div>

        {/* Delivery zone info if available */}
        {(deliveryZone || exactDistance) && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <div className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <MapPin className="h-4 w-4 mr-1.5 text-teal-600" />
              {deliveryZone ? `Delivery Zone ${deliveryZone}` : "Delivery Fee"}
            </div>
            <p className="text-xs text-gray-500">{getZoneDescription()}</p>

            {/* Show fee breakdown for distances beyond 10km */}
            {exactDistance !== null && exactDistance !== undefined && exactDistance > 10 && (
              <p className="text-xs text-gray-500 mt-1">
                Base fee ($5) + ${(shipping - 5).toFixed(2)} for {Math.ceil(exactDistance - 10)}km beyond 10km
              </p>
            )}
          </div>
        )}

        {/* Order totals */}
        <div className="space-y-2 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>
              Shipping
              {deliveryZone ? ` (Zone ${deliveryZone})` : ""}
              {exactDistance !== null && exactDistance !== undefined ? ` (${exactDistance.toFixed(1)}km)` : ""}
            </span>
            <span>${shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-medium text-base pt-2 border-t border-gray-200 mt-2">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

