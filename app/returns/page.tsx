"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { RefreshCcw, Clock, AlertTriangle, CheckCircle, HelpCircle, ArrowRight, ShoppingBag, Truck } from "lucide-react"

export default function ReturnsPage() {
  const [activeTab, setActiveTab] = useState("refunds")

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

  const policies = [
    {
      icon: Clock,
      title: "24-Hour Window",
      description:
        "Refund requests must be made within 24 hours of placing your order, before the order is processed for delivery.",
    },
    {
      icon: AlertTriangle,
      title: "No Post-Processing Refunds",
      description: "Once your order has been processed and prepared for delivery, we are unable to offer refunds.",
    },
    {
      icon: RefreshCcw,
      title: "Item Exchanges",
      description:
        "If you're not satisfied with your selection, we can help you exchange items for alternatives of equal or lesser value before the order has been purchased.",
    },
    {
      icon: CheckCircle,
      title: "Quality Guarantee",
      description:
        "If items arrive damaged or spoiled, we'll replace them at no additional cost to ensure your satisfaction.",
    },
  ]

  const faqs = [
    {
      question: "How do I request a refund within the 24-hour window?",
      answer:
        "To request a refund within 24 hours of placing your order, please contact our customer service team via email at support@zimbabwegroceries.com or call us at +263 77 123 4567. Please have your order number ready.",
    },
    {
      question: "Can I exchange items after delivery?",
      answer:
        "Yes, if you're not satisfied with specific items, we can arrange for an exchange on your next order. Please contact our customer service team within 24 hours of delivery to arrange this.",
    },
    {
      question: "What if some items are missing from my delivery?",
      answer:
        "If any items are missing from your delivery, please contact us immediately. We'll verify your order and either deliver the missing items or provide store credit for your next purchase.",
    },
    {
      question: "How do I report quality issues with my order?",
      answer:
        "If you receive items that don't meet our quality standards, please take a photo and send it to support@zimbabwegroceries.com along with your order number within 24 hours of delivery.",
    },
  ]

  return (
    <div >
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
                <RefreshCcw className="h-8 w-8 text-white" />
              </div>
            </motion.div>

            <motion.h1
              className="text-2xl md:text-4xl font-bold mb-3"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Returns & Refund Policy
            </motion.h1>

            <motion.p
              className="text-base md:text-lg mb-4 text-teal-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Understanding our policies to ensure a smooth experience
            </motion.p>
          </div>
        </div>
      </section>

      {/* Policy Navigation Tabs */}
      <section className="py-8 bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setActiveTab("refunds")}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                activeTab === "refunds"
                  ? "bg-teal-600 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Refund Policy
            </button>
            <button
              onClick={() => setActiveTab("faqs")}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                activeTab === "faqs" ? "bg-teal-600 text-white shadow-md" : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              FAQs
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {activeTab === "refunds" && (
            <>
              {/* Policy Overview */}
              <motion.div
                className="max-w-3xl mx-auto mb-16"
                variants={fadeInUpVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Our Return Policy</h2>
                <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-lg mb-8">
                  <p className="text-amber-800">
                    At Zimbabwe Groceries, we understand that sometimes plans change. However, due to the nature of
                    grocery items and our commitment to freshness, we have specific policies regarding returns and
                    refunds.
                  </p>
                </div>
                <p className="text-gray-600 mb-4">
                  We take great care to ensure that all items are of the highest quality when they leave our facility.
                  Our goal is to provide your loved ones with fresh, quality products that meet your expectations.
                </p>
                <p className="text-gray-600">
                  Please review our policies below to understand your options if you need to make changes to your order.
                </p>
              </motion.div>

              {/* Policy Cards */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
                variants={staggerContainerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {policies.map((policy, index) => (
                  <motion.div
                    key={index}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                    variants={fadeInUpVariants}
                  >
                    <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mb-6">
                      <policy.icon className="h-7 w-7 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">{policy.title}</h3>
                    <p className="text-gray-600">{policy.description}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Additional Information */}
              <motion.div
                className="max-w-3xl mx-auto mt-16 bg-gray-50 p-8 rounded-xl border border-gray-200"
                variants={fadeInUpVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                  <HelpCircle className="h-5 w-5 mr-2 text-teal-600" />
                  Important Notes
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="h-5 w-5 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 mr-3 mt-0.5 flex-shrink-0">
                      1
                    </span>
                    <span>All refund requests must include your order number and the reason for your request.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-5 w-5 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 mr-3 mt-0.5 flex-shrink-0">
                      2
                    </span>
                    <span>Refunds will be processed to the original payment method within 3-5 business days.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-5 w-5 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 mr-3 mt-0.5 flex-shrink-0">
                      3
                    </span>
                    <span>
                      For orders placed from outside Zimbabwe, please note that currency conversion rates may affect the
                      final refund amount.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-5 w-5 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 mr-3 mt-0.5 flex-shrink-0">
                      4
                    </span>
                    <span>
                      We reserve the right to deny refund requests that do not comply with our policy guidelines.
                    </span>
                  </li>
                </ul>
              </motion.div>
            </>
          )}

          {activeTab === "faqs" && (
            <motion.div
              className="max-w-3xl mx-auto"
              variants={staggerContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-10 text-gray-800 text-center">
                Frequently Asked Questions
              </h2>

              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                    variants={fadeInUpVariants}
                  >
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2
              className="text-2xl md:text-3xl font-bold mb-6 text-gray-800"
              variants={fadeInUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              Need More Help?
            </motion.h2>
            <motion.p
              className="text-gray-600 mb-8"
              variants={fadeInUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              Our customer service team is ready to assist you with any questions about our return policy.
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
                href="/shipping"
                className="inline-flex items-center bg-white text-teal-600 border border-teal-600 hover:bg-teal-50 px-6 py-3 rounded-md font-medium transition-colors"
              >
                Shipping Information <Truck className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="md:flex items-center">
              <div className="md:w-2/3 p-8 md:p-12 text-white">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Shop?</h2>
                <p className="mb-6 text-teal-50">
                  Browse our selection of quality groceries and essentials to send to your loved ones in Zimbabwe.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center bg-white text-teal-700 hover:bg-teal-50 px-6 py-3 rounded-md font-medium transition-colors"
                >
                  Shop Now <ShoppingBag className="ml-2 h-5 w-5" />
                </Link>
              </div>
              <div className="md:w-1/3 relative hidden md:block">
                <div className="h-full py-12 pr-12">
                </div>
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

