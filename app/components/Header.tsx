"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  User,
  Search,
  Menu,
  X,
  ChevronDown,
  Loader2,
  ShoppingBag,
  Heart,
  Home,
  Package,
  Info,
  Phone,
  ShoppingCart,
  MessageSquare,
} from "lucide-react"
import Image from "next/image"
import { getCategories } from "../lib/api/categories"
import type { Category } from "../Types"
import CartIcon from "./CartIcon"
import WishlistIcon from "./WishlistIcon"
import { useRouter, usePathname } from "next/navigation"
import { searchItems, type SearchResult } from "../lib/api/search"
import { useDebounce } from "../hooks/useDebounce"
import { useAuth } from "../hooks/useAuth"
import toast from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"
import useCart from "../hooks/useCart"

// Group navigation links by section
const navigationGroups = [
  {
    title: "Shop",
    icon: <Package className="h-5 w-5" />,
    links: [
      { href: "/products", label: "All Products" },
      { href: "/categories", label: "Categories" },
      { href: "/hampers", label: "Hampers" },
    ],
  },
  {
    title: "About",
    icon: <Info className="h-5 w-5" />,
    links: [
      { href: "/about-us", label: "About Us" },
      { href: "/how-it-works", label: "How it Works" },
    ],
  },
  {
    title: "Help",
    icon: <Phone className="h-5 w-5" />,
    links: [
      { href: "/contact", label: "Contact Us" },
      { href: "/shipping", label: "Shipping Info" },
      { href: "/returns", label: "Returns & Refunds" },
    ],
  },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [activeGroup, setActiveGroup] = useState<string | null>(null)
  const [activeMobileTab, setActiveMobileTab] = useState("shop")
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const { logout, isAuthenticated } = useAuth()
  const drawerRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const { items } = useCart()

  // Add the handleLogout function
  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Logged out successfully")
      setIsMenuOpen(false)
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
      toast.error("Failed to logout")
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      // Check if we've scrolled past the promo banner height
      const promoBannerHeight = document.querySelector(".promo-banner")?.clientHeight || 0

      if (window.scrollY > promoBannerHeight) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    async function fetchCategories() {
      setIsLoading(true)
      try {
        const data = await getCategories()
        if (isMounted) {
          setCategories(data || [])
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    let isMounted = true
    fetchCategories()

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (debouncedSearchQuery.trim().length < 2) {
        setSearchResults([])
        setIsSearching(false)
        return
      }

      setIsSearching(true)
      try {
        const results = await searchItems(debouncedSearchQuery)
        setSearchResults(results)
        setShowSearchResults(true)
      } catch (error) {
        console.error("Error fetching search results:", error)
      } finally {
        setIsSearching(false)
      }
    }

    fetchSearchResults()
  }, [debouncedSearchQuery])

  // Add touch event handling for mobile
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // If we're touching a menu item, prevent default behavior
      const target = e.target as Element
      if (
        target.closest(".mobile-menu-button") ||
        target.closest(".mobile-search-button") ||
        target.closest(".mobile-tab-button") ||
        target.closest(".menu-item") ||
        target.closest(".menu-link")
      ) {
        e.stopPropagation()
      }
    }

    document.addEventListener("touchstart", handleTouchStart, { passive: true })
    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
    }
  }, [])

  // Handle body scroll locking for mobile menu
  useEffect(() => {
    // Save the original body style
    const originalStyle = window.getComputedStyle(document.body).overflow

    // Function to disable scrolling
    const disableScroll = () => {
      document.body.style.overflow = "hidden"
    }

    // Function to enable scrolling
    const enableScroll = () => {
      document.body.style.overflow = originalStyle
    }

    if (showMobileMenu) {
      disableScroll()
    } else {
      enableScroll()
    }

    // Cleanup function
    return () => {
      enableScroll()
    }
  }, [showMobileMenu])

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    if (e.target.value.trim().length >= 2) {
      setIsSearching(true)
    } else {
      setShowSearchResults(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setShowSearchResults(false)
      setSearchQuery("")
    }
  }

  const handleSearchResultClick = (result: SearchResult) => {
    setShowSearchResults(false)
    setSearchQuery("")

    if (result.type === "product") {
      router.push(`/products/${result.id}`)
    } else if (result.type === "category") {
      router.push(`/products?category=${result.id}`)
    } else if (result.type === "hamper") {
      router.push(`/hampers/${result.id}`)
    }
  }

  // Toggle dropdown visibility for touch devices
  const toggleDropdown = (groupTitle: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setActiveGroup(activeGroup === groupTitle ? null : groupTitle)
  }

  // Handle opening mobile menu
  const openMobileMenu = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowMobileMenu(true)
  }

  // Handle closing mobile menu
  const closeMobileMenu = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowMobileMenu(false)
  }

  // Get only the top 5 categories
  const topCategories = categories.slice(0, 5)

  // Mobile menu items
  const menuItems = [
    { icon: <Home className="h-5 w-5" />, label: "Home", href: "/" },
    { icon: <ShoppingBag className="h-5 w-5" />, label: "Products", href: "/products" },
    { icon: <Package className="h-5 w-5" />, label: "Categories", href: "/categories" },
    { icon: <ShoppingCart className="h-5 w-5" />, label: "Hampers", href: "/hampers" },
    { icon: <Heart className="h-5 w-5" />, label: "Wishlist", href: "/wishlist" },
    { icon: <User className="h-5 w-5" />, label: "Account", href: "/account" },
    { icon: <Phone className="h-5 w-5" />, label: "Contact", href: "/contact" },
    { icon: <MessageSquare className="h-5 w-5" />, label: "Feedback", href: "/feedback" },
  ]

  return (
    <>
      <header
        ref={headerRef}
        className={`w-full transition-all duration-300 ${
          isScrolled ? "fixed top-0 left-0 right-0 z-[50] bg-white/95 backdrop-blur-md shadow-md" : "bg-white"
        } py-2`}
      >
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-zimbabwe-green via-zimbabwe-yellow to-zimbabwe-red"></div>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="relative h-12 w-12 mr-2 flex-shrink-0">
                <Image src="/images/logo3.png" alt="Zimbabwe Groceries Logo" fill className="object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg md:text-xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-zimbabwe-green via-zimbabwe-yellow to-zimbabwe-red">
                  Zimbabwe Groceries
                </span>
                <span className="hidden md:block text-xs text-gray-600 font-medium">Authentic Taste of Home</span>
              </div>
            </Link>

            {/* Desktop Navigation - Modified for touch devices */}
            <nav className="hidden lg:flex items-center space-x-1">
              {/* Home link */}
              <Link
                href="/"
                className="px-3 py-2 text-gray-700 hover:text-teal-600 hover:bg-gray-50 transition-colors rounded-md flex items-center"
              >
                <Home className="h-4 w-4 mr-1" />
                <span>Home</span>
              </Link>

              {/* Main navigation groups */}
              {navigationGroups.map((group) => (
                <div key={group.title} className="relative">
                  <button
                    className="flex items-center px-3 py-2 text-gray-700 hover:text-teal-600 hover:bg-gray-50 transition-colors rounded-md"
                    onClick={(e) => toggleDropdown(group.title, e)}
                    onTouchStart={(e) => {
                      e.preventDefault()
                      toggleDropdown(group.title)
                    }}
                    aria-expanded={activeGroup === group.title}
                  >
                    <span className="flex items-center">
                      {React.cloneElement(group.icon as React.ReactElement)}
                      {group.title}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 ml-1 transition-transform ${activeGroup === group.title ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div
                    className={`absolute left-0 mt-1 w-64 transition-all duration-200 transform z-50 ${
                      activeGroup === group.title
                        ? "opacity-100 visible translate-y-0"
                        : "opacity-0 invisible translate-y-1"
                    }`}
                  >
                    <div className="py-2 bg-white rounded-lg shadow-xl border border-gray-100">
                      {group.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600"
                          onClick={() => setActiveGroup(null)}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-3">
              <div
                ref={searchRef}
                className={`relative transition-all duration-300 ${searchFocused ? "w-72" : "w-48"}`}
              >
                <form onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                  />
                  {isSearching ? (
                    <Loader2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 animate-spin" />
                  ) : (
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  )}
                </form>

                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 z-50 max-h-96 overflow-y-auto">
                    <div className="py-2">
                      {searchResults.map((result) => (
                        <button
                          key={`${result.type}-${result.id}`}
                          className="w-full text-left px-4 py-2 hover:bg-teal-50 flex items-center"
                          onClick={() => handleSearchResultClick(result)}
                        >
                          {result.image_url && (
                            <div className="relative h-10 w-10 mr-3 flex-shrink-0">
                              <Image
                                src={
                                  result.image_url.startsWith("http")
                                    ? result.image_url
                                    : `http://192.168.0.123:8000${result.image_url}`
                                }
                                alt={result.name}
                                fill
                                className="object-cover rounded-md"
                              />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-800">{result.name}</div>
                            <div className="text-xs text-gray-500 capitalize">{result.type}</div>
                            {result.price && <div className="text-xs text-teal-600 font-medium">${result.price}</div>}
                          </div>
                        </button>
                      ))}
                      <div className="px-4 py-2 border-t border-gray-100">
                        <button
                          onClick={() => {
                            router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
                            setShowSearchResults(false)
                          }}
                          className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                        >
                          See all results
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* No Results Message */}
                {showSearchResults && searchQuery.trim().length >= 2 && searchResults.length === 0 && !isSearching && (
                  <div className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 z-50">
                    <div className="py-6 px-4 text-center">
                      <p className="text-gray-500 text-sm">No results found for "{searchQuery}"</p>
                      <button
                        onClick={() => {
                          router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
                          setShowSearchResults(false)
                        }}
                        className="mt-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
                      >
                        Browse all products
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <WishlistIcon />

              <Link href="/account" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <User className="h-5 w-5 text-gray-700" />
              </Link>

              <CartIcon />

              {/* Colorful Feedback Button */}
              <Link
                href="/feedback"
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-zimbabwe-green via-zimbabwe-yellow to-zimbabwe-red text-white font-medium text-sm hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Feedback</span>
              </Link>
            </div>

            {/* Mobile Menu Button and Quick Actions */}
            <div className="flex lg:hidden items-center space-x-3">
              {/* Search button for mobile */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setSearchFocused(!searchFocused)
                }}
                onTouchStart={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setSearchFocused(!searchFocused)
                }}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors mobile-search-button"
                aria-label="Search"
              >
                <Search className="h-5 w-5 text-gray-700" />
              </button>

              <WishlistIcon />
              <CartIcon />

              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowMobileMenu(true)
                }}
                onTouchStart={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowMobileMenu(true)
                }}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors mobile-menu-button"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar - Slides down when active */}
        <div
          className={`lg:hidden bg-white border-b border-gray-100 overflow-hidden transition-all duration-300 ${
            searchFocused ? "max-h-96 py-3" : "max-h-0 py-0"
          }`}
        >
          <div className="container mx-auto px-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={searchQuery}
                onChange={handleSearchInputChange}
              />
              {isSearching ? (
                <Loader2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 animate-spin" />
              ) : (
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              )}
              <button
                type="button"
                className="absolute right-3 top-2 text-gray-400"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setSearchFocused(false)
                }}
                onTouchStart={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setSearchFocused(false)
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </form>

            {/* Mobile Search Results */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="mt-2 bg-white rounded-lg shadow-md border border-gray-100 max-h-60 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    className="w-full text-left px-4 py-2 hover:bg-teal-50 flex items-center"
                    onClick={() => {
                      handleSearchResultClick(result)
                      setSearchFocused(false)
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation()
                      handleSearchResultClick(result)
                      setSearchFocused(false)
                    }}
                  >
                    {result.image_url && (
                      <div className="relative h-10 w-10 mr-3 flex-shrink-0">
                        <Image
                          src={
                            result.image_url.startsWith("http")
                              ? result.image_url
                              : `http://192.168.0.123:8000${result.image_url}`
                          }
                          alt={result.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-800">{result.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{result.type}</div>
                    </div>
                  </button>
                ))}
                <div className="px-4 py-2 border-t border-gray-100">
                  <button
                    onClick={() => {
                      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
                      setShowSearchResults(false)
                      setSearchFocused(false)
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation()
                      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
                      setShowSearchResults(false)
                      setSearchFocused(false)
                    }}
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                  >
                    See all results
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Modal - Fixed position to work when scrolled */}
      <AnimatePresence>
        {showMobileMenu && (
          <div className="fixed inset-0 z-[9999] lg:hidden" aria-modal="true" role="dialog" aria-label="Main Menu">
            {/* Backdrop - Changed to blurred background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm"
              onClick={closeMobileMenu}
              onTouchStart={closeMobileMenu}
            />

            {/* Menu panel */}
            <motion.div
              ref={mobileMenuRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute top-0 right-0 w-full max-w-xs h-full bg-gradient-to-r from-teal-600 to-teal-800 shadow-xl"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-teal-700/50 backdrop-blur-sm z-10 flex items-center justify-between p-4 border-b border-teal-500/30">
                <h3 className="font-bold text-lg text-white">Menu</h3>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowMobileMenu(false)
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowMobileMenu(false)
                  }}
                  className="p-2 rounded-full hover:bg-teal-600/50 text-white"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-4 space-y-1 overflow-y-auto h-[calc(100%-64px)]">
                {menuItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      pathname === item.href
                        ? "bg-white text-teal-700 font-medium"
                        : "text-white hover:bg-teal-700/50 transition-colors"
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <div className={pathname === item.href ? "text-teal-600" : "text-teal-100"}>{item.icon}</div>
                    <span>{item.label}</span>
                  </Link>
                ))}

                <div className="pt-6 mt-6 border-t border-teal-500/30">
                  <div className="text-teal-100 text-sm mb-4">Quick Links</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/wishlist"
                      className="flex flex-col items-center justify-center gap-2 bg-teal-700/50 hover:bg-teal-700/70 text-white p-3 rounded-lg transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <Heart className="h-5 w-5" />
                      <span className="text-xs">Wishlist</span>
                    </Link>
                    <Link
                      href="/cart"
                      className="flex flex-col items-center justify-center gap-2 bg-teal-700/50 hover:bg-teal-700/70 text-white p-3 rounded-lg transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <ShoppingCart className="h-5 w-5" />
                      <span className="text-xs">Cart</span>
                    </Link>
                    <Link
                      href="/account"
                      className="flex flex-col items-center justify-center gap-2 bg-teal-700/50 hover:bg-teal-700/70 text-white p-3 rounded-lg transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <User className="h-5 w-5" />
                      <span className="text-xs">Account</span>
                    </Link>
                    <Link
                      href="/contact"
                      className="flex flex-col items-center justify-center gap-2 bg-teal-700/50 hover:bg-teal-700/70 text-white p-3 rounded-lg transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <ShoppingBag className="h-5 w-5" />
                      <span className="text-xs">Hampers</span>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
