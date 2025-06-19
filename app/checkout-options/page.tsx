"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../hooks/useAuth"
import { useCart } from "../hooks/useCart"
import Link from "next/link"

export default function CheckoutOptionsPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const { items } = useCart()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // If the user is authenticated, redirect to the regular checkout
    if (isClient && isAuthenticated && !isLoading) {
      router.push("/checkout")
    }

    // If cart is empty, redirect to products
    if (isClient && items.length === 0) {
      router.push("/products")
    }
  }, [isAuthenticated, isLoading, router, isClient, items])

  // Show loading state while checking authentication
  if (isLoading || !isClient) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading checkout options...</p>
        </div>
      </div>
    )
  }

  // If authenticated, this will not render as the useEffect will redirect
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <h1 className="text-3xl font-bold text-center mb-8">Checkout Options</h1>

      <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Guest Checkout Option */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:border-green-500 transition-all">
          <h2 className="text-2xl font-semibold mb-4">Guest Checkout</h2>
          <p className="text-gray-600 mb-6">Continue as a guest without creating an account. Fast and simple.</p>
          <ul className="mb-6 space-y-2">
            <li className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-500 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              No account required
            </li>
            <li className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-500 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Quick checkout process
            </li>
            <li className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-500 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Track order with email and order number
            </li>
          </ul>
          <Link
            href="/guest-checkout"
            className="w-full block text-center bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
          >
            Continue as Guest
          </Link>
        </div>

        {/* Login/Signup Option */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:border-green-500 transition-all">
          <h2 className="text-2xl font-semibold mb-4">Sign In</h2>
          <p className="text-gray-600 mb-6">Sign in or create an account to enjoy member benefits.</p>
          <ul className="mb-6 space-y-2">
            <li className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-500 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Save your delivery details
            </li>
            <li className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-500 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              View order history
            </li>
            <li className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-500 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Faster checkout next time
            </li>
          </ul>
          <div className="space-y-3">
            <Link
              href="/login?redirect=/checkout"
              className="w-full block text-center bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register?redirect=/checkout"
              className="w-full block text-center border border-green-600 text-green-600 hover:bg-green-50 font-medium py-3 px-4 rounded-md transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
