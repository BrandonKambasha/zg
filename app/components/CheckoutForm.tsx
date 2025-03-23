"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import DeliveryZoneMap from "./DeliveryZoneMap"
import { AlertCircle, User, Mail, Phone, Home, MapPin, Globe, Users, CheckCircle2 } from "lucide-react"

// Update the schema to ensure delivery_zone is never undefined
const shippingSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(6, "Phone number is required"),
  house_number: z.string().min(1, "House number is required"),
  city: z.string().min(2, "City is required"),
  street: z.string().min(2, "Street is required"),
  location: z.string().min(2, "Location is required"),
  country: z.string().min(2, "Country is required"),
  zim_contact: z.string().min(2, "Please enter a Zimbabwe Phone number to contact in Zimbabwe"),
  zim_name: z.string().min(2, "Please enter a name of the contact in Zimbabwe"),
  delivery_zone: z.number().nullable(), // Remove optional() to ensure it's never undefined
})

type ShippingFormValues = z.infer<typeof shippingSchema>

interface CheckoutFormProps {
  initialValues: Partial<ShippingFormValues>
  onSubmit: (data: ShippingFormValues) => void
  isSubmitting: boolean
}

export default function CheckoutForm({ initialValues, onSubmit, isSubmitting }: CheckoutFormProps) {
  const [showMap, setShowMap] = useState(false)
  const [deliveryZone, setDeliveryZone] = useState<number | null>(null)
  const [zoneConfirmed, setZoneConfirmed] = useState(false)
  const [zoneError, setZoneError] = useState<string | null>(null)
  const [isZoneUpdate, setIsZoneUpdate] = useState(false)

  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      ...initialValues,
      delivery_zone: null,
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = form

  // Watch address fields to determine when to show the map
  const house_number = watch("house_number")
  const street = watch("street")
  const city = watch("city")
  const location = watch("location")
  const country = watch("country")

  // Show map when address fields are filled and country is Zimbabwe
  useEffect(() => {
    if (house_number && street && city && country === "Zimbabwe") {
      setShowMap(true)
    } else {
      setShowMap(false)
      setDeliveryZone(null)
      setValue("delivery_zone", null)
      setZoneConfirmed(false)
    }
  }, [house_number, street, city, location, country, setValue])

  // Handle zone change from the map
  const handleZoneChange = (zone: number | null) => {
    // Set flag to indicate this is a zone update, not a form submission
    setIsZoneUpdate(true)

    const zoneIsConfirmed = zone !== null
    setValue("delivery_zone", zone)
    setDeliveryZone(zone)
    setZoneConfirmed(zoneIsConfirmed)

    // Immediately notify parent component of zone change
    if (zoneIsConfirmed) {
      // Create a partial data object with just the delivery_zone
      const partialData = {
        ...getValues(),
        delivery_zone: zone,
      }

      // Call onSubmit with the current form data and the new zone
      // This won't actually submit the form, just update the parent with the new zone
      onSubmit(partialData)

      // Reset the flag after a short delay
      setTimeout(() => {
        setIsZoneUpdate(false)
      }, 100)
    }
  }

  // Get current address for the map
  const currentAddress = {
    house_number: house_number || "",
    street: street || "",
    city: city || "",
    location: location || "",
  }

  // Update the form submission handler to check if a zone is confirmed
  const onFormSubmit = (data: ShippingFormValues) => {
    // If this is just a zone update, don't proceed with form submission
    if (isZoneUpdate) {
      return
    }

    // If we're showing the map for Zimbabwe addresses
    if (showMap && country === "Zimbabwe") {
      // Check if a delivery zone is selected and confirmed
      if (!deliveryZone) {
        setZoneError("You must select a delivery zone to proceed")
        // Scroll to the map section
        const mapElement = document.querySelector(".delivery-zone-map-section")
        if (mapElement) {
          mapElement.scrollIntoView({ behavior: "smooth", block: "center" })
        }
        return
      }

      if (!zoneConfirmed) {
        setZoneError("You must confirm your delivery zone to proceed")
        // Scroll to the map section
        const mapElement = document.querySelector(".delivery-zone-map-section")
        if (mapElement) {
          mapElement.scrollIntoView({ behavior: "smooth", block: "center" })
        }
        return
      }
    }

    // Otherwise proceed with the form submission
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6" id="checkout-form">
      {/* Contact Information Section */}
      <div className="bg-white rounded-xl overflow-hidden shadow-md">
        <div className="px-6 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white">
          <h3 className="text-lg font-medium flex items-center">
            <User className="h-5 w-5 mr-2" />
            Contact Information
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  {...register("fullName")}
                  className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  placeholder="John Doe"
                />
              </div>
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="phone"
                  type="text"
                  {...register("phone")}
                  className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Address Section */}
      <div className="bg-white rounded-xl overflow-hidden shadow-md">
        <div className="px-6 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white">
          <h3 className="text-lg font-medium flex items-center">
            <Home className="h-5 w-5 mr-2" />
            Shipping Address
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="house_number" className="block text-sm font-medium text-gray-700">
                House/Apt Number*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Home className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="house_number"
                  type="text"
                  {...register("house_number")}
                  className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  placeholder="123"
                />
              </div>
              {errors.house_number && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  {errors.house_number.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                Street*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="street"
                  type="text"
                  {...register("street")}
                  className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  placeholder="Main Street"
                />
              </div>
              {errors.street && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  {errors.street.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location/Suburb*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="location"
                  type="text"
                  {...register("location")}
                  className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  placeholder="Avondale"
                />
              </div>
              {errors.location && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  {errors.location.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="city"
                  type="text"
                  {...register("city")}
                  className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  placeholder="Harare"
                />
              </div>
              {errors.city && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  {errors.city.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                Country*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  id="country"
                  {...register("country")}
                  className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all appearance-none bg-white"
                >
                  <option value="Zimbabwe">Zimbabwe</option>
                  <option value="South Africa">South Africa</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Other">Other</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
              {errors.country && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  {errors.country.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Zimbabwe Contact Section */}
      <div className="bg-white rounded-xl overflow-hidden shadow-md">
        <div className="px-6 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white">
          <h3 className="text-lg font-medium flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Zimbabwe Contact
          </h3>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            If you're ordering from outside Zimbabwe, please provide a local contact person who can receive your
            delivery.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="zim_name" className="block text-sm font-medium text-gray-700">
                Contact Name*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="zim_name"
                  type="text"
                  {...register("zim_name")}
                  className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  placeholder="Local contact name"
                />
              </div>
              {errors.zim_name && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  {errors.zim_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="zim_contact" className="block text-sm font-medium text-gray-700">
                Contact Phone*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="zim_contact"
                  type="text"
                  {...register("zim_contact")}
                  className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  placeholder="+263 7X XXX XXXX"
                />
              </div>
              {errors.zim_contact && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  {errors.zim_contact.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden field for delivery zone */}
      <input type="hidden" {...register("delivery_zone")} />

      {/* Delivery Zone Map - Only show for Zimbabwe addresses */}
      {showMap && (
        <div className="mt-6 delivery-zone-map-section">
          <div className="bg-white rounded-xl overflow-hidden shadow-md">
            <div className="px-6 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white">
              <div className="flex justify-between items-center w-full">
                <h3 className="text-lg font-medium flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Delivery Zone Selection
                </h3>
                {country === "Zimbabwe" && (
                  <div className="bg-white text-teal-600 text-xs px-3 py-1 rounded-full font-medium animate-pulse">
                    Required
                  </div>
                )}
              </div>
            </div>
            <div className="p-6">
              {zoneError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                  <p>{zoneError}</p>
                </div>
              )}

              <DeliveryZoneMap onZoneChange={handleZoneChange} initialAddress={currentAddress} formId="checkout-form" />

              {showMap && !deliveryZone && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 font-medium">
                    You must select and confirm a delivery zone to proceed with checkout.
                  </p>
                </div>
              )}

              {deliveryZone && zoneConfirmed ? (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                  <div className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Your address is in Zone {deliveryZone} (Confirmed)</p>
                      <p className="text-sm mt-1">
                        Delivery Fee: $
                        {deliveryZone === 1 ? "5" : deliveryZone === 2 ? "8" : deliveryZone === 3 ? "12" : "15"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : deliveryZone ? (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">Your address is in Zone {deliveryZone} (Not Confirmed)</p>
                      <p className="text-sm mt-1">Please confirm your delivery zone on the map before proceeding.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">Delivery zone not detected</p>
                      <p className="text-sm mt-1">
                        Please search for your neighborhood and select a location from the dropdown to determine your
                        delivery zone.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-6">
        <button
          type="submit"
          disabled={isSubmitting || (showMap && country === "Zimbabwe" && (!deliveryZone || !zoneConfirmed))}
          className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-4 rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 font-medium text-lg shadow-md"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : showMap && country === "Zimbabwe" && (!deliveryZone || !zoneConfirmed) ? (
            "Please select and confirm your delivery zone"
          ) : (
            "Proceed to Payment"
          )}
        </button>

        {showMap && country === "Zimbabwe" && (!deliveryZone || !zoneConfirmed) && (
          <p className="text-amber-600 text-sm mt-3 text-center">
            You must complete the delivery zone selection process before proceeding
          </p>
        )}
      </div>
    </form>
  )
}

