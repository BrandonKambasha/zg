"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import ProductGrid from "./components/ProductGrid"
import HamperGrid from "./components/HamperGrid"
import { getCategories } from "./lib/api/categories"
import { getProducts } from "./lib/api/products"
import { getHampers } from "./lib/api/hampers"
import type { Category, Product, Hamper } from "./Types"
import {
  ArrowRight,
  Truck,
  ChevronRight,
  Package,
  Clock,
  Gift,
  ShieldCheck,
  Users,
  Award,
  ShoppingCart,
  CreditCard,
  MapPin,
  Globe,
  MessageSquare,
  Check,
} from "lucide-react"
import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { apiBaseUrl } from "./lib/axios"
import { subscribeToNewsletter } from "./lib/api/Newsletter"
import { Loader2 } from "lucide-react"

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [randomProducts, setRandomProducts] = useState<Product[]>([])
  const [hampers, setHampers] = useState<Hamper[]>([])
  const [randomHampers, setRandomHampers] = useState<Hamper[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hampersLoading, setHampersLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [subscriptionStatus, setSubscriptionStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const recaptchaRef = useRef<any>(null)

  // Ref for the logo scroll container
  const logoScrollRef = useRef<HTMLDivElement>(null)
  const logoScrollContentRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  // Refs for scroll animations
  const heroRef = useRef(null)
  const categoriesRef = useRef(null)
  const productsRef = useRef(null)
  const hampersRef = useRef(null) // New ref for hampers section
  const promoRef = useRef(null)
  const howItWorksRef = useRef(null)
  const whyShopRef = useRef(null)
  const newsletterRef = useRef(null)
  const feedbackRef = useRef(null) // New ref for feedback section
  const logoBannerRef = useRef(null)

  // Check if sections are in view
  const heroInView = useInView(heroRef, { once: true })
  const categoriesInView = useInView(categoriesRef, { once: true, amount: 0.2 })
  const productsInView = useInView(productsRef, { once: true, amount: 0.1 })
  const hampersInView = useInView(hampersRef, { once: true, amount: 0.1 }) // New inView for hampers
  const promoInView = useInView(promoRef, { once: true, amount: 0.2 })
  const howItWorksInView = useInView(howItWorksRef, { once: true, amount: 0.1 })
  const whyShopInView = useInView(whyShopRef, { once: true, amount: 0.1 })
  const newsletterInView = useInView(newsletterRef, { once: true, amount: 0.3 })
  const feedbackInView = useInView(feedbackRef, { once: true, amount: 0.3 }) // New inView for feedback
  const logoBannerInView = useInView(logoBannerRef, { once: true, amount: 0.2 })

  // Function to get random items
  const getRandomItems = <T,>(items: T[], count: number): T[] => {
    // Make a copy of the array to avoid modifying the original
    const itemsCopy = [...items]

    // Shuffle the array using Fisher-Yates algorithm
    for (let i = itemsCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[itemsCopy[i], itemsCopy[j]] = [itemsCopy[j], itemsCopy[i]]
    }

    // Return the first 'count' items
    return itemsCopy.slice(0, count)
  }

  useEffect(() => {
    let isMounted = true

    async function fetchData() {
      setIsLoading(true)
      setHampersLoading(true)
      try {
        // Fetch products
        try {
          const productsData = await getProducts()
          if (isMounted) {
            setProducts(productsData || [])

            // Set random products when products data is loaded
            if (productsData && productsData.length > 0) {
              const randomProductsSelection = getRandomItems(productsData, 4)
              setRandomProducts(randomProductsSelection)
            }
          }
        } catch (productError) {
          console.error("Error fetching products:", productError)
        } finally {
          if (isMounted) {
            setIsLoading(false)
          }
        }

        // Fetch hampers
        try {
          const hampersData = await getHampers()
          if (isMounted) {
            setHampers(hampersData || [])

            // Set random hampers when hampers data is loaded
            if (hampersData && hampersData.length > 0) {
              const randomHampersSelection = getRandomItems(hampersData, 4)
              setRandomHampers(randomHampersSelection)
            }
          }
        } catch (hamperError) {
          console.error("Error fetching hampers:", hamperError)
        } finally {
          if (isMounted) {
            setHampersLoading(false)
          }
        }

        // Fetch categories
        try {
          setCategoriesLoading(true)
          const categoriesData = await getCategories()
          if (isMounted) {
            setCategories(categoriesData || [])
          }
        } catch (categoryError) {
          console.error("Error fetching categories:", categoryError)
        } finally {
          if (isMounted) {
            setCategoriesLoading(false)
          }
        }
      } catch (error) {
        console.error("Error in fetchData:", error)
      }
    }

    fetchData()

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false
    }
  }, [])

  // Mouse and touch event handlers for logo scrolling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!logoScrollRef.current) return

    setIsDragging(true)
    setStartX(e.pageX - logoScrollRef.current.offsetLeft)
    setScrollLeft(logoScrollRef.current.scrollLeft)

    // Pause the animation while dragging
    if (logoScrollContentRef.current) {
      logoScrollContentRef.current.style.animationPlayState = "paused"
      // Store the current transform to prevent jumps
      const computedStyle = window.getComputedStyle(logoScrollContentRef.current)
      const transform = computedStyle.getPropertyValue("transform")
      logoScrollContentRef.current.style.transform = transform
      logoScrollContentRef.current.style.animation = "none"
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !logoScrollRef.current) return

    e.preventDefault()
    const x = e.pageX - logoScrollRef.current.offsetLeft
    const walk = (x - startX) * 2 // Scroll speed multiplier
    logoScrollRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)

    // Resume the animation after dragging
    if (logoScrollContentRef.current) {
      logoScrollContentRef.current.style.removeProperty("transform")
      logoScrollContentRef.current.style.removeProperty("animation")
      logoScrollContentRef.current.classList.remove("logo-scroll")
      // Force a reflow to restart the animation
      void logoScrollContentRef.current.offsetWidth
      logoScrollContentRef.current.classList.add("logo-scroll")
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!logoScrollRef.current) return

    setIsDragging(true)
    setStartX(e.touches[0].pageX - logoScrollRef.current.offsetLeft)
    setScrollLeft(logoScrollRef.current.scrollLeft)

    // Pause the animation while dragging
    if (logoScrollContentRef.current) {
      logoScrollContentRef.current.style.animationPlayState = "paused"
      // Store the current transform to prevent jumps
      const computedStyle = window.getComputedStyle(logoScrollContentRef.current)
      const transform = computedStyle.getPropertyValue("transform")
      logoScrollContentRef.current.style.transform = transform
      logoScrollContentRef.current.style.animation = "none"
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !logoScrollRef.current) return

    const x = e.touches[0].pageX - logoScrollRef.current.offsetLeft
    const walk = (x - startX) * 2 // Scroll speed multiplier
    logoScrollRef.current.scrollLeft = scrollLeft - walk
  }

  const handleTouchEnd = () => {
    setIsDragging(false)

    // Resume the animation after dragging
    if (logoScrollContentRef.current) {
      logoScrollContentRef.current.style.removeProperty("transform")
      logoScrollContentRef.current.style.removeProperty("animation")
      logoScrollContentRef.current.classList.remove("logo-scroll")
      // Force a reflow to restart the animation
      void logoScrollContentRef.current.offsetWidth
      logoScrollContentRef.current.classList.add("logo-scroll")
    }
  }

  // Function to get full image URL with API prefix
  const getFullImageUrl = (url: string | undefined): string => {
    if (!url) {
      return "/placeholder.svg"
    }

    // Use a stable cache-busting parameter
    const cacheBuster = `?v=1`

    if (url.startsWith("http")) {
      return url + cacheBuster
    } else {
      return `${apiBaseUrl}${url}${cacheBuster}`
    }
  }

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  const fadeInLeft = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  }

  const fadeInRight = {
    hidden: { opacity: 0, x: 10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  }

  // Promo card animation variants
  const slideInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.6,
      },
    },
  }

  const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.6,
        delay: 0.1,
      },
    },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  }

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setSubscriptionStatus("error")
      setErrorMessage("Please enter your email address")
      return
    }

    try {
      setSubscriptionStatus("loading")

      // Get reCAPTCHA token
      if (!window.grecaptcha) {
        throw new Error("reCAPTCHA not loaded. Please refresh the page and try again.")
      }

      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
      if (!siteKey) {
        throw new Error("reCAPTCHA site key is missing. Please check your environment variables.")
      }

      const token = await window.grecaptcha.execute(siteKey, { action: "newsletter_subscribe" })

      if (!token) {
        throw new Error("Failed to get reCAPTCHA token")
      }

      // Submit to API
      await subscribeToNewsletter({
        email,
        recaptchaToken: token,
      })

      // Success
      setSubscriptionStatus("success")
      setEmail("")
    } catch (error: any) {
      setSubscriptionStatus("error")
      setErrorMessage(error.message || "Failed to subscribe. Please try again.")
    }
  }

  return (
    <div className="space-y-8 sm:space-y-12 md:space-y-16 lg:space-y-24 pb-8 sm:pb-0">
      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden">
        <div className="hero-pattern rounded-xl sm:rounded-3xl overflow-hidden">
          <div className="container mx-auto px-4 py-8 sm:py-12 md:py-20 lg:py-28 relative z-10">
            <div className="max-w-2xl">
              <motion.h1
                className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 text-white leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-amber-400">Shop for Family in Zimbabwe</span> – We Deliver, You Care!
              </motion.h1>
              <motion.p
                className="text-sm sm:text-base md:text-xl mb-4 sm:mb-6 md:mb-8 text-teal-50 max-w-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                A simple way to provide for your family in Zimbabwe – shop now, and we'll handle the delivery!
              </motion.p>
              <motion.div
                className="flex flex-wrap gap-2 sm:gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Link
                  href="/products"
                  className="btn-3d inline-flex items-center text-sm sm:text-base py-2 px-4 sm:py-2.5 sm:px-5"
                >
                  Shop Now
                  <ArrowRight className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Link>
                <Link href="/about-us" className="btn-secondary text-sm sm:text-base py-2 px-4 sm:py-2.5 sm:px-5">
                  Our Story
                </Link>
              </motion.div>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 w-1/2 h-full hidden lg:block">
            <div className="relative h-full w-full">
              <Image
                src={"/images/zim3.jpg"}
                alt="Zimbabwean groceries"
                fill
                className="object-cover opacity-20 animate-float"
              />
            </div>
          </div>

          <div className="absolute -bottom-10 -left-10 w-32 sm:w-64 h-32 sm:h-64 bg-amber-500 rounded-full opacity-20 blur-3xl animate-pulse-slow"></div>
          <div className="absolute -top-10 -right-10 w-32 sm:w-64 h-32 sm:h-64 bg-teal-300 rounded-full opacity-20 blur-3xl animate-pulse-slow"></div>
        </div>

        {/* Features Cards - Hidden on mobile, visible on desktop */}
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="hidden md:grid grid-cols-4 gap-4 -mt-10">
            {[
              {
                icon: <Truck className="h-6 w-6 text-teal-600" />,
                title: "Free Delivery",
                desc: "On orders over $100",
              },
              {
                icon: <Package className="h-6 w-6 text-teal-600" />,
                title: "Secure Packaging",
                desc: "Safe & sealed",
              },
              {
                icon: <Clock className="h-6 w-6 text-teal-600" />,
                title: "Fast Delivery",
                desc: "3-5 business days",
              },
              {
                icon: <Gift className="h-6 w-6 text-teal-600" />,
                title: "Gift Options",
                desc: "Special packaging",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl shadow-lg p-4 flex items-center gap-3 hover-lift"
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              >
                <div className="bg-teal-100 p-3 rounded-full flex-shrink-0">{feature.icon}</div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-gray-800 truncate">{feature.title}</h3>
                  <p className="text-xs text-gray-500">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section - Compact Version - MOVED UP */}
      <section ref={howItWorksRef} className="container mx-auto px-4 mb-8 sm:mb-12">
        <motion.div
          className="text-center mb-4 sm:mb-6"
          variants={fadeIn}
          initial="hidden"
          animate={howItWorksInView ? "visible" : "hidden"}
        >
          <h2 className="section-title text-xl sm:text-2xl inline-block">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mt-2 text-sm hidden sm:block">
            Quick & easy delivery in Zimbabwe to those in Zimbabwe in just a few simple steps
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto mt-1 text-xs md:hidden">
            Quick & easy delivery in Zimbabwe to those in Zimbabwe
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-4 gap-2 md:gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate={howItWorksInView ? "visible" : "hidden"}
        >
          {[
            {
              icon: <ShoppingCart className="h-5 w-5 text-teal-600" />,
              title: "Shop",
              desc: "Browse & select authentic Zimbabwean groceries",
              color: "bg-teal-50",
              iconBg: "bg-teal-100",
            },
            {
              icon: <CreditCard className="h-5 w-5 text-amber-600" />,
              title: "Pay",
              desc: "Secure checkout with multiple payment options",
              color: "bg-amber-50",
              iconBg: "bg-amber-100",
            },
            {
              icon: <MapPin className="h-5 w-5 text-teal-600" />,
              title: "Address",
              desc: "Provide recipient details in Zimbabwe",
              color: "bg-teal-50",
              iconBg: "bg-teal-100",
            },
            {
              icon: <Truck className="h-5 w-5 text-amber-600" />,
              title: "Deliver",
              desc: "We deliver directly to your loved ones",
              color: "bg-amber-50",
              iconBg: "bg-amber-100",
            },
          ].map((step, index) => (
            <motion.div
              key={index}
              className={`${step.color} rounded-lg p-2 sm:p-4 text-center hover-lift`}
              variants={fadeIn}
            >
              <div
                className={`${step.iconBg} h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-3`}
              >
                {step.icon}
              </div>
              <h3 className="font-bold text-gray-800 text-xs sm:text-base mb-0 sm:mb-1">{step.title}</h3>
              <p className="text-gray-600 text-[10px] sm:text-sm hidden sm:block">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="text-center mt-2 sm:mt-4"
          variants={fadeIn}
          initial="hidden"
          animate={howItWorksInView ? "visible" : "hidden"}
          transition={{ delay: 0.3 }}
        >
          <Link
            href="/how-it-works"
            className="inline-flex items-center text-teal-600 hover:text-teal-700 font-medium text-xs sm:text-sm"
          >
            See how we deliver
            <ArrowRight className="ml-1 sm:ml-1.5 h-3 w-3 sm:h-4 sm:w-4" />
          </Link>
        </motion.div>
      </section>

      {/* NEW: Gift Collections Section (Featured Hampers) */}
      <section ref={hampersRef} className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-4 sm:mb-6 md:mb-8">
          <motion.h2
            className="section-title text-xl sm:text-2xl"
            variants={fadeInLeft}
            initial="hidden"
            animate={hampersInView ? "visible" : "hidden"}
          >
            Featured Hampers
          </motion.h2>
          <motion.div variants={fadeInRight} initial="hidden" animate={hampersInView ? "visible" : "hidden"}>
            <Link
              href="/hampers"
              className="text-teal-600 hover:text-teal-700 font-medium flex items-center group text-sm"
            >
              View All
              <ArrowRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        <motion.div variants={fadeIn} initial="hidden" animate={hampersInView ? "visible" : "hidden"}>
          {hampersLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg sm:rounded-xl aspect-square mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : randomHampers.length > 0 ? (
            <HamperGrid hampers={randomHampers} />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No gift collections found. Please try refreshing the page.</p>
            </div>
          )}
        </motion.div>
      </section>

      {/* Featured Products Section - Modified to show random products */}
      <section ref={productsRef} className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-4 sm:mb-6 md:mb-8">
          <motion.h2
            className="section-title text-xl sm:text-2xl"
            variants={fadeInLeft}
            initial="hidden"
            animate={productsInView ? "visible" : "hidden"}
          >
            Featured Products
          </motion.h2>
          <motion.div variants={fadeInRight} initial="hidden" animate={productsInView ? "visible" : "hidden"}>
            <Link
              href="/products"
              className="text-teal-600 hover:text-teal-700 font-medium flex items-center group text-sm"
            >
              View All
              <ArrowRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        <motion.div variants={fadeIn} initial="hidden" animate={productsInView ? "visible" : "hidden"}>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg sm:rounded-xl aspect-square mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            // Use randomProducts instead of products.slice(0, 4)
            <ProductGrid products={randomProducts} />
          )}
        </motion.div>
      </section>

      {/* NEW: Feedback Section */}
      <section ref={feedbackRef} className="container mx-auto px-4 py-6">
        <motion.div
          className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-6 sm:p-8 border border-amber-200"
          variants={fadeIn}
          initial="hidden"
          animate={feedbackInView ? "visible" : "hidden"}
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="md:w-2/3">
              <h2 className="text-xl sm:text-2xl font-bold text-amber-800 mb-3">Can't Find What You're Looking For?</h2>
              <p className="text-amber-700 mb-4">
                We're constantly expanding our product range to better serve the Zimbabwean community. If you can't find
                a specific product, let us know and we'll work towards adding it to our store.
              </p>
              <ul className="text-amber-700 mb-4 space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Request specific Zimbabwean products</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Suggest improvements to our service</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Share your experience with us</span>
                </li>
              </ul>
            </div>
            <div className="md:w-1/3 flex justify-center">
              <Link
                href="/feedback"
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <MessageSquare className="h-5 w-5" />
                Share Your Feedback
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Promo Section - Improved for mobile - MOVED DOWN */}
      <section ref={promoRef} className="container mx-auto px-4 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <motion.div
            className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl sm:rounded-2xl overflow-hidden relative shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            variants={slideInLeft}
            initial="hidden"
            animate={promoInView ? "visible" : "hidden"}
          >
            <div className="p-4 sm:p-6 md:p-8 lg:p-10 relative z-10">
              <span className="badge badge-primary mb-2 sm:mb-3 text-xs inline-block bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full">
                Monthly Hampers
              </span>
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3">
                Personalized Gift Hampers
              </h3>
              <p className="text-amber-50 mb-3 sm:mb-5 text-xs sm:text-sm md:text-base max-h-16 sm:max-h-none overflow-hidden">
                Create custom hampers or set up monthly deliveries to regularly surprise your loved ones in Zimbabwe.
              </p>
              <Link
                href="/hampers"
                className="bg-white text-amber-600 px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 rounded-md font-medium hover:bg-amber-50 transition-colors inline-flex items-center text-xs sm:text-sm md:text-base group"
              >
                Explore Hampers
                <ArrowRight className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 sm:w-40 sm:h-40 bg-amber-300 rounded-full opacity-50"></div>
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-amber-600 rounded-full opacity-30"></div>

            {/* Gift icon */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 bg-white/10 backdrop-blur-sm p-2 sm:p-3 rounded-full">
              <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl sm:rounded-2xl overflow-hidden relative shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            variants={slideInRight}
            initial="hidden"
            animate={promoInView ? "visible" : "hidden"}
          >
            <div className="p-4 sm:p-6 md:p-8 lg:p-10 relative z-10">
              <span className="badge badge-accent mb-2 sm:mb-3 text-xs inline-block bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full">
                Diaspora Shopping
              </span>
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3">
                Shop For Those Back Home
              </h3>
              <p className="text-teal-50 mb-3 sm:mb-5 text-xs sm:text-sm md:text-base max-h-16 sm:max-h-none overflow-hidden">
                Browse our variety of products and shop stress-free for your family in Zimbabwe. We handle the delivery!
              </p>
              <Link
                href="/products"
                className="bg-white text-teal-600 px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 rounded-md font-medium hover:bg-teal-50 transition-colors inline-flex items-center text-xs sm:text-sm md:text-base group"
              >
                Explore Products
                <ArrowRight className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 sm:w-40 sm:h-40 bg-teal-400 rounded-full opacity-50"></div>
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-teal-700 rounded-full opacity-30"></div>

            {/* Globe icon */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 bg-white/10 backdrop-blur-sm p-2 sm:p-3 rounded-full">
              <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section - Improved for mobile */}
      <section ref={categoriesRef} className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-4 sm:mb-6 md:mb-8">
          <motion.h2
            className="section-title text-xl sm:text-2xl"
            variants={fadeInLeft}
            initial="hidden"
            animate={categoriesInView ? "visible" : "hidden"}
          >
            Popular Categories
          </motion.h2>
          <motion.div variants={fadeInRight} initial="hidden" animate={categoriesInView ? "visible" : "hidden"}>
            <Link
              href="/categories"
              className="text-teal-600 hover:text-teal-700 font-medium flex items-center group text-sm"
            >
              View All
              <ArrowRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {categoriesLoading ? (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate={categoriesInView ? "visible" : "hidden"}
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <motion.div key={index} variants={fadeIn} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg sm:rounded-xl overflow-hidden relative h-40 sm:h-48"></div>
              </motion.div>
            ))}
          </motion.div>
        ) : categories.length > 0 ? (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate={categoriesInView ? "visible" : "hidden"}
          >
            {categories.slice(0, 4).map((category, index) => (
              <motion.div key={category.id} variants={fadeIn} className="relative">
                <Link href={`/categories/${category.id}`} className="group block">
                  <div className="bg-gray-50 rounded-lg sm:rounded-xl overflow-hidden relative h-36 sm:h-40 md:h-48 hover-glow">
                    <div className="absolute inset-0 bg-gradient-to-t from-teal-900/80 to-transparent z-10"></div>
                    {category.image_url ? (
                      <Image
                        src={getFullImageUrl(category.image_url) || "/placeholder.svg"}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        priority={index === 0}
                        loading={index === 0 ? "eager" : "lazy"}
                        onError={(e) => {
                          // Instead of setting src to placeholder, render a fallback div with the category name
                          e.currentTarget.style.display = "none"
                          const parent = e.currentTarget.parentElement
                          if (parent) {
                            parent.classList.add("bg-gradient-to-br", "from-teal-600", "to-teal-800")
                          }
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center">
                        <span className="text-white font-medium text-lg">{category.name}</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 p-3 sm:p-4 z-20 w-full">
                      <h3 className="font-bold text-white text-sm sm:text-base md:text-lg">{category.name}</h3>
                      <div className="flex items-center text-teal-100 text-xs mt-1 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                        <span>Shop Now</span>
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No categories found. Please try refreshing the page.</p>
          </div>
        )}
      </section>

      {/* Why Shop With Us Section */}
      <section ref={whyShopRef} className="bg-pattern py-8 sm:py-12 md:py-20">
        <div className="container mx-auto px-4">
          <motion.h2
            className="section-title text-center mx-auto mb-8 sm:mb-12 text-xl sm:text-2xl"
            variants={fadeIn}
            initial="hidden"
            animate={whyShopInView ? "visible" : "hidden"}
          >
            Why Shop With Us
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
            {[
              {
                icon: <ShieldCheck className="h-8 w-8 sm:h-10 sm:w-10 text-teal-600" />,
                title: "Authentic Products",
                description: "We source directly from Zimbabwe to ensure authenticity and quality in every product.",
                color: "bg-teal-50",
                iconBg: "bg-teal-100",
              },
              {
                icon: <Users className="h-8 w-8 sm:h-10 sm:w-10 text-teal-600" />,
                title: "Supporting Communities",
                description: "Every purchase supports local Zimbabwean farmers and small-scale producers.",
                color: "bg-teal-50",
                iconBg: "bg-teal-100",
              },
              {
                icon: <Award className="h-8 w-8 sm:h-10 sm:w-10 text-amber-600" />,
                title: "Customer Satisfaction",
                description: "Our 5-star rated service ensures you'll be delighted with every order.",
                color: "bg-amber-50",
                iconBg: "bg-amber-100",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className={`${feature.color} p-6 sm:p-8 rounded-xl shadow-md hover-lift`}
                variants={fadeIn}
                initial="hidden"
                animate={whyShopInView ? "visible" : "hidden"}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className={`${feature.iconBg} p-3 sm:p-4 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-4 sm:mb-6`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm sm:text-base">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Stats Section */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-2 gap-4 sm:gap-6"
            variants={fadeIn}
            initial="hidden"
            animate={whyShopInView ? "visible" : "hidden"}
            transition={{ delay: 0.4 }}
          >
            {[
              { value: "50+", label: "Authentic Products" },
              { value: "24/7", label: "Customer Support" },
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-4 sm:p-6 text-center hover-lift">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-teal-600 mb-1 sm:mb-2">
                  {stat.value}
                </div>
                <div className="text-sm sm:text-base text-gray-600">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section - Improved for mobile */}
      <section ref={newsletterRef} className="container mx-auto px-4 mb-8 sm:mb-16">
        <motion.div
          className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 relative overflow-hidden"
          variants={fadeIn}
          initial="hidden"
          animate={newsletterInView ? "visible" : "hidden"}
        >
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white">Stay Updated</h2>
            <p className="text-teal-100 mb-6 sm:mb-8 text-sm sm:text-base">
              Subscribe to our newsletter for exclusive offers, new product announcements, and authentic Zimbabwean
              recipes.
            </p>
            {subscriptionStatus === "success" ? (
              <div className="bg-teal-100 border border-teal-400 text-teal-700 px-4 py-3 rounded-md mb-4 animate-fade-in">
                <p className="font-medium">Thank you for subscribing!</p>
                <p className="text-sm">You'll receive our latest updates and exclusive offers.</p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="relative">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="fancy-input text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 rounded-md w-full text-white"
                    disabled={subscriptionStatus === "loading"}
                  />
                  <button
                    type="submit"
                    className="btn-accent whitespace-nowrap text-sm sm:text-base py-2.5 sm:py-3 px-4 sm:px-6 rounded-md flex items-center justify-center"
                    disabled={subscriptionStatus === "loading"}
                  >
                    {subscriptionStatus === "loading" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Subscribing...
                      </>
                    ) : (
                      "Subscribe"
                    )}
                  </button>
                </div>

                {subscriptionStatus === "error" && (
                  <div className="text-red-200 text-sm mt-2 text-center">{errorMessage}</div>
                )}
              </form>
            )}
            <p className="text-xs text-teal-200 mt-2 text-center">
              We respect your privacy and will never share your information.
            </p>
          </div>

          <div className="absolute -top-10 sm:-top-20 -right-10 sm:-right-20 w-32 sm:w-64 h-32 sm:h-64 bg-teal-400 rounded-full opacity-20"></div>
          <div className="absolute -bottom-10 sm:-bottom-20 -left-10 sm:-left-20 w-32 sm:w-64 h-32 sm:h-64 bg-teal-400 rounded-full opacity-20"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-teal-500 rounded-full opacity-10 animate-pulse-slow"></div>
        </motion.div>
      </section>
    </div>
  )
}
