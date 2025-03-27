import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "./components/Header"
import PromoBanner from "./components/Promo-banner-enhancemants"
import { Toaster } from "react-hot-toast"
import AuthProvider from "./providers/AuthProvider"
import CartProvider from "./providers/CartProvider"
import WishlistProvider from "./providers/WishlistProvider"
import { ChevronRight } from "lucide-react"
import Script from "next/script"
import AuthStatusMonitor from "./components/auth-status-monitor"

const inter = Inter({ subsets: ["latin"], display: "swap" })

export const metadata: Metadata = {
  title: "Zimbabwe Groceries | Authentic Zimbabwean Food Delivered Worldwide",
  description: "Shop authentic Zimbabwean groceries and have them delivered to your loved ones anywhere in the world.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        {/* Add reCAPTCHA script here */}
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
          strategy="afterInteractive"
        />
      </head>
      <body className={inter.className}>
      <AuthStatusMonitor />
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Toaster
                position="top-center"
                toastOptions={{
                  style: {
                    background: "#0f766e",
                    color: "#fff",
                    borderRadius: "8px",
                    padding: "16px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  },
                  success: {
                    iconTheme: {
                      primary: "#ffffff",
                      secondary: "#0f766e",
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: "#ffffff",
                      secondary: "#ef4444",
                    },
                  },
                }}
              />
              <PromoBanner />
              <Header />
              <main className="min-h-[calc(100vh-180px)]">{children}</main>
              <footer className="bg-gradient-to-r from-zimbabwe-green to-zimbabwe-black text-white pt-10 sm:pt-16 pb-8">
                <div className="container mx-auto px-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    <div>
                      <h3 className="font-bold text-xl mb-4 sm:mb-6 text-gradient">Zimbabwe Groceries</h3>
                      <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
                        Authentic Zimbabwean flavors, delivered with care. Connecting you to home, no matter where you
                        are!
                      </p>
                      <div className="flex space-x-3 sm:space-x-4">
                        <a
                          href="#"
                          className="bg-gray-800 hover:bg-zimbabwe-yellow hover:text-zimbabwe-black h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center transition-colors"
                        >
                          <i className="fab fa-facebook-f text-sm sm:text-base"></i>
                        </a>
                        <a
                          href="#"
                          className="bg-gray-800 hover:bg-zimbabwe-yellow hover:text-zimbabwe-black h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center transition-colors"
                        >
                          <i className="fab fa-twitter text-sm sm:text-base"></i>
                        </a>
                        <a
                          href="#"
                          className="bg-gray-800 hover:bg-zimbabwe-yellow hover:text-zimbabwe-black h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center transition-colors"
                        >
                          <i className="fab fa-instagram text-sm sm:text-base"></i>
                        </a>
                        <a
                          href="#"
                          className="bg-gray-800 hover:bg-zimbabwe-yellow hover:text-zimbabwe-black h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center transition-colors"
                        >
                          <i className="fab fa-pinterest text-sm sm:text-base"></i>
                        </a>
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <h3 className="font-bold text-lg mb-3 sm:mb-6">Shop</h3>
                      <ul className="space-y-2 sm:space-y-3">
                        <li>
                          <a
                            href="/products"
                            className="text-gray-300 hover:text-zimbabwe-yellow transition-colors flex items-center text-sm sm:text-base"
                          >
                            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            All Products
                          </a>
                        </li>
                        <li>
                          <a
                            href="/categories"
                            className="text-gray-300 hover:text-zimbabwe-yellow transition-colors flex items-center text-sm sm:text-base"
                          >
                            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Categories
                          </a>
                        </li>
                        <li>
                          <a
                            href="/hampers"
                            className="text-gray-300 hover:text-zimbabwe-yellow transition-colors flex items-center text-sm sm:text-base"
                          >
                            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Hampers
                          </a>
                        </li>
                        <li>
                          <a
                            href="/wishlist"
                            className="text-gray-300 hover:text-zimbabwe-yellow transition-colors flex items-center text-sm sm:text-base"
                          >
                            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Wishlist
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <h3 className="font-bold text-lg mb-3 sm:mb-6">Customer Service</h3>
                      <ul className="space-y-2 sm:space-y-3">
                        <li>
                          <a
                            href="/contact"
                            className="text-gray-300 hover:text-zimbabwe-yellow transition-colors flex items-center text-sm sm:text-base"
                          >
                            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Contact Us
                          </a>
                        </li>
                        <li>
                          <a
                            href="/shipping"
                            className="text-gray-300 hover:text-zimbabwe-yellow transition-colors flex items-center text-sm sm:text-base"
                          >
                            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Shipping Information
                          </a>
                        </li>
                        <li>
                          <a
                            href="/returns"
                            className="text-gray-300 hover:text-zimbabwe-yellow transition-colors flex items-center text-sm sm:text-base"
                          >
                            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Returns & Refunds
                          </a>
                        </li>
                        <li>
                          <a
                            href="/faq"
                            className="text-gray-300 hover:text-zimbabwe-yellow transition-colors flex items-center text-sm:text-base"
                          >
                            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            FAQ
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="fancy-divider mb-6 sm:mb-8"></div>

                  <div className="flex flex-col sm:flex-row justify-between items-center">
                    <p className="text-gray-400 text-sm sm:text-base text-center sm:text-left">
                      © {new Date().getFullYear()} Zimbabwe Groceries. All rights reserved.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-4 sm:mt-0">
                      <a
                        href="#"
                        className="text-gray-400 hover:text-zimbabwe-yellow transition-colors text-sm sm:text-base"
                      >
                        Privacy Policy
                      </a>
                      <a
                        href="#"
                        className="text-gray-400 hover:text-zimbabwe-yellow transition-colors text-sm sm:text-base"
                      >
                        Terms of Service
                      </a>
                      <a
                        href="#"
                        className="text-gray-400 hover:text-zimbabwe-yellow transition-colors text-sm:text-base"
                      >
                        Shipping Policy
                      </a>
                    </div>
                  </div>
                </div>
              </footer>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

