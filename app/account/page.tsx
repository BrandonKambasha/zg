"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../hooks/useAuth"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import {
  User,
  Package,
  CreditCard,
  Heart,
  Settings,
  LogOut,
  AlertTriangle,
  Eye,
  ShoppingCart,
  Trash2,
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
      zim_name:"",
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

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Your Account</h1>
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors self-start"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      </div>

      {/* Custom Tabs - Scrollable on mobile */}
      <div className="border-b border-gray-200 mb-6 overflow-x-auto pb-1">
        <nav className="flex min-w-max">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center py-3 px-4 sm:py-4 sm:px-6 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
              activeTab === "profile"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <User className="w-4 h-4 mr-1 sm:mr-2" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center py-3 px-4 sm:py-4 sm:px-6 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
              activeTab === "orders"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Package className="w-4 h-4 mr-1 sm:mr-2" />
            Orders
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`flex items-center py-3 px-4 sm:py-4 sm:px-6 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
              activeTab === "payments"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <CreditCard className="w-4 h-4 mr-1 sm:mr-2" />
            Payments
          </button>
          <button
            onClick={() => setActiveTab("wishlist")}
            className={`flex items-center py-3 px-4 sm:py-4 sm:px-6 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
              activeTab === "wishlist"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Heart className="w-4 h-4 mr-1 sm:mr-2" />
            Wishlist
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center py-3 px-4 sm:py-4 sm:px-6 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
              activeTab === "settings"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Settings className="w-4 h-4 mr-1 sm:mr-2" />
            Settings
          </button>
          {user.role === "admin" && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`flex items-center py-3 px-4 sm:py-4 sm:px-6 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === "admin"
                  ? "border-teal-600 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Settings className="w-4 h-4 mr-1 sm:mr-2" />
              Admin
            </button>
          )}
        </nav>
      </div>

      {/* Profile Tab Content */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-medium">Profile Information</h2>
            <p className="text-sm text-gray-500">Update your personal details here.</p>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register("name")}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                    disabled
                  />
                  <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label htmlFor="phone_number" className="block text-sm font-medium mb-1">
                    Phone Number
                  </label>
                  <input
                    id="phone_number"
                    type="text"
                    {...register("phone_number")}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label htmlFor="zim_contact" className="block text-sm font-medium mb-1">
                    Zimbabwe Contact Phone Number
                  </label>
                  <input
                    id="zim_contact"
                    type="text"
                    {...register("zim_contact")}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label htmlFor="zim_name" className="block text-sm font-medium mb-1">
                    Zimbabwe Contact Name
                  </label>
                  <input
                    id="zim_name"
                    type="text"
                    {...register("zim_name")}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label htmlFor="house_number" className="block text-sm font-medium mb-1">
                    House Number
                  </label>
                  <input
                    id="house_number"
                    type="text"
                    {...register("house_number")}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label htmlFor="street" className="block text-sm font-medium mb-1">
                    Street
                  </label>
                  <input
                    id="street"
                    type="text"
                    {...register("street")}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium mb-1">
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    {...register("location")}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium mb-1">
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    {...register("city")}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium mb-1">
                    Country
                  </label>
                  <input
                    id="country"
                    type="text"
                    {...register("country")}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition disabled:opacity-70"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Orders Tab Content */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-medium">Order History</h2>
            <p className="text-sm text-gray-500">View and manage your recent orders.</p>
          </div>
          <div className="p-6">
            <OrderHistory orders={orders} isLoading={ordersLoading} />
          </div>
        </div>
      )}

      {/* Payments Tab Content */}
      {activeTab === "payments" && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-medium">Payment Methods</h2>
            <p className="text-sm text-gray-500">Manage your payment options.</p>
          </div>
          <div className="p-6">
            <p>Your payment methods will be displayed here.</p>
          </div>
        </div>
      )}

      {/* Wishlist Tab Content */}
      {activeTab === "wishlist" && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-medium">Wishlist</h2>
            <p className="text-sm text-gray-500">Products you've saved for later.</p>
          </div>
          <div className="p-6">
            <WishlistItems />
          </div>
        </div>
      )}

      {/* Settings Tab Content */}
      {activeTab === "settings" && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-medium">Account Settings</h2>
            <p className="text-sm text-gray-500">Manage your account preferences.</p>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Password</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="current_password" className="block text-sm font-medium mb-1">
                      Current Password
                    </label>
                    <input
                      id="current_password"
                      type="password"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="new_password" className="block text-sm font-medium mb-1">
                      New Password
                    </label>
                    <input
                      id="new_password"
                      type="password"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm_password" className="block text-sm font-medium mb-1">
                      Confirm New Password
                    </label>
                    <input
                      id="confirm_password"
                      type="password"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
                <button className="mt-4 bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition text-sm">
                  Update Password
                </button>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium mb-4">Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <input
                      id="order_updates"
                      type="checkbox"
                      className="mt-1 h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      defaultChecked
                    />
                    <label htmlFor="order_updates" className="ml-2 block text-sm">
                      <span className="font-medium text-gray-700">Order updates</span>
                      <span className="text-gray-500 block">Receive notifications about your order status</span>
                    </label>
                  </div>
                  <div className="flex items-start">
                    <input
                      id="promotions"
                      type="checkbox"
                      className="mt-1 h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      defaultChecked
                    />
                    <label htmlFor="promotions" className="ml-2 block text-sm">
                      <span className="font-medium text-gray-700">Promotions and offers</span>
                      <span className="text-gray-500 block">Receive emails about new promotions and discounts</span>
                    </label>
                  </div>
                  <div className="flex items-start">
                    <input
                      id="newsletter"
                      type="checkbox"
                      className="mt-1 h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <label htmlFor="newsletter" className="ml-2 block text-sm">
                      <span className="font-medium text-gray-700">Newsletter</span>
                      <span className="text-gray-500 block">
                        Receive our weekly newsletter with new products and recipes
                      </span>
                    </label>
                  </div>
                </div>
                <button className="mt-4 bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition">
                  Save Preferences
                </button>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>

                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-white border border-red-600 text-red-600 px-6 py-2 rounded-md hover:bg-red-50 transition"
                  >
                    Delete Account
                  </button>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 sm:p-4">
                    <div className="flex items-center mb-3 sm:mb-4">
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
                      <h4 className="font-medium text-red-800 text-sm sm:text-base">Confirm Account Deletion</h4>
                    </div>

                    <p className="text-xs sm:text-sm text-red-800 mb-3 sm:mb-4">
                      This action cannot be undone. All your data, including orders and payment information, will be
                      permanently deleted.
                    </p>

                    <div className="mb-3 sm:mb-4">
                      <label
                        htmlFor="delete_password"
                        className="block text-xs sm:text-sm font-medium mb-1 text-red-800"
                      >
                        Enter your password to confirm
                      </label>
                      <input
                        id="delete_password"
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="w-full p-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Your current password"
                      />
                      {deleteError && <p className="text-red-600 text-xs sm:text-sm mt-1">{deleteError}</p>}
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="bg-red-600 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-red-700 transition disabled:opacity-70 text-sm"
                      >
                        {isDeleting ? "Deleting..." : "Confirm Deletion"}
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false)
                          setDeletePassword("")
                          setDeleteError("")
                        }}
                        className="bg-white border border-gray-300 text-gray-700 px-4 sm:px-6 py-2 rounded-md hover:bg-gray-50 transition text-sm"
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
      )}

      {/* Admin Tab Content */}
      {activeTab === "admin" && user.role === "admin" && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-medium">Admin Dashboard</h2>
            <p className="text-sm text-gray-500">Manage products, categories, and orders.</p>
          </div>
          <div className="p-6">
            <AdminPanel />
          </div>
        </div>
      )}
    </div>
  )
}

// Order History Component
function OrderHistory({ orders, isLoading }: { orders: Order[]; isLoading: boolean }) {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent"></div>
        <p className="mt-2 text-gray-500">Loading your orders...</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">You haven't placed any orders yet.</p>
        <button className="mt-4 bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition">
          Browse Products
        </button>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto -mx-6 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-3 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Order ID
              </th>
              <th
                scope="col"
                className="px-3 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-3 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Total
              </th>
              <th
                scope="col"
                className="px-3 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-3 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                  #{order.id}
                </td>
                <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                  ${order.total_amount}
                </td>
                <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : order.status === "shipped"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "processing"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                  <button
                    onClick={() => openOrderModal(order.id)}
                    className="text-teal-600 hover:text-teal-900 flex items-center transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Modal */}
      <OrderModal orderId={selectedOrderId} isOpen={isModalOpen} onClose={closeOrderModal} />
    </div>
  )
}

// Wishlist Items Component
function WishlistItems() {
  const { items, isLoading, removeFromWishlist } = useWishlist()
  const { addItem } = useCart()
  const [isAddingToCart, setIsAddingToCart] = useState<Record<number, boolean>>({})

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

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent"></div>
        <p className="mt-2 text-gray-500">Loading your wishlist...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="flex justify-center mb-4">
          <Heart className="h-16 w-16 text-gray-300" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-6">
          Add items to your wishlist by clicking the heart icon on products you love.
        </p>
        <Link
          href="/products"
          className="inline-block bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <div key={item.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="relative aspect-square">
            <Link href={`/products/${item.wishlistable.id}`}>
              <Image
                src={getFullImageUrl(item.wishlistable.image_url) || "/placeholder.svg"}
                alt={item.wishlistable.name}
                fill
                className="object-cover"
              />
            </Link>
            <button
              onClick={() => removeFromWishlist(item.id)}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </button>
          </div>

          <div className="p-4">
            <Link href={`/products/${item.wishlistable.id}`}>
              <h3 className="font-medium text-gray-800 mb-1 hover:text-teal-600 transition-colors">
                {item.wishlistable.name}
              </h3>
            </Link>

            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{item.wishlistable.description}</p>

            <div className="flex items-center justify-between">
              <span className="font-bold text-teal-600">${item.wishlistable.price}</span>

              <button
                onClick={() => handleAddToCart(item)}
                disabled={isAddingToCart[item.id] || item.wishlistable.stock_quantity === 0}
                className={`p-2 rounded-full transition-all transform hover:scale-110 ${
                  item.wishlistable.stock_quantity === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : isAddingToCart[item.id]
                      ? "bg-teal-600 text-white"
                      : "bg-teal-100 text-teal-600 hover:bg-teal-600 hover:text-white"
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

