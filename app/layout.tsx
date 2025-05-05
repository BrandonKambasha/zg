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
import SessionExpiredModal from "./components/SessionExpiredModal"
import { GoogleTagManager } from "@next/third-parties/google"
import StructuredData from "./components/StructuredData"

export const metadata: Metadata = {
  title: "ZimGroceries | Authentic Zimbabwean Food Delivered To Loved Ones Back Home",
  description:
    "Shop authentic Zimbabwean groceries and have them delivered to your loved ones back home. ZimGroceries is your trusted source for Zimbabwe groceries.",
}

const inter = Inter({ subsets: ["latin"], display: "swap" })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <GoogleTagManager gtmId="G-93D5E686RR" />
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        {/* Add reCAPTCHA script here */}
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
          strategy="afterInteractive"
        />
        <StructuredData />
      </head>
      <body className={inter.className}>
        {/* Add SessionExpiredModal outside of AuthProvider to ensure it works even when logged out */}
        <SessionExpiredModal />
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
              <footer className="bg-gradient-to-r from-zimbabwe-green to-zimbabwe-black text-white pt-8 pb-6">
                <div className="container mx-auto px-4">
                  {/* Mobile Footer */}
                  <div className="lg:hidden">
                    {/* Company Info and Social Icons */}
                    <div className="mb-6 text-center">
                      <h3 className="font-bold text-xl mb-2 text-gradient">Zimbabwe Groceries</h3>
                      <p className="text-gray-300 mb-3 text-sm px-6">
                        Authentic Zimbabwean flavors, delivered with care.
                      </p>
                      <div className="flex justify-center space-x-4 mb-4">
                        <a
                          href="#"
                          className="bg-gray-800 hover:bg-zimbabwe-yellow hover:text-zimbabwe-black h-8 w-8 rounded-full flex items-center justify-center transition-colors"
                        >
                          <i className="fab fa-facebook-f text-sm"></i>
                        </a>
                        <a
                          href="#"
                          className="bg-gray-800 hover:bg-zimbabwe-yellow hover:text-zimbabwe-black h-8 w-8 rounded-full flex items-center justify-center transition-colors"
                        >
                          <i className="fab fa-twitter text-sm"></i>
                        </a>
                        <a
                          href="#"
                          className="bg-gray-800 hover:bg-zimbabwe-yellow hover:text-zimbabwe-black h-8 w-8 rounded-full flex items-center justify-center transition-colors"
                        >
                          <i className="fab fa-instagram text-sm"></i>
                        </a>
                        <a
                          href="#"
                          className="bg-gray-800 hover:bg-zimbabwe-yellow hover:text-zimbabwe-black h-8 w-8 rounded-full flex items-center justify-center transition-colors"
                        >
                          <i className="fab fa-pinterest text-sm"></i>
                        </a>
                      </div>
                    </div>

                    {/* Mobile Accordion Links */}
                    <div className="mb-4">
                      <details className="group border-b border-gray-700 pb-2">
                        <summary className="flex justify-between items-center font-medium cursor-pointer list-none py-2">
                          <h3 className="font-bold text-base">Shop</h3>
                          <span className="transition group-open:rotate-180">
                            <svg
                              fill="none"
                              height="24"
                              shapeRendering="geometricPrecision"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              viewBox="0 0 24 24"
                              width="24"
                            >
                              <path d="M6 9l6 6 6-6"></path>
                            </svg>
                          </span>
                        </summary>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <a href="/products" className="text-gray-300 hover:text-zimbabwe-yellow text-sm py-1">
                            All Products
                          </a>
                          <a href="/categories" className="text-gray-300 hover:text-zimbabwe-yellow text-sm py-1">
                            Categories
                          </a>
                          <a href="/hampers" className="text-gray-300 hover:text-zimbabwe-yellow text-sm py-1">
                            Hampers
                          </a>
                          <a href="/wishlist" className="text-gray-300 hover:text-zimbabwe-yellow text-sm py-1">
                            Wishlist
                          </a>
                        </div>
                      </details>

                      <details className="group border-b border-gray-700 pb-2">
                        <summary className="flex justify-between items-center font-medium cursor-pointer list-none py-2">
                          <h3 className="font-bold text-base">Customer Service</h3>
                          <span className="transition group-open:rotate-180">
                            <svg
                              fill="none"
                              height="24"
                              shapeRendering="geometricPrecision"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              viewBox="0 0 24 24"
                              width="24"
                            >
                              <path d="M6 9l6 6 6-6"></path>
                            </svg>
                          </span>
                        </summary>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <a href="/contact" className="text-gray-300 hover:text-zimbabwe-yellow text-sm py-1">
                            Contact Us
                          </a>
                          <a href="/shipping" className="text-gray-300 hover:text-zimbabwe-yellow text-sm py-1">
                            Shipping Info
                          </a>
                          <a href="/returns" className="text-gray-300 hover:text-zimbabwe-yellow text-sm py-1">
                            Returns & Refunds
                          </a>
                          <a href="/faq" className="text-gray-300 hover:text-zimbabwe-yellow text-sm py-1">
                            FAQ
                          </a>
                        </div>
                      </details>
                    </div>

                    {/* Mobile Legal Links */}
                    <div className="flex justify-center gap-4 text-xs text-gray-400 mb-4">
                      <a href="#" className="hover:text-zimbabwe-yellow">
                        Privacy
                      </a>
                      <span>|</span>
                      <a href="#" className="hover:text-zimbabwe-yellow">
                        Terms
                      </a>
                      <span>|</span>
                      <a href="#" className="hover:text-zimbabwe-yellow">
                        Shipping
                      </a>
                    </div>

                    <p className="text-gray-400 text-xs text-center">
                      © {new Date().getFullYear()} Zimbabwe Groceries. All rights reserved.
                    </p>
                  </div>

                  {/* Desktop Footer */}
                  <div className="hidden lg:block">
                    <div className="grid grid-cols-4 gap-8 mb-12">
                      <div>
                        <h3 className="font-bold text-xl mb-6 text-gradient">Zimbabwe Groceries</h3>
                        <p className="text-gray-300 mb-6">
                          Authentic Zimbabwean flavors, delivered with care. Connecting you to home, no matter where you
                          are!
                        </p>
                        <div className="flex space-x-4">
                          <a
                            href="#"
                            className="bg-gray-800 hover:bg-zimbabwe-yellow hover:text-zimbabwe-black h-10 w-10 rounded-full flex items-center justify-center transition-colors"
                          >
                            <i className="fab fa-facebook-f"></i>
                          </a>
                          <a
                            href="#"
                            className="bg-gray-800 hover:bg-zimbabwe-yellow hover:text-zimbabwe-black h-10 w-10 rounded-full flex items-center justify-center transition-colors"
                          >
                            <i className="fab fa-twitter"></i>
                          </a>
                          <a
                            href="#"
                            className="bg-gray-800 hover:bg-zimbabwe-yellow hover:text-zimbabwe-black h-10 w-10 rounded-full flex items-center justify-center transition-colors"
                          >
                            <i className="fab fa-instagram"></i>
                          </a>
                          <a
                            href="#"
                            className="bg-gray-800 hover:bg-zimbabwe-yellow hover:text-zimbabwe-black h-10 w-10 rounded-full flex items-center justify-center transition-colors"
                          >
                            <i className="fab fa-pinterest"></i>
                          </a>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-6">Shop</h3>
                        <ul className="space-y-3">
                          <li>
                            <a
                              href="/products"
                              className="text-gray-300 hover:text-zimbabwe-yellow transition-colors flex items-center"
                            >
                              <ChevronRight className="h-4 w-4 mr-2" />
                              All Products
                            </a>
                          </li>
                          <li>
                            <a
                              href="/categories"
                              className="text-gray-300 hover:text-zimbabwe-yellow transition-colors flex items-center"
                            >
                              <ChevronRight className="h-4 w-4 mr-2" />
                              Categories
                            </a>
                          </li>
                          <li>
                            <a
                              href="/hampers"
                              className="text-gray-300 hover:text-zimbabwe-yellow transition-colors flex items-center"
                            >
                              <ChevronRight className="h-4 w-4 mr-2" />
                              Hampers
                            </a>
                          </li>
                          <li>
                            <a
                              href="/wishlist"
                              className="text-gray-300 hover:text-zimbabwe-yellow transition-colors flex items-center"
                            >
                              <ChevronRight className="h-4 w-4 mr-2" />
                              Wishlist
                            </a>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-6">Customer Service</h3>
                        <ul className="space-y-3">
                          <li>
                            <a
                              href="/contact"
                              className="text-gray-300 hover:text-zimbabwe-yellow transition-colors flex items-center"
                            >
                              <ChevronRight className="h-4 w-4 mr-2" />
                              Contact Us
                            </a>
                          </li>
                          <li>
                            <a
                              href="/shipping"
                              className="text-gray-300 hover:text-zimbabwe-yellow transition-colors flex items-center"
                            >
                              <ChevronRight className="h-4 w-4 mr-2" />
                              Shipping Information
                            </a>
                          </li>
                          <li>
                            <a
                              href="/returns"
                              className="text-gray-300 hover:text-zimbabwe-yellow transition-colors flex items-center"
                            >
                              <ChevronRight className="h-4 w-4 mr-2" />
                              Returns & Refunds
                            </a>
                          </li>
                          <li>
                            <a
                              href="/faq"
                              className="text-gray-300 hover:text-zimbabwe-yellow transition-colors flex items-center"
                            >
                              <ChevronRight className="h-4 w-4 mr-2" />
                              FAQ
                            </a>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-6">Newsletter</h3>
                        <p className="text-gray-300 mb-4">
                          Subscribe to receive updates, access to exclusive deals, and more.
                        </p>
                        <div className="flex">
                          <input
                            type="email"
                            placeholder="Your email"
                            className="bg-gray-800 text-white px-4 py-2 rounded-l-md w-full focus:outline-none focus:ring-1 focus:ring-zimbabwe-yellow"
                          />
                          <button className="bg-zimbabwe-yellow text-zimbabwe-black px-4 py-2 rounded-r-md hover:bg-yellow-400 transition-colors">
                            Subscribe
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="fancy-divider mb-8"></div>

                    <div className="flex justify-between items-center">
                      <p className="text-gray-400">
                        © {new Date().getFullYear()} Zimbabwe Groceries. All rights reserved.
                      </p>
                      <div className="flex gap-6">
                        <a href="#" className="text-gray-400 hover:text-zimbabwe-yellow transition-colors">
                          Privacy Policy
                        </a>
                        <a href="#" className="text-gray-400 hover:text-zimbabwe-yellow transition-colors">
                          Terms of Service
                        </a>
                        <a href="#" className="text-gray-400 hover:text-zimbabwe-yellow transition-colors">
                          Shipping Policy
                        </a>
                      </div>
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
