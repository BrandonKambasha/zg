"use client"

import { useEffect, useState, useMemo } from "react"
import { useAuth } from "../hooks/useAuth"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import {
  User,
  Package,
  Heart,
  Settings,
  LogOut,
  AlertTriangle,
  Eye,
  ShoppingCart,
  Trash2,
  ChevronRight,
  Clock,
  MapPin,
  Phone,
  Shield,
  X,
  ChevronDown,
  Info,
} from "lucide-react"
import { getMyOrders } from "../lib/api/orders"
import type { Order } from "../Types"
import { AdminPanel } from "../components/AdminPanel"
import OrderModal from "../components/OrderModal"
import { useWishlist } from "../hooks/useWishlist"
import { useCart } from "../hooks/useCart"
import Link from "next/link"
import Image from "next/image"
import { apiBaseUrl } from "../lib/axios"
import { motion, AnimatePresence } from "framer-motion"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email").optional(),
  phone_number: z.string().optional(),
  shipping_address: z.string().optional(),
  house_number: z.string().optional(),
  street: z.string().optional(),
  location: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  zim_contact: z.string().optional(),
  zim_name: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function AccountPage() {
  const { user, isAuthenticated, isLoading, updateUserProfile, logout, deleteAccount } = useAuth()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showNavTip, setShowNavTip] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone_number: "",
      house_number: "",
      street: "",
      city: "",
      location: "",
      country: "",
      zim_contact: "",
      zim_name: "",
    },
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?redirect=/account")
      return
    }

    if (user) {
      reset({
        name: user.name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        house_number: user.house_number || "",
        street: user.street || "",
        city: user.city || "",
        location: user.location || "",
        country: user.country || "",
        zim_contact: user.zim_contact || "",
        zim_name: user.zim_name || "",
      })
    }
  }, [isAuthenticated, isLoading, user, router, reset])

  useEffect(() => {
    if (activeTab === "orders" && isAuthenticated) {
      fetchOrders()
    }
  }, [activeTab, isAuthenticated])

  // Hide the navigation tip after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNavTip(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const fetchOrders = async () => {
    setOrdersLoading(true)
    try {
      const data = await getMyOrders()
      setOrders(data)
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      toast.error("Failed to load your orders")
    } finally {
      setOrdersLoading(false)
    }
  }

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true)
    try {
      await updateUserProfile(data)
      toast.success("Profile updated successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Logged out successfully")
      router.push("/login")
    } catch (error: any) {
      toast.error(error.message || "Failed to logout")
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError("Password is required to delete your account")
      return
    }

    setIsDeleting(true)
    setDeleteError("")

    try {
      await deleteAccount(deletePassword)
      toast.success("Your account has been deleted")
      router.push("/login")
    } catch (error: any) {
      setDeleteError(error.message || "Failed to delete account")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setMobileMenuOpen(false)
    setShowNavTip(false)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent"></div>
        <p className="ml-2">Loading your account...</p>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null // Handled by useEffect redirect
  }

  // Navigation items configuration
  const navItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "Orders", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  // Add admin tab if user is admin
  if (user.role === "admin") {
    navItems.push({ id: "admin", label: "Admin", icon: Shield })
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
      {/* Header with user info - improved design */}
      <div className="mb-6 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl shadow-lg text-white overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2.5 sm:p-3 flex items-center justify-center">
                <User className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold">{user.name || "Welcome"}</h1>
                <p className="text-teal-100 text-xs sm:text-base truncate max-w-[180px] sm:max-w-none">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/20 text-sm"
            >
              <LogOut className="w-4 h-4 mr-1 sm:mr-2" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation - modern and instructive */}
      <div className="sm:hidden mb-6">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Current section indicator */}
          <div
            className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className="flex items-center">
              <div className="bg-teal-50 rounded-full p-2 mr-3">
                {activeTab === "profile" && <User className="w-5 h-5 text-teal-600" />}
                {activeTab === "orders" && <Package className="w-5 h-5 text-teal-600" />}
                {activeTab === "wishlist" && <Heart className="w-5 h-5 text-teal-600" />}
                {activeTab === "settings" && <Settings className="w-5 h-5 text-teal-600" />}
                {activeTab === "admin" && <Shield className="w-5 h-5 text-teal-600" />}
              </div>
              <div>
                <span className="font-medium text-gray-800 block">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </span>
                <span className="text-xs text-gray-500">
                  {activeTab === "profile" && "Manage your personal information"}
                  {activeTab === "orders" && "View your order history"}
                  {activeTab === "wishlist" && "Products you've saved"}
                  {activeTab === "settings" && "Account preferences"}
                  {activeTab === "admin" && "Admin dashboard"}
                </span>
              </div>
            </div>
            <button
              className="flex items-center justify-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <div className="flex flex-col items-center">
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-600" />
                ) : (
                  <>
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                    <span className="text-xs text-gray-500 mt-1">Menu</span>
                  </>
                )}
              </div>
            </button>
          </div>

          {/* Navigation tip */}
          <AnimatePresence>
            {showNavTip && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-blue-50 px-4 py-3 border-b border-blue-100"
              >
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-700">
                      Tap the section above to switch between different account areas
                    </p>
                  </div>
                  <button
                    onClick={() => setShowNavTip(false)}
                    className="ml-2 text-blue-500 p-1 rounded-full hover:bg-blue-100 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dropdown menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-gray-100 overflow-hidden"
              >
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`flex items-center w-full p-4 text-left transition-colors ${
                      activeTab === item.id
                        ? "bg-teal-50 text-teal-600 border-l-4 border-teal-500"
                        : "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent"
                    }`}
                  >
                    <div className={`rounded-full p-2 mr-3 ${activeTab === item.id ? "bg-teal-100" : "bg-gray-100"}`}>
                      <item.icon className={`w-5 h-5 ${activeTab === item.id ? "text-teal-600" : "text-gray-500"}`} />
                    </div>
                    <div>
                      <span className="font-medium block">{item.label}</span>
                      <span className="text-xs text-gray-500">
                        {item.id === "profile" && "Personal details & address"}
                        {item.id === "orders" && "View your purchase history"}
                        {item.id === "wishlist" && "Products you've saved"}
                        {item.id === "settings" && "Password & notifications"}
                        {item.id === "admin" && "Manage store content"}
                      </span>
                    </div>
                    {activeTab === item.id && (
                      <div className="ml-auto">
                        <div className="bg-teal-100 text-teal-600 text-xs px-2 py-1 rounded-full">Active</div>
                      </div>
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Desktop tab navigation */}
      <div className="hidden sm:block mb-6 bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <nav className="flex min-w-max p-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
                  activeTab === item.id ? "bg-teal-50 text-teal-600" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className={`w-4 h-4 mr-2 ${activeTab === item.id ? "text-teal-600" : "text-gray-400"}`} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content area */}
      <div>
        {/* Profile Tab Content - Improved layout and styling */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Profile Information</h2>
              <p className="text-xs sm:text-sm text-gray-500">Update your personal details and shipping information.</p>
            </div>
            <div className="p-4 sm:p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="md:col-span-2">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800 flex items-center">
                      <User className="w-5 h-5 mr-2 text-teal-500" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Full Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          {...register("name")}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-base"
                          placeholder="Your full name"
                          style={{ minHeight: "48px" }}
                        />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email Address
                        </label>
                        <input
                          id="email"
                          type="email"
                          {...register("email")}
                          className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                          disabled
                          style={{ minHeight: "48px" }}
                        />
                        <p className="text-xs text-gray-400">Email cannot be changed</p>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                          Phone Number
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Phone className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            id="phone_number"
                            type="text"
                            {...register("phone_number")}
                            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-base"
                            placeholder="Your phone number"
                            style={{ minHeight: "48px" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 mt-6">
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800 flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-yellow-500" />
                        Zimbabwe Delivery Address
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">Please provide delivery details for Zimbabwe</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-2">
                          <label htmlFor="zim_name" className="block text-sm font-medium text-gray-700">
                            Recipient Name
                          </label>
                          <input
                            id="zim_name"
                            type="text"
                            {...register("zim_name")}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-base"
                            placeholder="Name of recipient in Zimbabwe"
                            style={{ minHeight: "48px" }}
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="zim_contact" className="block text-sm font-medium text-gray-700">
                            Recipient Phone Number
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <Phone className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              id="zim_contact"
                              type="text"
                              {...register("zim_contact")}
                              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-base"
                              placeholder="Zimbabwe contact number"
                              style={{ minHeight: "48px" }}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="house_number" className="block text-sm font-medium text-gray-700">
                            House/Apartment Number
                          </label>
                          <input
                            id="house_number"
                            type="text"
                            {...register("house_number")}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-base"
                            placeholder="House/Apt number"
                            style={{ minHeight: "48px" }}
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                            Street
                          </label>
                          <input
                            id="street"
                            type="text"
                            {...register("street")}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-base"
                            placeholder="Street name"
                            style={{ minHeight: "48px" }}
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                            Location/Suburb
                          </label>
                          <input
                            id="location"
                            type="text"
                            {...register("location")}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-base"
                            placeholder="Suburb or location"
                            style={{ minHeight: "48px" }}
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                            City
                          </label>
                          <input
                            id="city"
                            type="text"
                            {...register("city")}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-base"
                            placeholder="City"
                            style={{ minHeight: "48px" }}
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                            Country
                          </label>
                          <input
                            id="country"
                            type="text"
                            {...register("country")}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-base"
                            placeholder="Zimbabwe"
                            defaultValue="Zimbabwe"
                            style={{ minHeight: "48px" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center sm:justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-teal-600 text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors shadow-md disabled:opacity-70 flex items-center w-full sm:w-auto justify-center"
                    style={{ minHeight: "48px" }}
                  >
                    {isSaving ? (
                      <>
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Orders Tab Content - Improved styling */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Order History</h2>
              <p className="text-xs sm:text-sm text-gray-500">View and manage your recent orders.</p>
            </div>
            <div className="p-4 sm:p-6">
              <OrderHistory orders={orders} isLoading={ordersLoading} />
            </div>
          </div>
        )}

        {/* Wishlist Tab Content - Improved styling */}
        {activeTab === "wishlist" && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Wishlist</h2>
              <p className="text-xs sm:text-sm text-gray-500">Products you've saved for later.</p>
            </div>
            <div className="p-4 sm:p-6">
              <WishlistItems />
            </div>
          </div>
        )}

        {/* Settings Tab Content - Improved styling */}
        {activeTab === "settings" && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Account Settings</h2>
              <p className="text-xs sm:text-sm text-gray-500">Manage your account preferences.</p>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-6 sm:space-y-8">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                  <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-base sm:text-lg font-medium text-gray-800">Password</h3>
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">
                          Current Password
                        </label>
                        <input
                          id="current_password"
                          type="password"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                          placeholder="••••••••"
                          style={{ minHeight: "48px" }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                          New Password
                        </label>
                        <input
                          id="new_password"
                          type="password"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                          placeholder="••••••••"
                          style={{ minHeight: "48px" }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                          Confirm New Password
                        </label>
                        <input
                          id="confirm_password"
                          type="password"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                          placeholder="••••••••"
                          style={{ minHeight: "48px" }}
                        />
                      </div>
                    </div>
                    <button
                      className="mt-6 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors shadow-md w-full sm:w-auto"
                      style={{ minHeight: "44px" }}
                    >
                      Update Password
                    </button>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-red-200 overflow-hidden shadow-sm">
                  <div className="px-4 sm:px-6 py-3 sm:py-4 bg-red-50 border-b border-red-200">
                    <h3 className="text-base sm:text-lg font-medium text-red-600">Danger Zone</h3>
                  </div>
                  <div className="p-4 sm:p-6">
                    <p className="text-sm text-gray-600 mb-6">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>

                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-white border-2 border-red-500 text-red-500 px-6 py-2 rounded-lg hover:bg-red-50 transition-colors w-full sm:w-auto"
                        style={{ minHeight: "44px" }}
                      >
                        Delete Account
                      </button>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-5">
                        <div className="flex items-center mb-4">
                          <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 mr-3 flex-shrink-0" />
                          <h4 className="font-semibold text-red-700 text-sm sm:text-base">Confirm Account Deletion</h4>
                        </div>

                        <p className="text-xs sm:text-sm text-red-700 mb-4">
                          This action cannot be undone. All your data, including orders and payment information, will be
                          permanently deleted.
                        </p>

                        <div className="mb-4">
                          <label htmlFor="delete_password" className="block text-sm font-medium mb-2 text-red-700">
                            Enter your password to confirm
                          </label>
                          <input
                            id="delete_password"
                            type="password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            className="w-full p-3 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                            placeholder="Your current password"
                            style={{ minHeight: "48px" }}
                          />
                          {deleteError && <p className="text-red-600 text-sm mt-1">{deleteError}</p>}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70 flex items-center justify-center w-full sm:w-auto"
                            style={{ minHeight: "48px" }}
                          >
                            {isDeleting ? (
                              <>
                                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                                Deleting...
                              </>
                            ) : (
                              "Confirm Deletion"
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setShowDeleteConfirm(false)
                              setDeletePassword("")
                              setDeleteError("")
                            }}
                            className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
                            style={{ minHeight: "48px" }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Tab Content */}
        {activeTab === "admin" && user.role === "admin" && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Admin Dashboard</h2>
              <p className="text-xs sm:text-sm text-gray-500">Manage products, categories, and orders.</p>
            </div>
            <div className="p-4 sm:p-6">
              <AdminPanel />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Order History Component - Professional redesign
function OrderHistory({ orders, isLoading }: { orders: Order[]; isLoading: boolean }) {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [sortOption, setSortOption] = useState<string>("newest")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 5

  // Get unique statuses from orders
  const orderStatuses = useMemo(() => {
    if (!orders.length) return []
    const statusSet = new Set(orders.map((order) => order.status))
    return Array.from(statusSet)
  }, [orders])

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let result = [...orders]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (order) =>
          order.id.toString().includes(query) ||
          order.status.toLowerCase().includes(query) ||
          (order.shipping_address && order.shipping_address.toLowerCase().includes(query)),
      )
    }

    // Apply status filter
    if (filterStatus) {
      result = result.filter((order) => order.status === filterStatus)
    }

    // Apply sorting
    switch (sortOption) {
      case "newest":
        return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case "oldest":
        return result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      case "highest":
        return result.sort((a, b) => b.total_amount - a.total_amount)
      case "lowest":
        return result.sort((a, b) => a.total_amount - b.total_amount)
      default:
        return result
    }
  }, [orders, searchQuery, filterStatus, sortOption])

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)
  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    // Scroll to top of orders section
    document.getElementById("orders-section")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const openOrderModal = (orderId: number) => {
    setSelectedOrderId(orderId)
    setIsModalOpen(true)
  }

  const closeOrderModal = () => {
    setIsModalOpen(false)
    // We don't reset the selectedOrderId immediately to avoid flickering during modal close animation
    setTimeout(() => {
      setSelectedOrderId(null)
    }, 300)
  }

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterStatus, sortOption])

  if (isLoading) {
    return (
      <div className="py-8 sm:py-12 text-center">
        <div className="inline-block h-8 w-8 sm:h-10 sm:w-10 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent mb-3 sm:mb-4"></div>
        <p className="text-gray-500">Loading your orders...</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="py-8 sm:py-12 text-center">
        <div className="bg-gray-50 inline-flex rounded-full p-3 sm:p-4 mb-3 sm:mb-4">
          <Package className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold mb-2">No orders yet</h3>
        <p className="text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto px-4 sm:px-0">
          You haven't placed any orders yet. Start shopping to see your orders here.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center bg-teal-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-teal-700 transition-colors shadow-md text-sm sm:text-base"
        >
          Browse Products
          <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    )
  }

  return (
    <div id="orders-section">
      {/* Orders header with stats and controls */}
      <div className="mb-6 bg-gray-50 rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Package className="w-5 h-5 mr-2 text-teal-600" />
              My Orders ({orders.length} {orders.length === 1 ? "order" : "orders"})
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Track your order history, check status, and view order details.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              type="search"
              className="block w-full sm:w-64 p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-teal-500 focus:border-teal-500"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filters and sorting */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center">
          {/* Status filter */}
          {orderStatuses.length > 1 && (
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={filterStatus || ""}
                onChange={(e) => setFilterStatus(e.target.value || null)}
              >
                <option value="">All Statuses</option>
                {orderStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          )}

          {/* Sort options */}
          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="newest">Sort by: Newest First</option>
              <option value="oldest">Sort by: Oldest First</option>
              <option value="highest">Sort by: Highest Amount</option>
              <option value="lowest">Sort by: Lowest Amount</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>

          {/* Clear filters button - only show if filters are applied */}
          {(filterStatus || searchQuery || sortOption !== "newest") && (
            <button
              onClick={() => {
                setFilterStatus(null)
                setSearchQuery("")
                setSortOption("newest")
              }}
              className="ml-auto text-sm text-teal-600 hover:text-teal-800 flex items-center"
            >
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Orders list with improved cards */}
      {currentOrders.length > 0 ? (
        <div className="space-y-4">
          {currentOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Order status indicator */}
                    <div className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full mr-2 ${
                          order.status === "delivered"
                            ? "bg-green-500"
                            : order.status === "shipped"
                              ? "bg-blue-500"
                              : order.status === "processing"
                                ? "bg-yellow-500"
                                : order.status === "cancelled"
                                  ? "bg-red-500"
                                  : "bg-gray-500"
                        }`}
                      ></div>
                      <span
                        className={`text-sm font-medium ${
                          order.status === "delivered"
                            ? "text-green-700"
                            : order.status === "shipped"
                              ? "text-blue-700"
                              : order.status === "processing"
                                ? "text-yellow-700"
                                : order.status === "cancelled"
                                  ? "text-red-700"
                                  : "text-gray-700"
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>

                    {/* Order ID and date */}
                    <div>
                      <h4 className="font-semibold text-gray-900">Order #{order.id}</h4>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {new Date(order.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Order amount and actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="text-right">
                      <div className="font-bold text-gray-900">${order.total_amount}</div>
                      
                    </div>
                    <button
                      onClick={() => openOrderModal(order.id)}
                      className="bg-teal-50 hover:bg-teal-100 text-teal-600 px-4 py-2 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </button>
                  </div>
                </div>

                {/* Order progress bar for non-cancelled orders */}
                {order.status !== "cancelled" && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="relative">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                        <div
                          style={{
                            width:
                              order.status === "delivered"
                                ? "100%"
                                : order.status === "shipped"
                                  ? "66%"
                                  : order.status === "processing"
                                    ? "33%"
                                    : "0%",
                          }}
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                            order.status === "delivered"
                              ? "bg-green-500"
                              : order.status === "shipped"
                                ? "bg-blue-500"
                                : "bg-yellow-500"
                          }`}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span className={order.status !== "pending" ? "font-medium" : ""}>Processing</span>
                        <span
                          className={order.status === "shipped" || order.status === "delivered" ? "font-medium" : ""}
                        >
                          Shipped
                        </span>
                        <span className={order.status === "delivered" ? "font-medium" : ""}>Delivered</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cancelled order message */}
                {order.status === "cancelled" && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm flex items-start">
                      <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Order cancelled</span>
                        
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center bg-gray-50 rounded-xl">
          <div className="bg-white inline-flex rounded-full p-3 mb-3 shadow-sm">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No matching orders</h3>
          <p className="text-gray-500 mb-4 max-w-md mx-auto">
            No orders match your current search or filter criteria. Try adjusting your filters.
          </p>
          <button
            onClick={() => {
              setFilterStatus(null)
              setSearchQuery("")
              setSortOption("newest")
            }}
            className="inline-flex items-center bg-teal-600 text-white px-5 py-2.5 rounded-lg hover:bg-teal-700 transition-colors shadow-md text-sm"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                currentPage === 1
                  ? "border-gray-300 bg-white text-gray-300 cursor-not-allowed"
                  : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              <span className="sr-only">Previous</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1
              // Show current page, first page, last page, and pages around current page
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => paginate(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 border ${
                      currentPage === pageNumber
                        ? "z-10 bg-teal-50 border-teal-500 text-teal-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {pageNumber}
                  </button>
                )
              }

              // Show ellipsis for skipped pages
              if (
                (pageNumber === 2 && currentPage > 3) ||
                (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
              ) {
                return (
                  <span
                    key={pageNumber}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700"
                  >
                    ...
                  </span>
                )
              }

              return null
            })}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                currentPage === totalPages
                  ? "border-gray-300 bg-white text-gray-300 cursor-not-allowed"
                  : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              <span className="sr-only">Next</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
      )}

      {/* Order Modal */}
      <OrderModal orderId={selectedOrderId} isOpen={isModalOpen} onClose={closeOrderModal} />
    </div>
  )
}

// Wishlist Items Component - Improved styling for mobile
function WishlistItems() {
  const { items, isLoading, removeFromWishlist } = useWishlist()
  const { addItem } = useCart()
  const [isAddingToCart, setIsAddingToCart] = useState<Record<number, boolean>>({})
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortOption, setSortOption] = useState<string>("default")

  const handleAddToCart = (item: any) => {
    setIsAddingToCart((prev) => ({ ...prev, [item.id]: true }))

    // Simulate a small delay for better UX
    setTimeout(() => {
      addItem(item.wishlistable, 1)
      toast.success(`${item.wishlistable.name} added to cart`)
      setIsAddingToCart((prev) => ({ ...prev, [item.id]: false }))
    }, 500)
  }

  // Ensure image URLs have the API prefix
  const getFullImageUrl = (url: string | undefined): string => {
    if (!url) return "/placeholder.svg"
    return url.startsWith("http") ? url : `${apiBaseUrl}${url}`
  }

  // Get unique categories from wishlist items
  const categories = useMemo(() => {
    if (!items.length) return []
    const categorySet = new Set(
      items.map((item) =>
        item.wishlistable.category
          ? typeof item.wishlistable.category === "string"
            ? item.wishlistable.category
            : "Uncategorized"
          : "Uncategorized",
      ),
    )
    return Array.from(categorySet)
  }, [items])

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let result = [...items]

    // Apply category filter
    if (selectedCategory) {
      result = result.filter((item) => {
        const itemCategory = item.wishlistable.category
          ? typeof item.wishlistable.category === "string"
            ? item.wishlistable.category
            : "Uncategorized"
          : "Uncategorized"
        return itemCategory === selectedCategory
      })
    }

    // Apply sorting
    switch (sortOption) {
      case "price-low":
        return result.sort((a, b) => a.wishlistable.price - b.wishlistable.price)
      case "price-high":
        return result.sort((a, b) => b.wishlistable.price - a.wishlistable.price)
      case "name-asc":
        return result.sort((a, b) => a.wishlistable.name.localeCompare(b.wishlistable.name))
      case "name-desc":
        return result.sort((a, b) => b.wishlistable.name.localeCompare(a.wishlistable.name))
      default:
        return result
    }
  }, [items, selectedCategory, sortOption])

  if (isLoading) {
    return (
      <div className="py-8 sm:py-12 text-center">
        <div className="inline-block h-8 w-8 sm:h-10 sm:w-10 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent mb-3 sm:mb-4"></div>
        <p className="text-gray-500">Loading your wishlist...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="py-8 sm:py-12 text-center">
        <div className="bg-gray-50 inline-flex rounded-full p-3 sm:p-4 mb-3 sm:mb-4">
          <Heart className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold mb-2">Your wishlist is empty</h3>
        <p className="text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto px-4 sm:px-0">
          Add items to your wishlist by clicking the heart icon on products you love.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center bg-teal-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-teal-700 transition-colors shadow-md text-sm sm:text-base"
        >
          Browse Products
          <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Wishlist header with stats and controls */}
      <div className="mb-6 bg-gray-50 rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-teal-600" />
              My Wishlist ({items.length} {items.length === 1 ? "item" : "items"})
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Items you've saved for later. Add them to your cart when you're ready to purchase.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Category filter */}
            {categories.length > 1 && (
              <div className="relative">
                <select
                  className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={selectedCategory || ""}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            )}

            {/* Sort options */}
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="default">Sort by: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wishlist items grid with improved cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all group"
          >
            <div className="relative aspect-square overflow-hidden">
              <Link href={`/products/${item.wishlistable.id}`}>
                <div className="absolute inset-0 bg-gray-100">
                  <Image
                    src={getFullImageUrl(item.wishlistable.image_url) || "/placeholder.svg"}
                    alt={item.wishlistable.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Quick actions overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="bg-white rounded-lg shadow-lg p-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-xs font-medium text-gray-600 px-2">Quick View</span>
                  </div>
                </div>
              </Link>

              {/* Category tag */}
              {item.wishlistable.category && (
                <div className="absolute top-3 left-3">
                  <span className="inline-block bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 px-2 py-1 rounded-md shadow-sm">
                    {typeof item.wishlistable.category === "string" ? item.wishlistable.category : "Uncategorized"}
                  </span>
                </div>
              )}

              {/* Remove button */}
              <button
                onClick={() => removeFromWishlist(item.id)}
                className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-red-50 transition-colors"
                aria-label="Remove from wishlist"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </button>
            </div>

            <div className="p-4 sm:p-5">
              <Link
                href={`/products/${item.wishlistable.id}`}
                className="block group-hover:text-teal-600 transition-colors"
              >
                <h3 className="font-medium text-gray-800 mb-1 line-clamp-1">{item.wishlistable.name}</h3>
              </Link>

              <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{item.wishlistable.description}</p>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-900 text-lg">${item.wishlistable.price}</span>
                  
                </div>

                <button
                  onClick={() => handleAddToCart(item)}
                  disabled={isAddingToCart[item.id] || item.wishlistable.stock_quantity === 0}
                  className={`flex items-center justify-center px-3 py-2 rounded-lg transition-all ${
                    item.wishlistable.stock_quantity === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : isAddingToCart[item.id]
                        ? "bg-teal-600 text-white"
                        : "bg-teal-100 text-teal-600 hover:bg-teal-600 hover:text-white"
                  }`}
                  aria-label="Add to cart"
                >
                  {isAddingToCart[item.id] ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-1.5" />
                      Add to Cart
                    </>
                  )}
                </button>
              </div>

              {/* Stock indicator */}
              {item.wishlistable.stock_quantity <= 5 && item.wishlistable.stock_quantity > 0 && (
                <div className="mt-3 text-xs text-orange-600 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Only {item.wishlistable.stock_quantity} left in stock
                </div>
              )}
              {item.wishlistable.stock_quantity === 0 && (
                <div className="mt-3 text-xs text-red-600 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Out of stock
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state for filtered results */}
      {items.length > 0 && filteredItems.length === 0 && (
        <div className="py-8 text-center bg-gray-50 rounded-xl mt-6">
          <div className="bg-white inline-flex rounded-full p-3 mb-3 shadow-sm">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No matching items</h3>
          <p className="text-gray-500 mb-4 max-w-md mx-auto">
            No items match your current filter selection. Try changing your filters or viewing all items.
          </p>
          <button
            onClick={() => {
              setSelectedCategory(null)
              setSortOption("default")
            }}
            className="inline-flex items-center bg-teal-600 text-white px-5 py-2.5 rounded-lg hover:bg-teal-700 transition-colors shadow-md text-sm"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}
