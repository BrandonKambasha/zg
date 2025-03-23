"use client"

import { useState, useEffect } from "react"
import { Gift, Truck, X, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import type React from "react"

interface PromoMessage {
  id: number
  text: string
  icon: React.ReactNode
  bgColor: string
  textColor: string
  linkText?: string
  linkUrl?: string
}

export default function PromoBanner() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const promoMessages: PromoMessage[] = [
    {
      id: 1,
      text: "Mother's Day 30 Mar! Send special hampers to Mom ❤️",
      icon: <Gift className="h-4 w-4 sm:h-5 sm:w-5" />,
      bgColor: "bg-gradient-to-r from-pink-600 to-pink-500",
      textColor: "text-white",
      linkText: "Shop Hampers",
      linkUrl: "/hampers",
    },
    {
      id: 2,
      text: "Free shipping within Harare for orders over $100 🚚",
      icon: <Truck className="h-4 w-4 sm:h-5 sm:w-5" />,
      bgColor: "bg-gradient-to-r from-teal-600 to-teal-500",
      textColor: "text-white",
      linkText: "Shop Now",
      linkUrl: "/products",
    },
  ]

  // Auto-rotate messages every 5 seconds
  useEffect(() => {
    if (!isVisible || isPaused) return

    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % promoMessages.length)
        setIsTransitioning(false)
      }, 500) // Wait for fade-out transition before changing message
    }, 5000)

    return () => clearInterval(interval)
  }, [isVisible, isPaused, promoMessages.length])

  const closePromoBanner = () => {
    setIsVisible(false)
    // Removed localStorage to make banner reappear on refresh
  }

  // Removed the useEffect that checks localStorage

  const goToPrevMessage = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex === 0 ? promoMessages.length - 1 : prevIndex - 1))
      setIsTransitioning(false)
    }, 500)
  }

  const goToNextMessage = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % promoMessages.length)
      setIsTransitioning(false)
    }, 500)
  }

  if (!isVisible) return null

  const currentMessage = promoMessages[currentMessageIndex]

  return (
    <div
      className={`${currentMessage.bgColor} transition-all duration-300 ease-in-out ${isTransitioning ? "opacity-0" : "opacity-100"}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-4 py-2 sm:py-2.5 flex items-center justify-center relative">
        {/* Navigation arrows - only visible on larger screens */}
        <button
          onClick={goToPrevMessage}
          className="hidden sm:flex absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white transition-colors h-6 w-6 items-center justify-center rounded-full bg-black/10 hover:bg-black/20"
          aria-label="Previous promotion"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center text-center justify-center space-x-2 sm:space-x-3">
          <span className={`${currentMessage.textColor}`}>{currentMessage.icon}</span>
          <p className={`text-xs sm:text-sm font-medium ${currentMessage.textColor}`}>{currentMessage.text}</p>

          {currentMessage.linkText && currentMessage.linkUrl && (
            <Link
              href={currentMessage.linkUrl}
              className={`hidden sm:inline-flex ml-2 text-xs font-medium ${currentMessage.textColor} bg-white/20 hover:bg-white/30 px-2 py-1 rounded-full transition-colors items-center`}
            >
              {currentMessage.linkText}
              <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          )}
        </div>

        <button
          onClick={goToNextMessage}
          className="hidden sm:flex absolute right-12 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white transition-colors h-6 w-6 items-center justify-center rounded-full bg-black/10 hover:bg-black/20"
          aria-label="Next promotion"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <button
          onClick={closePromoBanner}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white transition-colors"
          aria-label="Close promotion banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Indicator dots */}
      <div className="flex justify-center space-x-1 pb-1">
        {promoMessages.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsTransitioning(true)
              setTimeout(() => {
                setCurrentMessageIndex(index)
                setIsTransitioning(false)
              }, 500)
            }}
            className={`h-1.5 rounded-full transition-all ${
              currentMessageIndex === index ? "w-4 bg-white" : "w-1.5 bg-white/50"
            }`}
            aria-label={`Go to promotion ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

