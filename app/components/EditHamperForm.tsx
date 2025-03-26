"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import { Loader2, Plus, X, Minus } from "lucide-react"
import { updateHamper } from "../lib/api/hampers"
import { getCategories } from "../lib/api/categories"
import { apiBaseUrl } from "../lib/axios"
import type { Hamper, Product, HamperProduct, Category } from "../Types"

const hamperSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Price must be a positive number",
  }),
  stock_quantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Stock quantity must be a non-negative number",
  }),
  is_active: z.boolean().optional(),
  category_id: z.string().min(1, "Category is required"),
})

type HamperFormValues = z.infer<typeof hamperSchema>

interface EditHamperFormProps {
  hamper: Hamper
  products: Product[]
  onSuccess: (updatedHamper: Hamper) => void
}

export function EditHamperForm({ hamper, products, onSuccess }: EditHamperFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [keepExistingImage, setKeepExistingImage] = useState(!!hamper.image_url)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  // Initialize selectedProducts with an empty array
  const [selectedProducts, setSelectedProducts] = useState<
    Array<{ product: Product | HamperProduct; quantity: number }>
  >([])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HamperFormValues>({
    resolver: zodResolver(hamperSchema),
    defaultValues: {
      name: hamper.name,
      description: hamper.description,
      price: hamper.price.toString(),
      stock_quantity: hamper.stock_quantity.toString(),
      is_active: hamper.is_active,
      category_id: hamper.category_id ? hamper.category_id.toString() : "",
    },
  })

  // Fetch hamper categories
  useEffect(() => {
    async function fetchCategories() {
      setIsLoadingCategories(true)
      try {
        const categoriesData = await getCategories()
        // Filter categories to only include those with type 'hampers'
        const hamperCategories = categoriesData.filter((category) => category.type === "hampers") || []
        setCategories(hamperCategories)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        toast.error("Failed to load categories")
      } finally {
        setIsLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  // Initialize selected products from hamper data
  // Then in the useEffect, use the existing products directly
  useEffect(() => {
    if (hamper.products && hamper.products.length > 0) {
      const initialSelectedProducts = hamper.products.map((product) => ({
        product, // Use the full product object as is
        quantity: product.pivot.quantity,
      }))
      setSelectedProducts(initialSelectedProducts)
    }

    // Set image preview if hamper has an image
    if (hamper.image_url) {
      setImagePreviewUrl(hamper.image_url.startsWith("http") ? hamper.image_url : `${apiBaseUrl}${hamper.image_url}`)
    }
  }, [hamper])

  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          (product.description && product.description.toLowerCase().includes(term)),
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [searchTerm, products])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)
      setImagePreviewUrl(URL.createObjectURL(file))
      setKeepExistingImage(false)
    }
  }

  const removeImage = () => {
    if (imagePreviewUrl && !hamper.image_url) {
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

  const addProduct = (product: Product) => {
    if (!selectedProducts.some((item) => item.product.id === product.id)) {
      setSelectedProducts([...selectedProducts, { product, quantity: 1 }])
    }
  }

  const removeProduct = (productId: number) => {
    setSelectedProducts(selectedProducts.filter((item) => item.product.id !== productId))
  }

  const updateProductQuantity = (productId: number, quantity: number) => {
    setSelectedProducts(
      selectedProducts.map((item) =>
        item.product.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item,
      ),
    )
  }

  const onSubmit = async (data: HamperFormValues) => {
    if (selectedProducts.length === 0) {
      toast.error("Please add at least one product to the hamper")
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("_method", "PUT") // For Laravel's form method spoofing
      formData.append("name", data.name)
      formData.append("description", data.description)
      formData.append("price", data.price)
      formData.append("stock_quantity", data.stock_quantity)
      formData.append("is_active", data.is_active ? "1" : "0")
      formData.append("category_id", data.category_id)

      // Handle image
      if (keepExistingImage) {
        formData.append("keep_existing_image", "1")
      } else if (image) {
        formData.append("image", image)
      } else {
        formData.append("remove_image", "1")
      }

      // Add products
      selectedProducts.forEach((item, index) => {
        formData.append(`products[${index}][id]`, item.product.id.toString())
        formData.append(`products[${index}][quantity]`, item.quantity.toString())
      })

      const updatedHamper = await updateHamper(hamper.id.toString(), formData)
      toast.success("Hamper updated successfully")
      onSuccess(updatedHamper)
    } catch (error: any) {
      console.error("Failed to update hamper:", error)
      toast.error(error.message || "Failed to update hamper")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-medium">Edit Hamper</h2>
        <p className="text-sm text-gray-500">Update hamper information, image, and products.</p>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Hamper Name*
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
                  <option key={category.id} value={category.id.toString()}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id.message}</p>}
              {categories.length === 0 && (
                <p className="text-amber-600 text-xs mt-1">
                  No hamper categories available. Please create a category with type 'hampers' first.
                </p>
              )}
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
              <label className="block text-sm font-medium mb-1">Hamper Image</label>
              <div className="mt-2 flex flex-col sm:flex-row items-start gap-4">
                {/* Existing image */}
                {hamper.image_url && keepExistingImage && (
                  <div className="relative">
                    <div className="w-40 h-40 border rounded-md overflow-hidden">
                      <img
                        src={getFullImageUrl(hamper.image_url) || "/placeholder.svg"}
                        alt={hamper.name}
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
                {imagePreviewUrl && !keepExistingImage && (
                  <div className="relative">
                    <div className="w-40 h-40 border rounded-md overflow-hidden">
                      <img
                        src={imagePreviewUrl || "/placeholder.svg"}
                        alt="New hamper image"
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
                {!keepExistingImage && hamper.image_url && (
                  <button
                    type="button"
                    onClick={() => {
                      if (imagePreviewUrl && !hamper?.image_url?.includes(imagePreviewUrl)) {
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
              <p className="text-xs text-gray-500 mt-2">Upload a representative image for this hamper.</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Products in Hamper*</label>

              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <svg
                    className="absolute left-2 top-2.5 h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                  {filteredProducts.length === 0 ? (
                    <p className="p-3 text-gray-500 text-sm">No products found</p>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {filteredProducts.map((product) => (
                        <li
                          key={product.id}
                          className={`p-3 hover:bg-gray-50 flex justify-between items-center ${
                            selectedProducts.some((item) => item.product.id === product.id) ? "bg-teal-50" : ""
                          }`}
                        >
                          <div>
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-gray-500">${product.price}</p>
                          </div>
                          {selectedProducts.some((item) => item.product.id === product.id) ? (
                            <button
                              type="button"
                              onClick={() => removeProduct(product.id)}
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => addProduct(product)}
                              className="text-teal-600 hover:text-teal-800 text-xs"
                            >
                              Add
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {selectedProducts.length > 0 ? (
                <div className="mt-4 border border-gray-200 rounded-md p-4">
                  <h3 className="font-medium text-sm mb-2">Selected Products</h3>
                  <ul className="space-y-3">
                    {selectedProducts.map((item) => (
                      <li key={item.product.id} className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.product.name}</p>
                          <p className="text-xs text-gray-500">${item.product.price} each</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => updateProductQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateProductQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeProduct(item.product.id)}
                            className="ml-2 text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-amber-600 text-sm">Please select at least one product for the hamper</p>
              )}
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
                  Updating Hamper...
                </>
              ) : (
                "Update Hamper"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

