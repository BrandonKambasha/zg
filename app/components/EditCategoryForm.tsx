"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import { Loader2, Plus, X } from 'lucide-react'
import { updateCategory } from "../lib/api/categories"
import type { Category } from "../Types"
import Image from "next/image"
import { apiBaseUrl } from "../lib/axios"


const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  is_active: z.boolean().optional(),
  type: z.string().refine(val => ['products', 'hampers'].includes(val), {
    message: "Type must be either 'products' or 'hampers'"
  }),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface EditCategoryFormProps {
  category: Category
  onSuccess: (updatedCategory: Category) => void
}

export function EditCategoryForm({ category, onSuccess }: EditCategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [keepExistingImage, setKeepExistingImage] = useState(!!category.image_url)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category.name,
      description: category.description || "",
      is_active: category.is_active,
      type: category.type || "products",
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)
      setImagePreviewUrl(URL.createObjectURL(file))
      setKeepExistingImage(false)
    }
  }

  const removeImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl)
    }
    setImage(null)
    setImagePreviewUrl(null)
    setKeepExistingImage(false)
  }

  // Function to get full image URL with API prefix
  const getFullImageUrl = (url: string | undefined): string => {
    if (!url) return "/placeholder.svg"
    return url.startsWith("http") ? url : `${apiBaseUrl}${url}`
  }

  const onSubmit = async (data: CategoryFormValues) => {
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("_method", "PUT") // For Laravel's form method spoofing
      formData.append("name", data.name)
      formData.append("description", data.description)
      formData.append("is_active", data.is_active ? "1" : "0")
      formData.append("type", data.type)

      // Handle image
      if (keepExistingImage) {
        formData.append("keep_existing_image", "1")
      } else if (image) {
        formData.append("image", image)
      } else {
        formData.append("remove_image", "1")
      }

      const updatedCategory = await updateCategory(category.id.toString(), formData)
      toast.success("Category updated successfully")
      onSuccess(updatedCategory)
    } catch (error: any) {
      console.error("Failed to update category:", error)
      toast.error(error.message || "Failed to update category")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-medium">Edit Category</h2>
        <p className="text-sm text-gray-500">Update category information and image.</p>
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
              <div className="mt-2 flex flex-col sm:flex-row items-start gap-4">
                {/* Existing image */}
                {category.image_url && keepExistingImage && (
                  <div className="relative">
                    <div className="w-40 h-40 border rounded-md overflow-hidden">
                      <Image
                        src={getFullImageUrl(category.image_url) || "/placeholder.svg"}
                        alt={category.name}
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setKeepExistingImage(false)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <p className="text-xs text-gray-500 mt-1">Current image</p>
                  </div>
                )}

                {/* New image preview */}
                {imagePreviewUrl && (
                  <div className="relative">
                    <div className="w-40 h-40 border rounded-md overflow-hidden">
                      <img
                        src={imagePreviewUrl || "/placeholder.svg"}
                        alt="New category image"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <p className="text-xs text-gray-500 mt-1">New image</p>
                  </div>
                )}

                {/* Image upload button */}
                {!keepExistingImage && !imagePreviewUrl && (
                  <div>
                    <label className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 transition-colors">
                      <Plus className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-500 mt-2">Add Image</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">Upload a new image</p>
                  </div>
                )}

                {/* Option to revert to existing image */}
                {!keepExistingImage && category.image_url && (
                  <button
                    type="button"
                    onClick={() => {
                      if (imagePreviewUrl) {
                        URL.revokeObjectURL(imagePreviewUrl)
                      }
                      setImage(null)
                      setImagePreviewUrl(null)
                      setKeepExistingImage(true)
                    }}
                    className="text-teal-600 hover:text-teal-800 text-sm mt-2"
                  >
                    Revert to existing image
                  </button>
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
                  Updating Category...
                </>
              ) : (
                "Update Category"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}