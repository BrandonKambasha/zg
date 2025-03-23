"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Mail, Clock, ChevronDown, Send, MessageSquare, HelpCircle } from "lucide-react"
import { subscribeToNewsletter } from "../lib/api/Newsletter"

// Define the window interface to include the recaptcha property
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

export default function ContactPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const recaptchaLoaded = useRef(false)

  // Newsletter states
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscribeSuccess, setSubscribeSuccess] = useState(false)
  const [subscribeError, setSubscribeError] = useState("")

  // Your reCAPTCHA site key
  const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "your-site-key-here"

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    // Load reCAPTCHA script
    if (!recaptchaLoaded.current) {
      const script = document.createElement("script")
      script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`
      script.async = true
      script.defer = true
      document.head.appendChild(script)
      recaptchaLoaded.current = true
    }

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const faqs = [
    {
      question: "How long does delivery take?",
      answer:
        "Delivery typically takes 24-48 hours in major cities across Zimbabwe. For remote areas, it may take 2-3 days. You'll receive tracking information once your order is dispatched.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards, PayPal, and mobile money transfers. All payments are processed securely through our encrypted payment gateway.",
    },
    {
      question: "Can I specify delivery instructions?",
      answer:
        "Yes, during checkout you can add specific delivery instructions for the recipient, including preferred delivery times and contact preferences.",
    },
    {
      question: "What if items are out of stock?",
      answer:
        "If an item is out of stock, we'll contact you to offer suitable alternatives or provide a refund for that specific item.",
    },
    {
      question: "Can I track my order?",
      answer:
        "Yes, once your order is dispatched, you'll receive a tracking number via email that allows you to monitor the delivery status in real-time.",
    },
    {
      question: "Do you deliver to all areas in Zimbabwe?",
      answer:
        "We deliver to all major cities and most rural areas in Zimbabwe. If you're unsure about delivery to a specific location, please contact our customer service team.",
    },
    {
      question: "How do I create an account?",
      answer:
        "You can create an account by clicking the 'Register' button in the top right corner of our website. You'll need to provide your email, create a password, and fill in some basic information.",
    },
    {
      question: "What happens if items are damaged during delivery?",
      answer:
        "We have a satisfaction guarantee. If any items arrive damaged, please take a photo and contact us within 24 hours of delivery, and we'll arrange a replacement or refund.",
    },
  ]

  const toggleFaq = (index: number) => {
    if (activeFaq === index) {
      setActiveFaq(null)
    } else {
      setActiveFaq(index)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const executeRecaptcha = async (): Promise<string> => {
    try {
      return await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: "contact_form" })
    } catch (error) {
      console.error("reCAPTCHA execution failed:", error)
      throw new Error("Failed to execute reCAPTCHA. Please try again.")
    }
  }

  const executeRecaptchaForNewsletter = async (): Promise<string> => {
    try {
      return await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: "newsletter_subscribe" })
    } catch (error) {
      console.error("reCAPTCHA execution failed:", error)
      throw new Error("Failed to execute reCAPTCHA. Please try again.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError("")

    try {
      // Execute reCAPTCHA and get token
      await new Promise<void>((resolve) => window.grecaptcha.ready(() => resolve()))
      const recaptchaToken = await executeRecaptcha()

      // Send form data with reCAPTCHA token to API route
      const response = await fetch("/lib/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken,
        }),
      })

      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Server error response:", errorText)
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()

      // Reset form and show success message
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
      setSubmitSuccess(true)

      // Hide success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false)
      }, 5000)
    } catch (error) {
      console.error("Error submitting form:", error)
      setSubmitError(
        "There was an error sending your message. Please try again or contact us directly at support@zimbabwegroceries.com",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubscribing(true)
    setSubscribeError("")

    try {
      // Execute reCAPTCHA and get token
      await new Promise<void>((resolve) => window.grecaptcha.ready(() => resolve()))
      const recaptchaToken = await executeRecaptchaForNewsletter()

      // Subscribe to newsletter
      const response = await subscribeToNewsletter({
        email: newsletterEmail,
        recaptchaToken,
      })

      setSubscribeSuccess(true)
      setNewsletterEmail("")

      // Hide success message after 5 seconds
      setTimeout(() => {
        setSubscribeSuccess(false)
      }, 5000)
    } catch (error: any) {
      console.error("Newsletter subscription error:", error)
      setSubscribeError(error.message || "Failed to subscribe. Please try again.")
    } finally {
      setIsSubscribing(false)
    }
  }

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
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-teal-600 to-teal-800 text-white overflow-hidden">
        {/* Animated elements */}
        <div className="absolute top-10 right-10 w-16 h-16 rounded-full bg-teal-400 opacity-20 animate-float"></div>
        <div className="absolute bottom-5 left-20 w-24 h-24 rounded-full bg-teal-300 opacity-10 animate-float-delay"></div>

        <div className="container mx-auto px-4 py-8 md:py-12 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-3 mx-auto"
            >
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-white" />
              </div>
            </motion.div>

            <motion.h1
              className="text-2xl md:text-4xl font-bold mb-3"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Contact Us
            </motion.h1>

            <motion.p
              className="text-base md:text-lg mb-4 text-teal-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              We're here to help with any questions about our service
            </motion.p>
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="md:flex md:space-x-8">
            <motion.div
              className="md:w-1/3 mb-8 md:mb-0"
              variants={fadeInUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
              <p className="text-gray-600 mb-8">
                Have questions or need assistance? Our customer service team is ready to help you with any inquiries
                about our service.
              </p>

              <motion.div
                className="space-y-6"
                variants={staggerContainerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.div className="flex items-start" variants={fadeInUpVariants}>
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <Mail className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Email</h3>
                    <p className="text-gray-600">info@zimbabwegroceries.com</p>
                    <p className="text-gray-600">support@zimbabwegroceries.com</p>
                  </div>
                </motion.div>

                <motion.div className="flex items-start" variants={fadeInUpVariants}>
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <Clock className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Business Hours</h3>
                    <p className="text-gray-600">Monday - Friday: 9:00 AM - 5:00 PM</p>
                    <p className="text-gray-600">Saturday: 9:00 AM - 1:00 PM</p>
                    <p className="text-gray-600">Sunday: Closed</p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              className="md:w-2/3"
              variants={fadeInUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mr-4">
                    <MessageSquare className="h-5 w-5 text-teal-600" />
                  </div>
                  <h2 className="text-2xl font-bold">Send Us a Message</h2>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    ></textarea>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center bg-teal-600 text-white px-6 py-3 rounded-md hover:bg-teal-700 transition-colors disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </button>

                    {submitSuccess && (
                      <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
                        Your message has been sent successfully. We'll get back to you soon!
                      </div>
                    )}

                    {submitError && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">{submitError}</div>}
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            variants={fadeInUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center mb-4">
              <HelpCircle className="h-8 w-8 text-teal-600 mr-2" />
              <h2 className="text-2xl md:text-3xl font-bold">Frequently Asked Questions</h2>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about our service, delivery, and payment options.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              variants={staggerContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                  variants={fadeInUpVariants}
                >
                  <button
                    className="w-full px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors flex justify-between items-center"
                    onClick={() => toggleFaq(index)}
                  >
                    <span className="font-medium">{faq.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-500 transition-transform ${activeFaq === index ? "rotate-180" : ""}`}
                    />
                  </button>
                  {activeFaq === index && (
                    <div className="px-5 py-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-2xl overflow-hidden shadow-xl"
            variants={fadeInUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="p-8 md:p-12 text-white text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Stay Updated</h2>
              <p className="mb-6 text-teal-50 max-w-2xl mx-auto">
                Subscribe to our newsletter to receive updates on new products, special offers, and tips for supporting
                your loved ones in Zimbabwe.
              </p>
              <form className="max-w-md mx-auto" onSubmit={handleNewsletterSubmit}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="flex-grow px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-300"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubscribing}
                    className="bg-white text-teal-700 hover:bg-teal-50 px-6 py-3 rounded-md font-medium transition-colors disabled:opacity-70 flex items-center justify-center"
                  >
                    {isSubscribing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-700 mr-2"></div>
                        Subscribing...
                      </>
                    ) : (
                      "Subscribe"
                    )}
                  </button>
                </div>

                {subscribeSuccess && (
                  <div className="mt-4 p-3 bg-teal-500 bg-opacity-30 text-white rounded-md">
                    Thank you for subscribing to our newsletter!
                  </div>
                )}

                {subscribeError && (
                  <div className="mt-4 p-3 bg-red-500 bg-opacity-30 text-white rounded-md">{subscribeError}</div>
                )}
              </form>
            </div>
          </motion.div>
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

