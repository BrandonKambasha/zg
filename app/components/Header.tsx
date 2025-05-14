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
  ArrowLeft,
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
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [activeGroup, setActiveGroup] = useState<string | null>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showTabletSearch, setShowTabletSearch] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)
  const searchRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const { logout, isAuthenticated } = useAuth()
  const { items } = useCart()

  // Track window width for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    // Set initial width
    handleResize()

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Determine if we're on a tablet
  const isTablet = windowWidth >= 640 && windowWidth < 1024

  // Add the handleLogout function
  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Logged out successfully")
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

  // Handle clicks outside of dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      const target = event.target as Node

      // Handle search results
      if (searchRef.current && !searchRef.current.contains(target)) {
        setShowSearchResults(false)
      }

      // Handle navigation dropdowns
      if (activeGroup && !(target as Element).closest(".nav-dropdown")) {
        setActiveGroup(null)
      }
    }

    document.addEventListener("click", handleClickOutside)

    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [activeGroup])

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

  // Handle body scroll locking for mobile menu
  useEffect(() => {
    if (showMobileMenu || showTabletSearch) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [showMobileMenu, showTabletSearch])

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
      setShowTabletSearch(false)
    }
  }

  const handleSearchResultClick = (result: SearchResult) => {
    setShowSearchResults(false)
    setSearchQuery("")
    setShowTabletSearch(false)

    if (result.type === "product") {
      router.push(`/products/${result.id}`)
    } else if (result.type === "category") {
      router.push(`/products?category=${result.id}`)
    } else if (result.type === "hamper") {
      router.push(`/hampers/${result.id}`)
    }
  }

  // Toggle dropdown visibility
  const toggleDropdown = (groupTitle: string) => {
    setActiveGroup(activeGroup === groupTitle ? null : groupTitle)
  }

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
    { icon: <Package className="h-5 w-5" />, label: "Shipping Info", href: "/shipping" },
    { icon: <ShoppingBag className="h-5 w-5" />, label: "Returns & Refunds", href: "/returns" },
    { icon: <Info className="h-5 w-5" />, label: "How it Works", href: "/how-it-works" },
  ]

  return (
    <>
      <header
        ref={headerRef}
        className={`w-full transition-all duration-300 ${
          isScrolled ? "fixed top-0 left-0 right-0 z-[50] bg-white/95 backdrop-blur-md shadow-md" : "bg-white"
        } py-2`}
      >
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-green-600 via-yellow-500 to-red-600"></div>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="relative h-12 w-12 mr-2 flex-shrink-0">
                <Image src="/images/logo3.png" alt="Zimbabwe Groceries Logo" fill className="object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg md:text-xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-green-600 via-yellow-500 to-red-600">
                  Zimbabwe Groceries
                </span>
                <span className="hidden md:block text-xs text-gray-600 font-medium">Authentic Taste of Home</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
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
                <div key={group.title} className="relative nav-dropdown">
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
                  {activeGroup === group.title && (
                    <div className="absolute left-0 mt-1 w-64 z-50">
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
                  )}
                </div>
              ))}
            </nav>

            {/* Tablet Navigation */}
            <nav className="hidden sm:flex lg:hidden items-center space-x-1">
              <Link
                href="/"
                className="px-3 py-2 text-gray-700 hover:text-teal-600 hover:bg-gray-50 transition-colors rounded-md flex items-center"
              >
                <Home className="h-4 w-4" />
                <span className="sr-only">Home</span>
              </Link>

              {/* Simplified navigation for tablets */}
              <Link
                href="/products"
                className="px-3 py-2 text-gray-700 hover:text-teal-600 hover:bg-gray-50 transition-colors rounded-md flex items-center"
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="sr-only">Products</span>
              </Link>

              <Link
                href="/categories"
                className="px-3 py-2 text-gray-700 hover:text-teal-600 hover:bg-gray-50 transition-colors rounded-md flex items-center"
              >
                <Package className="h-4 w-4" />
                <span className="sr-only">Categories</span>
              </Link>

              <Link
                href="/contact"
                className="px-3 py-2 text-gray-700 hover:text-teal-600 hover:bg-gray-50 transition-colors rounded-md flex items-center"
              >
                <Phone className="h-4 w-4" />
                <span className="sr-only">Contact</span>
              </Link>
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
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-600 via-yellow-500 to-red-600 text-white font-medium text-sm hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Feedback</span>
              </Link>
            </div>

            {/* Tablet Actions */}
            <div className="hidden sm:flex lg:hidden items-center space-x-3">
              <button
                onClick={() => {
                  setShowTabletSearch(true)
                  setShowMobileMenu(false) // Close mobile menu when opening search
                }}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5 text-gray-700" />
              </button>

              <WishlistIcon />

              <Link href="/account" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <User className="h-5 w-5 text-gray-700" />
              </Link>

              <CartIcon />

              <button
                onClick={() => {
                  setShowMobileMenu(true)
                  setShowTabletSearch(false) // Close tablet search when opening mobile menu
                }}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5 text-gray-700" />
              </button>
            </div>

            {/* Mobile Menu Button and Quick Actions */}
            <div className="flex sm:hidden items-center space-x-3">
              {/* Search button for mobile */}
              <button
                onClick={() => {
                  setSearchFocused(!searchFocused)
                  setShowMobileMenu(false) // Close mobile menu when opening search
                }}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5 text-gray-700" />
              </button>

              <WishlistIcon />
              <CartIcon />

              <button
                onClick={() => {
                  setShowMobileMenu(true)
                  setSearchFocused(false) // Close search when opening mobile menu
                }}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar - Slides down when active */}
        <div
          className={`sm:hidden bg-white border-b border-gray-100 overflow-hidden transition-all duration-300 ${
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

      {/* Tablet Full-Screen Search */}
      {showTabletSearch && (
        <div className="fixed inset-0 z-[9999] bg-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowTabletSearch(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </button>
              <h2 className="text-lg font-medium">Search Products</h2>
              <div className="w-10"></div> {/* Spacer for alignment */}
            </div>

            <form onSubmit={handleSearchSubmit} className="relative mb-4">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={searchQuery}
                onChange={handleSearchInputChange}
                autoFocus
              />
              {isSearching ? (
                <Loader2 className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 animate-spin" />
              ) : (
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              )}
              {searchQuery && (
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 p-1 hover:bg-gray-100 rounded-full"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>

            {/* Tablet Search Results */}
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {searchResults.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    onClick={() => handleSearchResultClick(result)}
                  >
                    {result.image_url && (
                      <div className="relative h-32 w-full">
                        <Image
                          src={
                            result.image_url.startsWith("http")
                              ? result.image_url
                              : `http://192.168.0.123:8000${result.image_url}`
                          }
                          alt={result.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-3">
                      <div className="font-medium text-gray-800 line-clamp-1">{result.name}</div>
                      <div className="flex justify-between items-center mt-1">
                        <div className="text-xs text-gray-500 capitalize">{result.type}</div>
                        {result.price && <div className="text-sm text-teal-600 font-medium">${result.price}</div>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery.trim().length >= 2 && !isSearching ? (
              <div className="py-8 text-center">
                <p className="text-gray-500">No results found for "{searchQuery}"</p>
                <button
                  onClick={() => {
                    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
                    setShowTabletSearch(false)
                  }}
                  className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg"
                >
                  Browse all products
                </button>
              </div>
            ) : (
              !isSearching && (
                <div className="py-8 text-center">
                  <p className="text-gray-500">Type to search for products, categories, or hampers</p>

                  {/* Quick category links */}
                  {categories.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Popular Categories</h3>
                      <div className="flex flex-wrap justify-center gap-2">
                        {categories.slice(0, 8).map((category) => (
                          <button
                            key={category.id}
                            onClick={() => {
                              router.push(`/products?category=${category.id}`)
                              setShowTabletSearch(false)
                            }}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700"
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            )}

            {isSearching && (
              <div className="py-8 flex justify-center">
                <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile/Tablet Menu Modal */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-[9999] lg:hidden" aria-modal="true" role="dialog" aria-label="Main Menu">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)} />

          {/* Menu panel */}
          <div
            className={`absolute top-0 right-0 h-full flex flex-col bg-gradient-to-r from-teal-600 to-teal-800 shadow-xl rounded-l-2xl overflow-hidden ${
              isTablet ? "w-[320px]" : "w-full max-w-xs"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-teal-700/70 backdrop-blur-md z-10 px-5 py-4 border-b border-teal-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <h3 className="font-bold text-lg text-white ml-4">Menu</h3>
                </div>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
              <div className="h-1 w-full bg-gradient-to-r from-green-600 via-yellow-500 to-red-600 mt-4 rounded-full"></div>
            </div>

            <div className="p-5 overflow-y-auto h-[calc(100%-84px)]">
              {/* Grid layout for tablets */}
              <div className={isTablet ? "grid grid-cols-2 gap-3" : "space-y-1.5"}>
                {menuItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 p-3.5 rounded-xl transition-all ${
                      pathname === item.href
                        ? "bg-white/10 text-white font-medium shadow-sm border border-white/10"
                        : "text-white hover:bg-teal-700/50"
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <div className={`${pathname === item.href ? "bg-white/20 p-1.5 rounded-lg" : "text-teal-100"}`}>
                      {item.icon}
                    </div>
                    <span>{item.label}</span>
                    {pathname === item.href && <div className="ml-auto w-1.5 h-6 bg-white rounded-full"></div>}
                  </Link>
                ))}
              </div>

              {isAuthenticated ? (
                <button
                  onClick={() => {
                    handleLogout()
                    setShowMobileMenu(false)
                  }}
                  className="w-full flex items-center justify-center gap-2 mt-6 bg-gradient-to-r from-red-600/30 to-red-500/30 hover:from-red-600/40 hover:to-red-500/40 text-white p-3.5 rounded-xl transition-colors border border-red-500/20"
                >
                  <User className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 mt-6 bg-gradient-to-r from-teal-500/30 to-teal-400/30 hover:from-teal-500/40 hover:to-teal-400/40 text-white p-3.5 rounded-xl transition-colors border border-teal-400/20"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <User className="h-5 w-5" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
