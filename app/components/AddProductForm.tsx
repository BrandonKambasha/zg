"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import { Loader2, Plus, X } from "lucide-react"
import { getCategories } from "../lib/api/categories"
import { createProduct } from "../lib/api/products"
import type { Category } from "../Types"

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Price must be a positive number",
  }),
  stock_quantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Stock quantity must be a non-negative number",
  }),
  category_id: z.string().min(1, "Please select a category"),
  weight: z.string().optional(),
  dimensions: z.string().optional(),
  is_featured: z.boolean().optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

interface AddProductFormProps {
  onSuccess?: () => void
}

export function AddProductForm({ onSuccess}: AddProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      stock_quantity: "",
      category_id: "",
      weight: "",
      dimensions: "",
      is_featured: false,
    },
  })

  useEffect(() => {
    async function fetchCategories() {
      setIsLoading(true)
      try {
        const data = await getCategories()
        setCategories(data || [])
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        toast.error("Failed to load categories")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)

      // Create preview URLs for the new images
      const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file))

      setImages((prev) => [...prev, ...newFiles])
      setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls])
    }
  }

  const removeImage = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index])

    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true)

    try {
      // Convert string values to numbers where needed
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("description", data.description)
      formData.append("price", data.price)
      formData.append("stock_quantity", data.stock_quantity)
      formData.append("category_id", data.category_id)

      if (data.weight) formData.append("weight", data.weight)
      if (data.dimensions) formData.append("dimensions", data.dimensions)
      formData.append("is_featured", data.is_featured ? "1" : "0")

      // Append images
      images.forEach((image, index) => {
        formData.append(`images[${index}]`, image)
      })

      await createProduct(formData)
      toast.success("Product added successfully")

      // Reset form
      reset()
      setImages([])
      setImagePreviewUrls([])

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error("Failed to add product:", error)

      // Check if it's a validation error (422) and specifically related to images
      if (error.response?.status === 422) {
        const errorData = error.response?.data

        // Check if there are validation errors related to images
        const hasImageErrors =
          errorData?.errors &&
          Object.keys(errorData.errors).some((key) => key.includes("image") || key.includes("images"))

        if (hasImageErrors) {
          // Extract and format image-specific error messages
          const imageErrorMessages = Object.entries(errorData.errors)
            .filter(([key]) => key.includes("image") || key.includes("images"))
            .map(([key, messages]) => (Array.isArray(messages) ? messages.join(", ") : messages))
            .join(". ")

          toast.error(
            `Image upload failed: ${imageErrorMessages || "Invalid image format or size (max 2MB, formats: jpeg, png, jpg, gif, webp, avif)"}`,
          )
        } else {
          // General validation error
          toast.error(errorData?.message || "Failed to add product due to validation errors")
        }
      } else {
        // Other types of errors
        toast.error(error.message || "Failed to add product")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <p className="ml-2">Loading categories...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Product Name*
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
              <label htmlFor="category_id" className="block text-sm font-medium mb-1">
                Category*
              </label>
              <select
                id="category_id"
                {...register("category_id")}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id.message}</p>}
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-1">
                Price ($)*
              </label>
              <input
                id="price"
                type="text"
                {...register("price")}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <label htmlFor="stock_quantity" className="block text-sm font-medium mb-1">
                Stock Quantity*
              </label>
              <input
                id="stock_quantity"
                type="text"
                {...register("stock_quantity")}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {errors.stock_quantity && <p className="text-red-500 text-sm mt-1">{errors.stock_quantity.message}</p>}
            </div>

            <div>
              <label htmlFor="weight" className="block text-sm font-medium mb-1">
                Weight (kg)
              </label>
              <input
                id="weight"
                type="text"
                {...register("weight")}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label htmlFor="dimensions" className="block text-sm font-medium mb-1">
                Dimensions (LxWxH)
              </label>
              <input
                id="dimensions"
                type="text"
                {...register("dimensions")}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., 10x5x2 cm"
              />
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
              <label className="block text-sm font-medium mb-1">Product Images</label>
              <div className="mt-2 flex flex-wrap gap-4">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative w-24 h-24 border rounded-md overflow-hidden group">
                    <img
                      src={url || "/placeholder.svg"}
                      alt={`Preview ${index}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 transition-colors">
                  <Plus className="h-6 w-6 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">Add Image</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Upload up to 5 images. First image will be the main product image.
              </p>
            </div>

            <div className="flex items-center">
              <input
                id="is_featured"
                type="checkbox"
                {...register("is_featured")}
                className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-700">
                Feature this product on the homepage
              </label>
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
                  Adding Product...
                </>
              ) : (
                "Add Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

