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
  Grid,
  RefreshCw,
  Settings,
  LogOut,
  HelpCircle,
  ShoppingCart,
} from "lucide-react"
import Image from "next/image"
import { getCategories } from "../lib/api/categories"
import type { Category } from "../Types"
import CartIcon from "./CartIcon"
import WishlistIcon from "./WishlistIcon"
import { useRouter } from "next/navigation"
import { searchItems, type SearchResult } from "../lib/api/search"
import { useDebounce } from "../hooks/useDebounce"
import ResetAppStateButton from "./ResetAppStateButton"
// Import the reset functions directly
import { resetAppState, resetCartAndWishlist, resetAuthState } from "../lib/reset-app-state"
import { useAuth } from "../hooks/useAuth"
import toast from "react-hot-toast"

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
  const searchRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const router = useRouter()
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const { logout, isAuthenticated } = useAuth()

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
  const toggleDropdown = (groupTitle: string) => {
    setActiveGroup(activeGroup === groupTitle ? null : groupTitle)
  }

  // Get only the top 5 categories
  const topCategories = categories.slice(0, 5)

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
              <div className="relative h-10 w-10 mr-2">
                <Image src="/images/" alt="Zimbabwe Groceries Logo" fill className="object-contain" />
              </div>
              <div>
                <span className="text-xl font-bold text-gradient">Zimbabwe Groceries</span>
                <span className="block text-xs text-gray-500">Authentic Taste of Home</span>
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
                    onClick={() => toggleDropdown(group.title)}
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

              {/* Add Reset App State Button */}
              <ResetAppStateButton />
            </div>

            {/* Mobile Menu Button and Quick Actions */}
            <div className="flex lg:hidden items-center space-x-3">
              {/* Search button for mobile */}
              <button
                onClick={() => setSearchFocused(!searchFocused)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Search className="h-5 w-5 text-gray-700" />
              </button>

              <WishlistIcon />
              <CartIcon />

              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
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
                onClick={() => setSearchFocused(false)}
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

      {/* Redesigned Mobile Menu - Fixed position to work when scrolled */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-white z-[100] overflow-y-auto">
          <div className="flex flex-col h-full">
            {/* Mobile menu header with close button */}
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <div className="flex items-center">
                <div className="relative h-8 w-8 mr-2">
                  <Image src="/placeholder.svg" alt="Zimbabwe Groceries Logo" fill className="object-contain" />
                </div>
                <span className="font-semibold text-lg">Menu</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </div>

            {/* Mobile menu tabs */}
            <div className="flex border-b overflow-x-auto scrollbar-hide sticky top-[65px] bg-white z-10">
              <button
                className={`px-4 py-3 font-medium text-sm flex items-center whitespace-nowrap ${
                  activeMobileTab === "shop" ? "text-teal-600 border-b-2 border-teal-600" : "text-gray-600"
                }`}
                onClick={() => setActiveMobileTab("shop")}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Shop
              </button>
              <button
                className={`px-4 py-3 font-medium text-sm flex items-center whitespace-nowrap ${
                  activeMobileTab === "account" ? "text-teal-600 border-b-2 border-teal-600" : "text-gray-600"
                }`}
                onClick={() => setActiveMobileTab("account")}
              >
                <User className="h-4 w-4 mr-2" />
                Account
              </button>
              <button
                className={`px-4 py-3 font-medium text-sm flex items-center whitespace-nowrap ${
                  activeMobileTab === "help" ? "text-teal-600 border-b-2 border-teal-600" : "text-gray-600"
                }`}
                onClick={() => setActiveMobileTab("help")}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Help
              </button>
              <button
                className={`px-4 py-3 font-medium text-sm flex items-center whitespace-nowrap ${
                  activeMobileTab === "settings" ? "text-teal-600 border-b-2 border-teal-600" : "text-gray-600"
                }`}
                onClick={() => setActiveMobileTab("settings")}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </button>
            </div>

            {/* Tab content */}
            <div className="flex-1 p-4 overflow-y-auto">
              {activeMobileTab === "shop" && (
                <div className="space-y-6">
                  <Link
                    href="/"
                    className="flex items-center p-3 bg-teal-50 text-teal-700 rounded-xl shadow-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Home className="h-5 w-5 mr-3" />
                    <span className="font-medium">Home </span>
                  </Link>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Products</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href="/products"
                        className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Package className="h-6 w-6 mb-2 text-teal-600" />
                        <span className="text-sm font-medium">All Products</span>
                      </Link>
                      <Link
                        href="/categories"
                        className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Grid className="h-6 w-6 mb-2 text-teal-600" />
                        <span className="text-sm font-medium">Categories</span>
                      </Link>
                      <Link
                        href="/hampers"
                        className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <ShoppingBag className="h-6 w-6 mb-2 text-teal-600" />
                        <span className="text-sm font-medium">Hampers</span>
                      </Link>
                      <Link
                        href="/wishlist"
                        className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Heart className="h-6 w-6 mb-2 text-teal-600" />
                        <span className="text-sm font-medium">Wishlist</span>
                      </Link>
                    </div>
                  </div>

                  {categories.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Popular Categories</h3>
                      <div className="space-y-2">
                        {topCategories.map((category) => (
                          <Link
                            key={category.id}
                            href={`/products?category=${category.id}`}
                            className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <span>{category.name}</span>
                            <ChevronDown className="h-4 w-4 ml-auto rotate-270" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeMobileTab === "account" && (
                <div className="space-y-4">
                  <Link
                    href="/account"
                    className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5 mr-3 text-teal-600" />
                    <div>
                      <span className="font-medium block">My Account</span>
                      <span className="text-xs text-gray-500">View your profile and settings</span>
                    </div>
                  </Link>

                  <Link
                    href="/account"
                    className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Package className="h-5 w-5 mr-3 text-teal-600" />
                    <div>
                      <span className="font-medium block">My Orders</span>
                      <span className="text-xs text-gray-500">Track and manage your orders</span>
                    </div>
                  </Link>

                  <Link
                    href="/wishlist"
                    className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="h-5 w-5 mr-3 text-teal-600" />
                    <div>
                      <span className="font-medium block">Wishlist</span>
                      <span className="text-xs text-gray-500">View your saved items</span>
                    </div>
                  </Link>

                  <Link
                    href="/cart"
                    className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ShoppingCart className="h-5 w-5 mr-3 text-teal-600" />
                    <div>
                      <span className="font-medium block">Shopping Cart</span>
                      <span className="text-xs text-gray-500">View your cart and checkout</span>
                    </div>
                  </Link>

                  {isAuthenticated ? (
                    <button
                      className="flex items-center w-full p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-5 w-5 mr-3 text-teal-600" />
                      <div>
                        <span className="font-medium block">Logout</span>
                        <span className="text-xs text-gray-500">Sign out of your account</span>
                      </div>
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogOut className="h-5 w-5 mr-3 text-teal-600" />
                      <div>
                        <span className="font-medium block">Login</span>
                        <span className="text-xs text-gray-500">Sign in to your account</span>
                      </div>
                    </Link>
                  )}
                </div>
              )}

              {activeMobileTab === "help" && (
                <div className="space-y-4">
                  <Link
                    href="/contact"
                    className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Phone className="h-5 w-5 mr-3 text-teal-600" />
                    <div>
                      <span className="font-medium block">Contact Us</span>
                      <span className="text-xs text-gray-500">Get in touch with our team</span>
                    </div>
                  </Link>

                  <Link
                    href="/shipping"
                    className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Package className="h-5 w-5 mr-3 text-teal-600" />
                    <div>
                      <span className="font-medium block">Shipping Info</span>
                      <span className="text-xs text-gray-500">Learn about our shipping policies</span>
                    </div>
                  </Link>

                  <Link
                    href="/returns"
                    className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <RefreshCw className="h-5 w-5 mr-3 text-teal-600" />
                    <div>
                      <span className="font-medium block">Returns &amp; Refunds</span>
                      <span className="text-xs text-gray-500">Learn about our return policies</span>
                    </div>
                  </Link>

                  <Link
                    href="/about-us"
                    className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Info className="h-5 w-5 mr-3 text-teal-600" />
                    <div>
                      <span className="font-medium block">About Us</span>
                      <span className="text-xs text-gray-500">Learn more about our company</span>
                    </div>
                  </Link>

                  <Link
                    href="/how-it-works"
                    className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <HelpCircle className="h-5 w-5 mr-3 text-teal-600" />
                    <div>
                      <span className="font-medium block">How It Works</span>
                      <span className="text-xs text-gray-500">Learn how our service works</span>
                    </div>
                  </Link>
                </div>
              )}

              {activeMobileTab === "settings" && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-medium text-gray-900 mb-3">App Settings</h3>

                    <div className="space-y-3">
                      {/* Use the actual reset functions directly */}
                      <button
                        className="flex items-center w-full p-3 bg-white rounded-lg shadow-sm mb-3"
                        onClick={() => {
                          resetCartAndWishlist()
                          setIsMenuOpen(false)
                        }}
                      >
                        <RefreshCw className="h-5 w-5 mr-3 text-teal-600" />
                        <span className="font-medium">Reset Cart & Wishlist</span>
                      </button>

                      <button
                        className="flex items-center w-full p-3 bg-white rounded-lg shadow-sm mb-3"
                        onClick={() => {
                          resetAuthState()
                          setIsMenuOpen(false)
                        }}
                      >
                        <RefreshCw className="h-5 w-5 mr-3 text-teal-600" />
                        <span className="font-medium">Reset Auth State</span>
                      </button>

                      <button
                        className="flex items-center w-full p-3 bg-white rounded-lg shadow-sm"
                        onClick={() => {
                          resetAppState()
                          setIsMenuOpen(false)
                        }}
                      >
                        <RefreshCw className="h-5 w-5 mr-3 text-teal-600" />
                        <span className="font-medium">Reset Everything</span>
                      </button>
                    </div>

                    <p className="text-xs text-gray-500 mt-3">
                      Resetting the app state will clear your selected items and return the app to its default state.
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-medium text-gray-900 mb-3">About the App</h3>
                    <p className="text-sm text-gray-600">Zimbabwe Groceries v1.0.0</p>
                    <p className="text-xs text-gray-500 mt-1">© 2023 Zimbabwe Groceries. All rights reserved.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

