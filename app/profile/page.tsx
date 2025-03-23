"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../hooks/useAuth"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email").optional(),
  phone_number: z.string().optional(),
  house_number: z.string().optional(),
  street:z.string().optional(),
  location:z.string().optional(),
  city:z.string().optional(),
  country:z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const { user, isAuthenticated, updateUserProfile } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone_number: "",
      house_number: "",
      street:"",
      location:"",
      city:"",
      country:"",
    },
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/profile")
      return
    }

    if (user) {
      reset({
        name: user.name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        house_number: user.house_number || "",
        street:user.street||"",
        location:user.location||"",
        city:user.city||"",
        country:user.country||"",

      })
    }
  }, [isAuthenticated, user, router, reset])

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true)
    try {
      await updateUserProfile(data)
      toast.success("Profile updated successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated || !user) {
    return null // Handled by useEffect redirect
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4">
          <h2 className="font-medium">Personal Information</h2>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <input id="name" type="text" {...register("name")} className="w-full p-2 border rounded-md" />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="w-full p-2 border rounded-md bg-gray-100"
                disabled
              />
              <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium mb-1">
                Phone Number
              </label>
              <input
                id="phone_number"
                type="text"
                {...register("phone_number")}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label htmlFor="house_number" className="block text-sm font-medium mb-1">
                House Number
              </label>
              <input
                id="house_number"
                type="text"
                {...register("house_number")}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="street" className="block text-sm font-medium mb-1">
                Street
              </label>
              <input
                id="street"
                type="text"
                {...register("street")}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-1">
                Location
              </label>
              <input
                id="location"
                type="text"
                {...register("location")}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium mb-1">
                City
              </label>
              <input
                id="city"
                type="text"
                {...register("city")}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium mb-1">
                Country
              </label>
              <input
                id="country"
                type="text"
                {...register("country")}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition disabled:opacity-70"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

