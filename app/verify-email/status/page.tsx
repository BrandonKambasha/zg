"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"
import { Loader2, Mail, ArrowLeft } from "lucide-react"
import { resendVerificationEmail } from "../../lib/api/Auth"

export default function VerifyEmailStatusPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleResendVerification = async () => {
    setIsLoading(true)
    try {
      const email = localStorage.getItem("pendingVerificationEmail")

      if (!email) {
        toast.error("Email not found. Please login again.")
        router.push("/login")
        return
      }

      await resendVerificationEmail({ email })
      toast.success("Verification email sent")
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification email")
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
                disabled={isLoading}
                className="bg-teal-600 text-white py-2.5 px-4 rounded-lg hover:bg-teal-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                {isLoading ? (
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
