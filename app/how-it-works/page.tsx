"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  UserPlus,
  ShoppingCart,
  CreditCard,
  Truck,
  Check,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  HelpCircle,
} from "lucide-react"

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(1)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const steps = [
    {
      id: 1,
      title: "Create an Account",
      description: "Sign up and provide your details and your recipient's information in Zimbabwe.",
      icon: UserPlus,
      color: "bg-blue-100",
      iconColor: "text-blue-600",
      image: "/images/create.jpg?height=300&width=400",
    },
    {
      id: 2,
      title: "Shop Products",
      description: "Browse our catalog and select groceries and essentials your family needs.",
      icon: ShoppingCart,
      color: "bg-green-100",
      iconColor: "text-green-600",
      image: "/images/cart.avif?height=300&width=400",
    },
    {
      id: 3,
      title: "Secure Checkout",
      description: "Pay securely using your preferred payment method from anywhere in the world.",
      icon: CreditCard,
      color: "bg-purple-100",
      iconColor: "text-purple-600",
      image: "/images/checkout.jpg?height=300&width=400",
    },
    {
      id: 4,
      title: "We Deliver",
      description: "We prepare and deliver the order directly to your loved ones in Zimbabwe.",
      icon: Truck,
      color: "bg-teal-100",
      iconColor: "text-teal-600",
      image: "/images/truck.avif?height=300&width=400",
    },
  ]

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
  ]

  const toggleFaq = (index: number) => {
    if (activeFaq === index) {
      setActiveFaq(null)
    } else {
      setActiveFaq(index)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <div >
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-teal-600 to-teal-800 text-white overflow-hidden">


        {/* Animated elements */}
        <div className="absolute -bottom-3 left-1/4 transform -translate-x-1/2">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Truck className="h-16 w-16 text-white opacity-10" />
          </motion.div>
        </div>

        <div className="absolute -top-3 right-1/4 transform translate-x-1/2 rotate-12">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            <ShoppingCart className="h-12 w-12 text-white opacity-10" />
          </motion.div>
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-3 mx-auto"
            >
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto">
                <HelpCircle className="h-8 w-8 text-white" />
              </div>
            </motion.div>

            <motion.h1
              className="text-2xl md:text-4xl font-bold mb-3"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              How It Works
            </motion.h1>

            <motion.p
              className="text-base md:text-lg mb-4 text-teal-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Supporting your loved ones in Zimbabwe is simple, secure, and just a few clicks away
            </motion.p>
          </div>
        </div>
      </section>

      {/* Steps Section - Desktop */}
      <section className="py-16 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Four Simple Steps</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our streamlined process makes it easy to send groceries and essentials to your family in Zimbabwe.
            </p>
          </div>

          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-20 left-0 right-0 h-1 bg-gray-200">
              <div
                className="h-full bg-teal-600 transition-all duration-500"
                style={{ width: `${(activeStep / steps.length) * 100}%` }}
              ></div>
            </div>

            <motion.div
              className="grid grid-cols-4 gap-8 relative"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {steps.map((step) => (
                <motion.div
                  key={step.id}
                  className={`text-center ${activeStep >= step.id ? "" : "opacity-60"}`}
                  variants={itemVariants}
                  onMouseEnter={() => setActiveStep(step.id)}
                >
                  <div
                    className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-6 relative z-10`}
                  >
                    <step.icon className={`h-8 w-8 ${step.iconColor}`} />
                    {activeStep >= step.id && (
                      <motion.div
                        className="absolute -right-1 -bottom-1 bg-teal-600 rounded-full w-6 h-6 flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Check className="h-4 w-4 text-white" />
                      </motion.div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div className="mt-16">
            <motion.div
              className="bg-gray-50 rounded-xl overflow-hidden shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="grid grid-cols-2">
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-4">{steps[activeStep - 1].title}</h3>
                  <p className="text-gray-600 mb-6">{steps[activeStep - 1].description}</p>
                  <ul className="space-y-3">
                    {activeStep === 1 && (
                      <>
                        <li className="flex items-start">
                          <ChevronRight className="h-5 w-5 text-teal-600 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Create a secure account with your email and password</span>
                        </li>
                        <li className="flex items-start">
                          <ChevronRight className="h-5 w-5 text-teal-600 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Add your recipient's details including their address in Zimbabwe</span>
                        </li>
                        <li className="flex items-start">
                          <ChevronRight className="h-5 w-5 text-teal-600 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Save multiple recipients for easy future ordering</span>
                        </li>
                      </>
                    )}
                    {activeStep === 2 && (
                      <>
                        <li className="flex items-start">
                          <ChevronRight className="h-5 w-5 text-teal-600 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Browse our extensive catalog of authentic Zimbabwean groceries</span>
                        </li>
                        <li className="flex items-start">
                          <ChevronRight className="h-5 w-5 text-teal-600 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Filter by categories like staples, meats, vegetables, and household items</span>
                        </li>
                        <li className="flex items-start">
                          <ChevronRight className="h-5 w-5 text-teal-600 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Choose from pre-made hampers or create your own custom selection</span>
                        </li>
                      </>
                    )}
                    {activeStep === 3 && (
                      <>
                        <li className="flex items-start">
                          <ChevronRight className="h-5 w-5 text-teal-600 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Review your order and select your preferred payment method</span>
                        </li>
                        <li className="flex items-start">
                          <ChevronRight className="h-5 w-5 text-teal-600 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Pay securely with credit card, PayPal, or mobile money</span>
                        </li>
                        <li className="flex items-start">
                          <ChevronRight className="h-5 w-5 text-teal-600 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Receive instant confirmation of your order via email</span>
                        </li>
                      </>
                    )}
                    {activeStep === 4 && (
                      <>
                        <li className="flex items-start">
                          <ChevronRight className="h-5 w-5 text-teal-600 mt-0.5 mr-2 flex-shrink-0" />
                          <span>We prepare your order with fresh, quality products</span>
                        </li>
                        <li className="flex items-start">
                          <ChevronRight className="h-5 w-5 text-teal-600 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Delivery within 24-48 hours to major cities in Zimbabwe</span>
                        </li>
                        <li className="flex items-start">
                          <ChevronRight className="h-5 w-5 text-teal-600 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Real-time tracking and delivery confirmation</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
                <div className="relative">
                  <Image
                    src={steps[activeStep - 1].image || "/placeholder.svg"}
                    alt={steps[activeStep - 1].title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Steps Section - Mobile */}
      <section className="py-12 md:hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-3">Four Simple Steps</h2>
            <p className="text-gray-600">
              Our streamlined process makes it easy to send groceries to your family in Zimbabwe.
            </p>
          </div>

          <div className="space-y-6">
            {steps.map((step) => (
              <motion.div
                key={step.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative h-48">
                  <Image src={step.image || "/placeholder.svg"} alt={step.title} fill className="object-cover" />
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
                    <span className="text-teal-600 font-bold">{step.id}</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center mb-3">
                    <div className={`w-10 h-10 ${step.color} rounded-full flex items-center justify-center mr-3`}>
                      <step.icon className={`h-5 w-5 ${step.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <ul className="space-y-2">
                    {step.id === 1 && (
                      <>
                        <li className="flex items-start text-sm">
                          <ChevronRight className="h-4 w-4 text-teal-600 mt-0.5 mr-1 flex-shrink-0" />
                          <span>Create a secure account</span>
                        </li>
                        <li className="flex items-start text-sm">
                          <ChevronRight className="h-4 w-4 text-teal-600 mt-0.5 mr-1 flex-shrink-0" />
                          <span>Add recipient's details in Zimbabwe</span>
                        </li>
                      </>
                    )}
                    {step.id === 2 && (
                      <>
                        <li className="flex items-start text-sm">
                          <ChevronRight className="h-4 w-4 text-teal-600 mt-0.5 mr-1 flex-shrink-0" />
                          <span>Browse our extensive catalog</span>
                        </li>
                        <li className="flex items-start text-sm">
                          <ChevronRight className="h-4 w-4 text-teal-600 mt-0.5 mr-1 flex-shrink-0" />
                          <span>Choose from pre-made hampers or create your own</span>
                        </li>
                      </>
                    )}
                    {step.id === 3 && (
                      <>
                        <li className="flex items-start text-sm">
                          <ChevronRight className="h-4 w-4 text-teal-600 mt-0.5 mr-1 flex-shrink-0" />
                          <span>Review order and select payment method</span>
                        </li>
                        <li className="flex items-start text-sm">
                          <ChevronRight className="h-4 w-4 text-teal-600 mt-0.5 mr-1 flex-shrink-0" />
                          <span>Receive instant confirmation via email</span>
                        </li>
                      </>
                    )}
                    {step.id === 4 && (
                      <>
                        <li className="flex items-start text-sm">
                          <ChevronRight className="h-4 w-4 text-teal-600 mt-0.5 mr-1 flex-shrink-0" />
                          <span>We prepare your order with fresh products</span>
                        </li>
                        <li className="flex items-start text-sm">
                          <ChevronRight className="h-4 w-4 text-teal-600 mt-0.5 mr-1 flex-shrink-0" />
                          <span>Delivery within 24-48 hours in Zimbabwe</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about our service, delivery, and payment options.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="mb-4 border border-gray-200 rounded-lg overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <button
                  className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors flex justify-between items-center"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-medium">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-500 transition-transform ${activeFaq === index ? "rotate-180" : ""}`}
                  />
                </button>
                {activeFaq === index && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="md:flex">
              <div className="md:w-1/2 p-8 md:p-12 text-white">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Support Your Loved Ones?</h2>
                <p className="mb-6 text-teal-50">
                  Start sending essential groceries and goods to your family in Zimbabwe today. It only takes a few
                  minutes to get started.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center bg-white text-teal-700 hover:bg-teal-50 px-6 py-3 rounded-md font-medium transition-colors"
                >
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
              <div className="md:w-1/2 relative">
              </div>
            </div>
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

