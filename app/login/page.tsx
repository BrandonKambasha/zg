"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { login as loginUser } from "../lib/api/Auth"
import { useAuth } from "../hooks/useAuth"
import toast from "react-hot-toast"
import { Loader2, Mail, Lock, LogIn, ArrowRight } from "lucide-react"

// Define the window interface to include the recaptcha property
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const recaptchaLoaded = useRef(false)

  // Your reCAPTCHA site key
  const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "your-site-key-here"

  useEffect(() => {
    // Load reCAPTCHA script
    if (!recaptchaLoaded.current) {
      const script = document.createElement("script")
      script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`
      script.async = true
      script.defer = true
      document.head.appendChild(script)
      recaptchaLoaded.current = true
    }
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const executeRecaptcha = async (): Promise<string> => {
    try {
      return await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: "login" })
    } catch (error) {
      console.error("reCAPTCHA execution failed:", error)
      throw new Error("Failed to execute reCAPTCHA. Please try again.")
    }
  }

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    try {
      // Execute reCAPTCHA and get token
      await new Promise<void>((resolve) => window.grecaptcha.ready(() => resolve()))
      const recaptchaToken = await executeRecaptcha()

      // Add the reCAPTCHA token to the login data
      const response = await loginUser({
        ...data,
        recaptchaToken,
      })

      if (response.access_token) {
        // Check if email is verified
        if (response.user && !response.user.email_verified_at) {
          // Store email for resend verification
          localStorage.setItem("pendingVerificationEmail", data.email)

          toast.error("Please verify your email before logging in")
          router.push("/verify-email/status")
          return
        }

        login(response.access_token, response.user)
        toast.success("Login successful!")
        router.push("/account")
      }
    } catch (error: any) {
      // Check if the error is due to unverified email
      if (error.message?.toLowerCase().includes("verify your email")) {
        localStorage.setItem("pendingVerificationEmail", data.email)
        router.push("/verify-email/status")
      } else {
        toast.error(error.message || "Login failed")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 text-teal-600 mb-4">
                <LogIn className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
              <p className="text-gray-600 mt-1">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    className={`w-full pl-10 pr-3 py-2.5 border ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors`}
                    placeholder="your.email@example.com"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-sm text-teal-600 hover:text-teal-500">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    {...register("password")}
                    className={`w-full pl-10 pr-3 py-2.5 border ${
                      errors.password ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-600 text-white py-2.5 rounded-lg hover:bg-teal-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-70 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-600">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-teal-600 hover:text-teal-500 font-medium inline-flex items-center"
                >
                  Create an account
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
