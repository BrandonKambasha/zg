"use client"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Truck, Clock, MapPin, Calendar, CheckCircle, AlertCircle, User, ShoppingBag } from "lucide-react"

export default function ShippingPage() {
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

  const shippingSteps = [
    {
      icon: ShoppingBag,
      title: "Order Placed",
      description: "Your order is confirmed and entered into our system for processing.",
    },
    {
      icon: CheckCircle,
      title: "Order Processing",
      description: "We carefully select and prepare your items for delivery.",
    },
    {
      icon: Truck,
      title: "Out for Delivery",
      description: "Your order is on its way to your specified delivery location.",
    },
    {
      icon: Calendar,
      title: "Delivery Complete",
      description: "Your groceries have been successfully delivered to your loved ones.",
    },
  ]

  const shippingFaqs = [
    {
      question: "Do you deliver outside of Harare?",
      answer:
        "Currently, we only deliver within Harare. However, we're working on expanding our delivery network to other major cities in Zimbabwe very soon. Sign up for our newsletter to be notified when we launch in your area.",
    },
    {
      question: "Can I specify a delivery time?",
      answer:
        "Yes, during checkout you can select a preferred delivery window. We offer morning (9am-12pm) and afternoon (2pm-5pm) delivery slots.",
    },
    {
      question: "How will I know when my order has been delivered?",
      answer:
        "You'll receive email notifications at each stage of the delivery process, including when your order has been successfully delivered.",
    },
    {
      question: "What happens if no one is available to receive the delivery?",
      answer:
        "Our delivery team will call the recipient before arrival. If no one is available, we'll attempt to reschedule for later the same day or the following day, depending on our delivery schedule.",
    },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-teal-600 to-teal-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
        </div>

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
            <MapPin className="h-12 w-12 text-white opacity-10" />
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
                <Truck className="h-8 w-8 text-white" />
              </div>
            </motion.div>

            <motion.h1
              className="text-2xl md:text-4xl font-bold mb-3"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Shipping Information
            </motion.h1>

            <motion.p
              className="text-base md:text-lg mb-4 text-teal-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Fast, reliable delivery to your loved ones in Harare
            </motion.p>
          </div>
        </div>
      </section>

      {/* Delivery Timeframe */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto mb-16 text-center"
            variants={fadeInUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Delivery Timeframe</h2>
            <p className="text-gray-600 mb-8">
              We understand the importance of timely delivery when it comes to essential groceries. Here's what you can
              expect:
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-teal-50 border border-teal-100 rounded-xl overflow-hidden shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <motion.div
                  className="p-8 flex flex-col justify-center"
                  variants={fadeInUpVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <div className="flex items-center mb-6">
                    <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mr-4">
                      <Clock className="h-7 w-7 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">24-48 Hour Delivery</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    All orders within Harare are delivered within 24-48 hours of order confirmation, depending on your
                    selected delivery zone.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Zone 1: (Central Harare)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Zone 2: (Greater Harare)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Zone 3 & 4: (Outer Harare)</span>
                    </li>
                  </ul>
                </motion.div>
                <motion.div
                  className="relative h-64 md:h-auto"
                  variants={fadeInUpVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <Image
                    src="/images/truck.avif?height=400&width=600"
                    alt="Delivery truck"
                    fill
                    className="object-cover"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Current Coverage */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto mb-16 text-center"
            variants={fadeInUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Current Coverage</h2>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-100"
                variants={fadeInUpVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <CheckCircle className="h-7 w-7 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Currently Serving</h3>
                </div>
                <p className="text-gray-600 mb-4">We currently deliver to all areas within Harare, including:</p>
                <ul className="grid grid-cols-2 gap-2">
                  <li className="flex items-center">
                    <MapPin className="h-4 w-4 text-teal-600 mr-2" />
                    <span className="text-gray-600 text-sm">Avondale</span>
                  </li>
                  <li className="flex items-center">
                    <MapPin className="h-4 w-4 text-teal-600 mr-2" />
                    <span className="text-gray-600 text-sm">Borrowdale</span>
                  </li>
                  <li className="flex items-center">
                    <MapPin className="h-4 w-4 text-teal-600 mr-2" />
                    <span className="text-gray-600 text-sm">Highlands</span>
                  </li>
                  <li className="flex items-center">
                    <MapPin className="h-4 w-4 text-teal-600 mr-2" />
                    <span className="text-gray-600 text-sm">Mount Pleasant</span>
                  </li>
                  <li className="flex items-center">
                    <MapPin className="h-4 w-4 text-teal-600 mr-2" />
                    <span className="text-gray-600 text-sm">Mbare</span>
                  </li>
                  <li className="flex items-center">
                    <MapPin className="h-4 w-4 text-teal-600 mr-2" />
                    <span className="text-gray-600 text-sm">Greendale</span>
                  </li>
                  <li className="flex items-center">
                    <MapPin className="h-4 w-4 text-teal-600 mr-2" />
                    <span className="text-gray-600 text-sm">Hatfield</span>
                  </li>
                  <li className="flex items-center">
                    <MapPin className="h-4 w-4 text-teal-600 mr-2" />
                    <span className="text-gray-600 text-sm">And more...</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-100"
                variants={fadeInUpVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mr-4">
                    <AlertCircle className="h-7 w-7 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Coming Soon</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  We're actively working to expand our delivery network to other major cities in Zimbabwe, including:
                </p>
                <ul className="grid grid-cols-2 gap-2">
                  <li className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600 text-sm">Bulawayo</span>
                  </li>
                  <li className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600 text-sm">Mutare</span>
                  </li>
                  <li className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600 text-sm">Gweru</span>
                  </li>
                  <li className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600 text-sm">Masvingo</span>
                  </li>
                  <li className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600 text-sm">Kwekwe</span>
                  </li>
                  <li className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600 text-sm">And more...</span>
                  </li>
                </ul>
                <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-100">
                  <p className="text-amber-700 text-sm">
                    Want to know when we launch in your city? Sign up for our newsletter to be the first to know!
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Shipping Process */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto mb-16 text-center"
            variants={fadeInUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Our Shipping Process</h2>
            <p className="text-gray-600">
              We've designed our shipping process to be transparent and efficient, keeping you informed every step of
              the way.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto"
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {shippingSteps.map((step, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center relative"
                variants={fadeInUpVariants}
              >
                {index < shippingSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-200 z-0"></div>
                )}
                <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                  <step.icon className="h-7 w-7 text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Track Your Order */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <motion.div
                  className="p-8 flex flex-col justify-center"
                  variants={fadeInUpVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Track Your Order</h3>
                  <p className="text-gray-600 mb-6">
                    You can easily track the status of your order through your account page. See real-time updates on
                    processing, shipping, and delivery.
                  </p>
                  <Link
                    href="/account"
                    className="inline-flex items-center bg-teal-600 text-white hover:bg-teal-700 px-6 py-3 rounded-md font-medium transition-colors self-start"
                  >
                    <User className="mr-2 h-5 w-5" />
                    Go to My Account
                  </Link>
                </motion.div>
                <motion.div
                  className="relative h-64 md:h-auto bg-teal-600"
                  variants={fadeInUpVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <div className="absolute inset-0 bg-pattern opacity-10"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white p-8">
                      <Truck className="h-16 w-16 mx-auto mb-4" />
                      <h4 className="text-xl font-bold mb-2">Real-Time Updates</h4>
                      <p className="text-teal-100">Stay informed at every step of the delivery process</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto mb-16 text-center"
            variants={fadeInUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Frequently Asked Questions</h2>
          </motion.div>

          <motion.div
            className="max-w-3xl mx-auto"
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="space-y-6">
              {shippingFaqs.map((faq, index) => (
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="md:flex items-center">
              <div className="md:w-2/3 p-8 md:p-12 text-white">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Send Love Home?</h2>
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

