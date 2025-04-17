"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"
import { Loader2, CheckCircle, XCircle, ArrowLeft, Mail } from "lucide-react"
import { verifyEmail, resendVerificationEmail } from "../lib/api/Auth"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isVerified, setIsVerified] = useState<boolean | null>(null)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    const token = searchParams.get("token")
    const status = searchParams.get("status")

    // If status is pending, show the pending verification page
    if (status === "pending") {
      setIsLoading(false)
      return
    }

    if (!token) {
      setIsLoading(false)
      setIsVerified(false)
      toast.error("Invalid verification link")
      return
    }

    const verifyUserEmail = async () => {
      try {
        await verifyEmail({ token })
        setIsVerified(true)
        toast.success("Email verified successfully")
      } catch (error: any) {
        setIsVerified(false)
        toast.error(error.message || "Failed to verify email")
      } finally {
        setIsLoading(false)
      }
    }

    verifyUserEmail()
  }, [searchParams])

  const handleResendVerification = async () => {
    setIsResending(true)
    try {
      // Get email from localStorage
      const email = localStorage.getItem("pendingVerificationEmail")

      if (!email) {
        toast.error("Please login to resend verification email")
        router.push("/login")
        return
      }

      await resendVerificationEmail({ email })
      toast.success("Verification email sent")
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification email")
    } finally {
      setIsResending(false)
    }
  }

  // If status is pending, show the pending verification page
  if (searchParams.get("status") === "pending") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 text-teal-600 mb-4">
                  <Mail className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
                <p className="text-gray-600 mt-1">
                  We've sent a verification link to your email address. Please check your inbox and click the link to
                  verify your account.
                </p>
              </div>

              <div className="text-center">
                <p className="text-gray-600 mb-6">
                  Didn't receive the email? Check your spam folder or click the button below to resend the verification
                  email.
                </p>
                <button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="bg-teal-600 text-white py-2.5 px-4 rounded-lg hover:bg-teal-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 inline animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Resend Verification Email"
                  )}
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-center text-gray-600">
                  <Link
                    href="/login"
                    className="text-teal-600 hover:text-teal-500 font-medium inline-flex items-center"
                  >
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

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 text-teal-600 mx-auto animate-spin" />
                <p className="text-gray-600 mt-4">Verifying your email...</p>
              </div>
            ) : isVerified ? (
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900">Email Verified</h1>
                <p className="text-gray-600 mt-2 mb-6">Your email has been successfully verified.</p>
                <Link
                  href="/login"
                  className="bg-teal-600 text-white py-2.5 px-4 rounded-lg hover:bg-teal-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 inline-block"
                >
                  Continue to Login
                </Link>
              </div>
            ) : (
              <div className="text-center">
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900">Verification Failed</h1>
                <p className="text-gray-600 mt-2 mb-6">
                  The verification link is invalid or has expired. Please request a new verification email.
                </p>
                <button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="bg-teal-600 text-white py-2.5 px-4 rounded-lg hover:bg-teal-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 inline-block"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 inline animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Resend Verification Email"
                  )}
                </button>
              </div>
            )}

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
