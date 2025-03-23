"use client"

import { useState, useEffect } from "react"
import { Gift, Truck, X } from "lucide-react"
import type React from "react"

interface PromoMessage {
  id: number
  text: string
  icon: React.ReactNode
  bgColor: string
  textColor: string
}

export default function PromoBanner() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const promoMessages: PromoMessage[] = [
    {
      id: 1,
      text: "Mother's Day 30 Mar! Send special hampers to Mom ❤️",
      icon: <Gift className="h-4 w-4 sm:h-5 sm:w-5" />,
      bgColor: "bg-pink-600",
      textColor: "text-white",
    },
    {
      id: 2,
      text: "Free shipping within Harare for orders over $100 🚚",
      icon: <Truck className="h-4 w-4 sm:h-5 sm:w-5" />,
      bgColor: "bg-teal-600",
      textColor: "text-white",
    },
  ]

  // Auto-rotate messages every 5 seconds
  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % promoMessages.length)
        setIsTransitioning(false)
      }, 500) // Wait for fade-out transition before changing message
    }, 5000)

    return () => clearInterval(interval)
  }, [isVisible, promoMessages.length])

  const closePromoBanner = () => {
    setIsVisible(false)
    // Optionally save to localStorage to keep it closed for some time
    localStorage.setItem("promoBannerClosed", Date.now().toString())
  }

  // Check if banner was recently closed
  useEffect(() => {
    const closedTimestamp = localStorage.getItem("promoBannerClosed")
    if (closedTimestamp) {
      const hoursSinceClosed = (Date.now() - Number.parseInt(closedTimestamp)) / (1000 * 60 * 60)
      if (hoursSinceClosed < 24) {
        setIsVisible(false)
      } else {
        localStorage.removeItem("promoBannerClosed")
      }
    }
  }, [])

  if (!isVisible) return null

  const currentMessage = promoMessages[currentMessageIndex]

  return (
    <div
      className={`${currentMessage.bgColor} transition-all duration-300 ease-in-out ${isTransitioning ? "opacity-0" : "opacity-100"}`}
    >
      <div className="container mx-auto px-2 py-2 sm:py-2.5 flex items-center justify-center relative">
        <div className="flex items-center text-center justify-center space-x-2 sm:space-x-3">
          <span className={`${currentMessage.textColor}`}>{currentMessage.icon}</span>
          <p className={`text-xs sm:text-sm font-medium ${currentMessage.textColor}`}>{currentMessage.text}</p>
        </div>
        <button
          onClick={closePromoBanner}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white transition-colors"
          aria-label="Close promotion banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

