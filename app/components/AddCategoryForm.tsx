"use client"

import type React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import { Loader2, Plus, X } from "lucide-react"
import { createCategory } from "../lib/api/categories"

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  is_active: z.boolean().optional(),
  type: z.enum(["products", "hampers"], {
    required_error: "Category type is required",
  }),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface AddCategoryFormProps {
  onSuccess?: () => void
}

export function AddCategoryForm({ onSuccess }: AddCategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      is_active: true,
      type: "products",
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)
      setImagePreviewUrl(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl)
    }
    setImage(null)
    setImagePreviewUrl(null)
  }

  const onSubmit = async (data: CategoryFormValues) => {
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("description", data.description)
      formData.append("is_active", data.is_active ? "1" : "0")
      formData.append("type", data.type)

      if (image) {
        formData.append("image", image)
      }

      await createCategory(formData)
      toast.success("Category added successfully")

      // Reset form
      reset()
      removeImage()

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error("Failed to add category:", error)
      toast.error(error.message || "Failed to add category")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-medium">Add New Category</h2>
        <p className="text-sm text-gray-500">Create a new category for products or hampers.</p>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Category Name*
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium mb-1">
                Category Type*
              </label>
              <select
                id="type"
                {...register("type")}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="products">Products</option>
                <option value="hampers">Hampers</option>
              </select>
              {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
            </div>

            <div className="flex items-center">
              <input
                id="is_active"
                type="checkbox"
                {...register("is_active")}
                className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                Active (visible to customers)
              </label>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description*
              </label>
              <textarea
                id="description"
                {...register("description")}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Category Image</label>
              <div className="mt-2 flex items-center gap-4">
                {imagePreviewUrl ? (
                  <div className="relative w-32 h-32 border rounded-md overflow-hidden group">
                    <img
                      src={imagePreviewUrl || "/placeholder.svg"}
                      alt="Category preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 transition-colors">
                    <Plus className="h-6 w-6 text-gray-400" />
                    <span className="text-xs text-gray-500 mt-1">Add Image</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">Upload a representative image for this category.</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition disabled:opacity-70 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Adding Category...
                </>
              ) : (
                "Add Category"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

