"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Heart, Globe, TrendingUp, ShieldCheck, Truck, ArrowRight, Info } from "lucide-react"

export default function AboutUsPage() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

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

  const teamMembers = [
    {
      name: "Tendai Moyo",
      role: "Founder & CEO",
      bio: "With over 15 years of experience in logistics and e-commerce, Tendai founded Zimbabwe Groceries to bridge the gap between Zimbabweans abroad and their families back home.",
      image: "/placeholder.svg?height=400&width=400",
    },
    {
      name: "Chiedza Nyathi",
      role: "Operations Director",
      bio: "Chiedza oversees our day-to-day operations, ensuring smooth delivery and customer satisfaction across Zimbabwe.",
      image: "/placeholder.svg?height=400&width=400",
    },
    {
      name: "Farai Muponda",
      role: "Product Manager",
      bio: "Farai curates our product selection, working directly with local suppliers to ensure quality and authenticity.",
      image: "/placeholder.svg?height=400&width=400",
    },
  ]

  const values = [
    {
      icon: Heart,
      title: "Care",
      description: "We care deeply about connecting families across borders and providing essential support.",
    },
    {
      icon: ShieldCheck,
      title: "Quality",
      description: "We source only the best products and ensure they reach your loved ones in perfect condition.",
    },
    {
      icon: Truck,
      title: "Reliability",
      description: "Our delivery network ensures timely and dependable service across Zimbabwe.",
    },
    {
      icon: Globe,
      title: "Accessibility",
      description: "We make it easy to support family from anywhere in the world with our simple platform.",
    },
  ]

  return (
    <div >
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-teal-600 to-teal-800 text-white overflow-hidden">


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
                <Info className="h-8 w-8 text-white" />
              </div>
            </motion.div>

            <motion.h1
              className="text-2xl md:text-4xl font-bold mb-3"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              About Zimbabwe Groceries
            </motion.h1>

            <motion.p
              className="text-base md:text-lg mb-4 text-teal-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Connecting families across borders through essential groceries and goods
            </motion.p>
          </div>
        </div>
      </section>

      {/* Our Story Section - IMPROVED */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="md:flex md:items-center md:space-x-12">
            <motion.div
              className="md:w-1/2 mb-8 md:mb-0"
              variants={fadeInUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="relative h-64 md:h-96 rounded-xl overflow-hidden shadow-lg">
                <Image src="/images/story.jpg?height=600&width=800" alt="Our story" fill className="object-cover" />
              </div>
            </motion.div>
            <motion.div
              className="md:w-1/2"
              variants={fadeInUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Here at Zimbabwe Groceries, we believe in a powerful truth: distance should never separate families from
                caring for one another. We were founded on the vision that no matter where you are in the world, you
                should be able to provide for your loved ones back home as if you were right there with them.
              </p>
              <p className="text-gray-600 mb-4">
                We saw how many in the diaspora would simply send money home with instructions to "
                <strong>buy groceries</strong>," but we knew there was a better way. Our platform allows you to
                personally select the exact items your family needs—from essential foods to household
                necessities—creating a more meaningful connection despite being thousands of miles away.
              </p>
              <p className="text-gray-600 mb-4">
                This isn't just a service; it's a bridge connecting Zimbabweans across continents. When you can't be
                there to fill your mother's kitchen or stock your brother's pantry, we become your hands and feet on the
                ground in Zimbabwe.
              </p>
              <p className="text-gray-600">
                We take immense pride in treating your family as our own. Every delivery isn't just a transaction—it's a
                promise kept between you and your loved ones. That's the Zimbabwe Groceries difference:{" "}
                <strong>
                  We Don't Just Deliver Groceries; We Deliver Your Presence, Your Care, and Your Love Across Borders.
                </strong>
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              className="text-2xl md:text-3xl font-bold mb-4"
              variants={fadeInUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              Our Mission & Vision
            </motion.h2>
          </div>

          <div className="md:flex md:space-x-8">
            <motion.div
              className="md:w-1/2 bg-white rounded-xl shadow-sm p-8 mb-8 md:mb-0"
              variants={fadeInUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-6">
                <Heart className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Our Mission</h3>
              <p className="text-gray-600 mb-4">
                To bridge the gap between Zimbabweans in the diaspora and their families back home by providing a
                reliable, efficient, and affordable way to deliver essential groceries and goods.
              </p>
              <p className="text-gray-600">
                We strive to strengthen family bonds across borders and contribute to the well-being of Zimbabwean
                communities through direct support.
              </p>
            </motion.div>

            <motion.div
              className="md:w-1/2 bg-white rounded-xl shadow-sm p-8"
              variants={fadeInUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Our Vision</h3>
              <p className="text-gray-600 mb-4">
                To become the leading platform connecting Zimbabweans worldwide with their families through essential
                goods, creating a global community of support and care.
              </p>
              <p className="text-gray-600">
                We envision a world where distance is no barrier to providing for loved ones, and where every Zimbabwean
                family has access to quality essentials regardless of economic challenges.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              className="text-2xl md:text-3xl font-bold mb-4"
              variants={fadeInUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              Our Values
            </motion.h2>
            <motion.p
              className="text-gray-600 max-w-3xl mx-auto"
              variants={fadeInUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              These core principles guide everything we do at Zimbabwe Groceries.
            </motion.p>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center"
                variants={fadeInUpVariants}
              >
                <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <value.icon className="h-7 w-7 text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Impact Section - Updated to Future Impact */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="md:flex md:items-center md:space-x-12">
            <motion.div
              className="md:w-1/2 mb-8 md:mb-0"
              variants={fadeInUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Our Future Impact</h2>
              <p className="text-gray-600 mb-4">
                As we grow, our vision extends beyond just delivering groceries. We aim to create a lasting positive
                impact on Zimbabwean communities and strengthen the bonds between families separated by distance.
              </p>
              <p className="text-gray-600 mb-6">Here's what we're working toward in the coming years:</p>
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-teal-600 mb-2">1,000+</div>
                  <p className="text-gray-600">Families Supported</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-teal-600 mb-2">10+</div>
                  <p className="text-gray-600">Cities Served</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-teal-600 mb-2">5,000+</div>
                  <p className="text-gray-600">Orders Delivered</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-teal-600 mb-2">15+</div>
                  <p className="text-gray-600">Local Suppliers</p>
                </div>
              </div>
              <div className="mt-8 bg-teal-50 p-4 rounded-lg border border-teal-100">
                <p className="text-teal-700 text-sm">
                  Beyond these numbers, we aim to create jobs within local communities, support small-scale farmers, and
                  develop a network that makes it easier for Zimbabweans abroad to maintain meaningful connections with
                  home.
                </p>
              </div>
            </motion.div>
            <motion.div
              className="md:w-1/2"
              variants={fadeInUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="relative h-64 md:h-96 rounded-xl overflow-hidden shadow-lg">
                <Image
                  src="/images/future.avif?height=600&width=800"
                  alt="Our future impact"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="md:flex">
              <div className="md:w-1/2 p-8 md:p-12 text-white">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Join Our Mission</h2>
                <p className="mb-6 text-teal-50">
                  Be part of our story by helping your loved ones in Zimbabwe with essential groceries and goods. Start
                  supporting your family today.
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

