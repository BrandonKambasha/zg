"use client"

import React from "react"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
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
} from "lucide-react"
import Image from "next/image"
import { getCategories } from "../lib/api/categories"
import type { Category } from "../Types"
import CartIcon from "./CartIcon"
import WishlistIcon from "./WishlistIcon"
import { useRouter } from "next/navigation"
import { searchItems, type SearchResult } from "../lib/api/search"
import { useDebounce } from "../hooks/useDebounce"

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
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
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
        setCategories(data || [])
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
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

  // Get only the top 5 categories
  const topCategories = categories.slice(0, 5)

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-md py-2" : "bg-white py-2"
      }`}
    >
      <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-zimbabwe-green via-zimbabwe-yellow to-zimbabwe-red"></div>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative h-10 w-10 mr-2">
              <Image src="/placeholder.svg" alt="Zimbabwe Groceries Logo" fill className="object-contain" />
            </div>
            <div>
              <span className="text-xl font-bold text-gradient">Zimbabwe Groceries</span>
              <span className="block text-xs text-gray-500">Authentic Taste of Home</span>
            </div>
          </Link>

          {/* Desktop Navigation - Simplified with mega menu */}
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
              <div
                key={group.title}
                className="relative group"
                onMouseEnter={() => setActiveGroup(group.title)}
                onMouseLeave={() => setActiveGroup(null)}
              >
                <button className="flex items-center px-3 py-2 text-gray-700 hover:text-teal-600 hover:bg-gray-50 transition-colors rounded-md">
                  <span className="flex items-center">
                    {React.cloneElement(group.icon as React.ReactElement)}
                    {group.title}
                  </span>
                  <ChevronDown className="h-4 w-4 ml-1 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute left-0 mt-1 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-1 z-50">
                  <div className="py-2 bg-white rounded-lg shadow-xl border border-gray-100">
                    {group.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600"
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
            <div ref={searchRef} className={`relative transition-all duration-300 ${searchFocused ? "w-72" : "w-48"}`}>
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
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="h-5 w-5 text-gray-700" /> : <Menu className="h-5 w-5 text-gray-700" />}
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

      {/* Mobile Menu - Modern tab-based navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-100 animate-in fade-in slide-in-from-top-5 duration-200">
          <div className="container mx-auto px-4 py-4">
            {/* Mobile navigation tabs */}
            <div className="grid grid-cols-3 gap-2 mb-4 bg-gray-100 p-1 rounded-lg">
              {navigationGroups.map((group) => (
                <button
                  key={group.title}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-md text-sm transition-colors ${
                    activeGroup === group.title ? "bg-white text-teal-600 shadow-sm" : "text-gray-600 hover:bg-gray-200"
                  }`}
                  onClick={() => setActiveGroup(activeGroup === group.title ? null : group.title)}
                >
                  {React.cloneElement(group.icon as React.ReactElement)}
                  <span>{group.title}</span>
                </button>
              ))}
            </div>

            {/* Links for active group */}
            <div className="overflow-hidden transition-all duration-300">
              {activeGroup ? (
                <div className="grid grid-cols-2 gap-2">
                  {navigationGroups
                    .find((group) => group.title === activeGroup)
                    ?.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center p-3 bg-gray-50 hover:bg-teal-50 hover:text-teal-600 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span>{link.label}</span>
                      </Link>
                    ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Quick links when no group is selected */}
                  <div>
                    <h3 className="text-xs uppercase text-gray-500 font-medium mb-2">Quick Links</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/"
                        className="flex items-center p-3 bg-gray-50 hover:bg-teal-50 hover:text-teal-600 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Home className="h-4 w-4 mr-2" />
                        <span>Home</span>
                      </Link>
                      <Link
                        href="/products"
                        className="flex items-center p-3 bg-gray-50 hover:bg-teal-50 hover:text-teal-600 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        <span>All Products</span>
                      </Link>
                      <Link
                        href="/categories"
                        className="flex items-center p-3 bg-gray-50 hover:bg-teal-50 hover:text-teal-600 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Grid className="h-4 w-4 mr-2" />
                        <span>Categories</span>
                      </Link>
                      <Link
                        href="/contact"
                        className="flex items-center p-3 bg-gray-50 hover:bg-teal-50 hover:text-teal-600 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        <span>Contact</span>
                      </Link>
                    </div>
                  </div>

                  {/* Account links */}
                  <div>
                    <h3 className="text-xs uppercase text-gray-500 font-medium mb-2">Your Account</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/account"
                        className="flex items-center p-3 bg-gray-50 hover:bg-teal-50 hover:text-teal-600 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        <span>My Account</span>
                      </Link>
                      <Link
                        href="/wishlist"
                        className="flex items-center p-3 bg-gray-50 hover:bg-teal-50 hover:text-teal-600 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        <span>Wishlist</span>
                      </Link>
                      <Link
                        href="/cart"
                        className="flex items-center p-3 bg-gray-50 hover:bg-teal-50 hover:text-teal-600 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        <span>Cart</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

