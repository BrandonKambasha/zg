"use client"

import { useState, useEffect, Suspense } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"
import { Loader2, Lock, ArrowLeft } from "lucide-react"
import { resetPassword } from "../lib/api/Auth"

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ["password_confirmation"],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

// Create a client component that uses useSearchParams
function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      password_confirmation: "",
    },
  })

  useEffect(() => {
    const token = searchParams.get("token")
    const email = searchParams.get("email")

    if (!token || !email) {
      setIsTokenValid(false)
      toast.error("Invalid password reset link")
      return
    }

    setToken(token)
    setEmail(email)
    setIsTokenValid(true)
  }, [searchParams])

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token || !email) {
      toast.error("Invalid password reset link")
      return
    }

    setIsLoading(true)
    try {
      await resetPassword({
        token,
        email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      })

      toast.success("Password reset successfully")
      router.push("/login")
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password")
    } finally {
      setIsLoading(false)
    }
  }

  if (isTokenValid === false) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
                  <Lock className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Invalid Reset Link</h1>
                <p className="text-gray-600 mt-1">
                  The password reset link is invalid or has expired. Please request a new one.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-center text-gray-600">
                  <Link
                    href="/forgot-password"
                    className="bg-teal-600 text-white py-2.5 px-4 rounded-lg hover:bg-teal-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 inline-block w-full text-center"
                  >
                    Request New Reset Link
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 text-teal-600 mb-4">
                <Lock className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
              <p className="text-gray-600 mt-1">Enter your new password below</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
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

              <div>
                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password_confirmation"
                    type="password"
                    {...register("password_confirmation")}
                    className={`w-full pl-10 pr-3 py-2.5 border ${
                      errors.password_confirmation ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password_confirmation && (
                  <p className="text-red-500 text-sm mt-1">{errors.password_confirmation.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-600 text-white py-2.5 rounded-lg hover:bg-teal-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-70 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-600">
                <Link href="/login" className="text-teal-600 hover:text-teal-500 font-medium inline-flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main page component with Suspense boundary
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm />
    </Suspense>
  )
}

// Loading component
function ResetPasswordLoading() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
