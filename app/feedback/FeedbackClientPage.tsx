"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../hooks/useAuth"
import { submitFeedback } from "../lib/api/feedback"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  AlertCircle,
  Loader2,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  ThumbsUp,
  HelpCircle,
  AlertTriangle,
  Home,
  User,
  Shield,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import toast from "react-hot-toast"
import Script from "next/script"

export default function FeedbackClientPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    type: "suggestion",
    subject: "",
    message: "",
    name: "",
    email: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState("")
  const [recaptchaError, setRecaptchaError] = useState("")

  // Animation variants
  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  const staggerContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  // Initialize form data with user info if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }))
    }
  }, [isAuthenticated, user])

  // Handle reCAPTCHA execution
  const executeRecaptcha = async () => {
    if (!window.grecaptcha) {
      setRecaptchaError("reCAPTCHA failed to load. Please refresh the page and try again.")
      return null
    }

    try {
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
      if (!siteKey) {
        setRecaptchaError("reCAPTCHA site key is missing. Please contact support.")
        return null
      }

      const token = await window.grecaptcha.execute(siteKey, { action: "feedback_submit" })
      setRecaptchaToken(token)
      return token
    } catch (error) {
      console.error("reCAPTCHA execution failed:", error)
      setRecaptchaError("Failed to verify you're not a robot. Please try again.")
      return null
    }
  }

  // Handle reCAPTCHA script load
  const handleRecaptchaLoad = () => {
    setRecaptchaLoaded(true)
    window.grecaptcha?.ready(() => {
      console.log("reCAPTCHA is ready")
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value }))

    // Clear error when user selects
    if (errors.type) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.type
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.type) {
      newErrors.type = "Please select a feedback type"
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required"
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required"
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters"
    }

    // Only validate name and email if user is not authenticated
    if (!isAuthenticated) {
      if (!formData.name.trim()) {
        newErrors.name = "Name is required"
      }

      if (!formData.email.trim()) {
        newErrors.email = "Email is required"
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Execute reCAPTCHA
    const token = await executeRecaptcha()
    if (!token) {
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare feedback data
      const feedbackData = {
        ...formData,
        // If user is authenticated, use their ID, otherwise send name and email
        user_id: isAuthenticated && user?.id ? String(user.id) : undefined,
        // Always include name and email in the request
        name: isAuthenticated && user ? user.name : formData.name,
        email: isAuthenticated && user ? user.email : formData.email,
        recaptchaToken: token,
      }

      console.log("Submitting feedback with data:", feedbackData)

      await submitFeedback(feedbackData)

      toast.success("Thank you for your feedback!")
      setSubmitted(true)

      // Reset form
      setFormData({
        type: "suggestion",
        subject: "",
        message: "",
        name: "",
        email: "",
      })

      // Redirect to home after a short delay
      setTimeout(() => {
        router.push("/")
      }, 3000)
    } catch (error: any) {
      console.error("Error submitting feedback:", error)
      toast.error(error.message || "Failed to submit feedback. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get icon based on feedback type
  const getFeedbackTypeIcon = (type: string) => {
    switch (type) {
      case "suggestion":
        return <ThumbsUp className="h-5 w-5" />
      case "complaint":
        return <AlertTriangle className="h-5 w-5" />
      case "question":
        return <HelpCircle className="h-5 w-5" />
      case "praise":
        return <CheckCircle className="h-5 w-5" />
      default:
        return <MessageSquare className="h-5 w-5" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 text-teal-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-6">
              Your feedback has been submitted successfully. We appreciate your input and will review it shortly.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center bg-teal-600 text-white hover:bg-teal-700 px-6 py-3 rounded-md font-medium transition-colors w-full"
            >
              Return to Home <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Load reCAPTCHA script */}
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
        onLoad={handleRecaptchaLoad}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-teal-600 to-teal-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
        </div>

        {/* Animated shapes */}
        <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-teal-400 opacity-20 animate-float"></div>
        <div className="absolute bottom-5 right-20 w-24 h-24 rounded-full bg-teal-300 opacity-10 animate-float-delay"></div>

        <div className="container mx-auto px-4 py-8 md:py-12 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-3 mx-auto"
            >
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
            </motion.div>

            <motion.h1
              className="text-2xl md:text-4xl font-bold mb-3"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Share Your Feedback
            </motion.h1>

            <motion.p
              className="text-base md:text-lg mb-4 text-teal-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              We value your opinion and would love to hear about your experience with Zimbabwe Groceries
            </motion.p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto -mt-8 relative z-10">
          <motion.div variants={fadeInUpVariants} initial="hidden" animate="visible">
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl text-gray-800">Feedback Form</CardTitle>
                <CardDescription>
                  Please fill out the form below to submit your feedback. We appreciate your input!
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {/* User Information Section - Only shown for non-authenticated users */}
                  {!isAuthenticated && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <h3 className="font-medium text-gray-700 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Your Information
                      </h3>

                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-700">
                          Name
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your full name"
                          className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700">
                          Email
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Your email address"
                          className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-gray-700">
                      Feedback Type
                    </Label>
                    <Select value={formData.type} onValueChange={handleSelectChange}>
                      <SelectTrigger id="type" className={errors.type ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select feedback type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="suggestion">
                          <div className="flex items-center gap-2">
                            <ThumbsUp className="h-4 w-4 text-teal-600" />
                            <span>Suggestion</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="complaint">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            <span>Complaint</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="question">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="h-4 w-4 text-blue-500" />
                            <span>Question</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="praise">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Praise</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="other">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-gray-500" />
                            <span>Other</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-gray-700">
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Brief description of your feedback"
                      className={errors.subject ? "border-red-500" : ""}
                    />
                    {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-gray-700">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Please provide details about your feedback"
                      rows={5}
                      className={errors.message ? "border-red-500" : ""}
                    />
                    {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                  </div>

                  {/* reCAPTCHA notice */}
                  <div className="text-xs text-gray-500 flex items-center">
                    <Shield className="h-3 w-3 mr-1 text-gray-400" />
                    This form is protected by reCAPTCHA to ensure you're not a robot.
                  </div>
                  {recaptchaError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{recaptchaError}</AlertDescription>
                    </Alert>
                  )}

                  {/* Show user info if authenticated */}
                  {isAuthenticated && user && (
                    <Alert className="bg-teal-50 border-teal-200">
                      <AlertTitle className="text-teal-800 flex items-center gap-2">
                        <User className="h-4 w-4" /> You are submitting as:
                      </AlertTitle>
                      <AlertDescription className="text-teal-700">
                        {user.name} ({user.email})
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !recaptchaLoaded}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-2 h-auto text-base shadow-md hover:shadow-lg transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Submitting...
                      </>
                    ) : !recaptchaLoaded ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Submit Feedback
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        </div>

        {/* Why We Value Your Feedback Section */}
        <motion.div
          className="max-w-3xl mx-auto mt-12"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Why We Value Your Feedback</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              variants={fadeInUpVariants}
            >
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Improving Our Service</h3>
              <p className="text-gray-600">
                Your feedback helps us identify areas where we can improve our products and services to better meet your
                needs.
              </p>
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              variants={fadeInUpVariants}
            >
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <ThumbsUp className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Building Relationships</h3>
              <p className="text-gray-600">
                We value our relationship with you and want to ensure your experience with Zimbabwe Groceries exceeds
                your expectations.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          className="max-w-3xl mx-auto mt-12 mb-8"
          variants={fadeInUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Frequently Asked Questions</h2>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800 flex items-center">
                  <HelpCircle className="h-5 w-5 mr-2 text-teal-600" />
                  How long will it take to get a response?
                </h3>
                <p className="text-gray-600 ml-7">
                  We aim to respond to all feedback within 24-48 hours during business days. For urgent matters, please
                  contact us directly.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800 flex items-center">
                  <HelpCircle className="h-5 w-5 mr-2 text-teal-600" />
                  Can I submit feedback anonymously?
                </h3>
                <p className="text-gray-600 ml-7">
                  While we require your name and email for communication purposes, we respect your privacy and will not
                  share your information.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Contact Section */}
      <section className="py-12 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2
              className="text-2xl font-bold mb-4 text-gray-800"
              variants={fadeInUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              Need More Help?
            </motion.h2>
            <motion.p
              className="text-gray-600 mb-6"
              variants={fadeInUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              Our customer service team is ready to assist you with any questions.
            </motion.p>
            <motion.div
              className="flex flex-wrap justify-center gap-4"
              variants={fadeInUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Link
                href="/contact"
                className="inline-flex items-center bg-teal-600 text-white hover:bg-teal-700 px-6 py-3 rounded-md font-medium transition-colors"
              >
                Contact Us <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center bg-white text-teal-600 border border-teal-600 hover:bg-teal-50 px-6 py-3 rounded-md font-medium transition-colors"
              >
                Return Home <Home className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delay {
          animation: float 8s ease-in-out 1s infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .bg-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  )
}
