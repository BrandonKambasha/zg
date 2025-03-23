"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { getProducts } from "../../lib/api/products"
import { getCategories } from "../../lib/api/categories"
import { getHamperById, createCustomHamper, updateCustomHamper } from "../../lib/api/hampers"
import {ShoppingCart,Loader2,ArrowLeft,Search,Plus,Minus,X,Check,Package,ShoppingBag,Filter,ChevronDown,Save,Camera,ImageIcon,Trash2,FolderHeart} from "lucide-react"
import type { Product, Category, Hamper } from "../../Types"
import useCart from "../../hooks/useCart"
import { useAuth } from "../../hooks/useAuth"
import toast from "react-hot-toast"
import { apiBaseUrl } from "../../lib/axios"


export default function BuildHamperPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editHamperId = searchParams.get("edit")
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { addItem } = useCart()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<Array<{ product: Product; quantity: number }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingHamper, setIsLoadingHamper] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [hamperName, setHamperName] = useState("My Custom Hamper")
  const [hamperDescription, setHamperDescription] = useState("Custom hamper with selected products")
  const [isSaving, setIsSaving] = useState(false)
  const [showCategoryFilter, setShowCategoryFilter] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  
  // Image upload state
  const [hamperImage, setHamperImage] = useState<File | null>(null)
  const [hamperImagePreview, setHamperImagePreview] = useState<string | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFullImageUrl = (url: string | undefined): string => {
    if (!url) {
      return "/placeholder.svg"
    }

    // Use a stable cache-busting parameter
    const cacheBuster = `?v=1`

    if (url.startsWith("http")) {
      return url + cacheBuster
    } else {
      return `${apiBaseUrl}${url}${cacheBuster}`
    }
  }

  // Refs for scrolling
  const productListRef = useRef<HTMLDivElement>(null)

  // Calculate total price
  const totalPrice = selectedProducts.reduce((sum, item) => {
    return sum + item.product.price * item.quantity
  }, 0)

  // Calculate total items
  const totalItems = selectedProducts.reduce((sum, item) => sum + item.quantity, 0)


  useEffect(() => {
    // Check if user is authenticated
    if (!authLoading && !isAuthenticated && editHamperId) {
      toast.error("Please log in to edit your hamper")
      router.push(`/login?redirect=/hampers/build?edit=${editHamperId}`)
      return
    }

    async function fetchData() {
      setIsLoading(true)
      try {
        const [productsData, categoriesData] = await Promise.all([getProducts({}), getCategories()])
        setProducts(productsData || [])
        setFilteredProducts(productsData || [])
        setCategories(categoriesData || [])

        // If in edit mode, load the hamper data
        if (editHamperId && isAuthenticated) {
          await loadHamperForEditing(editHamperId)
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast.error("Failed to load products")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [editHamperId, isAuthenticated, authLoading, router])

  const loadHamperForEditing = async (hamperId: string) => {
    setIsLoadingHamper(true)
    setIsEditMode(true)
    try {
      const hamper = await getHamperById(hamperId)

      // Check if this is the user's hamper
      if (hamper.user_id !== user?.id && !hamper.is_custom) {
        toast.error("You can only edit your own custom hampers")
        router.push("/hampers/my-hampers")
        return
      }

      // Set hamper details
      setHamperName(hamper.name)
      setHamperDescription(hamper.description || "")
      
      // Set hamper image if available
      if (hamper.image_url) {
        setExistingImageUrl(hamper.image_url)
        setHamperImagePreview(getFullImageUrl(hamper.image_url))
      }

      // Set selected products
      if (hamper.products && hamper.products.length > 0) {
        // Fetch the full product details for each product in the hamper
        const productPromises = hamper.products.map(async (hamperProduct) => {
          // Find the product in our already loaded products array
          const existingProduct = products.find((p) => p.id === hamperProduct.id)

          if (existingProduct) {
            return {
              product: existingProduct,
              quantity: hamperProduct.pivot?.quantity || 1,
            }
          }

          // If not found in our loaded products, we'll use the hamper product directly
          // but we need to ensure it has all the required fields
          return {
            product: {
              ...hamperProduct,
              created_at: hamperProduct.created_at || "",
              updated_at: hamperProduct.updated_at || "",
            } as Product,
            quantity: hamperProduct.pivot?.quantity || 1,
          }
        })

        const selectedItems = await Promise.all(productPromises)
        setSelectedProducts(selectedItems)
      }
    } catch (error) {
      console.error("Failed to load hamper for editing:", error)
      toast.error("Failed to load hamper details")
      router.push("/hampers/my-hampers")
    } finally {
      setIsLoadingHamper(false)
    }
  }

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB")
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    setHamperImage(file)
    
    // Create preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setHamperImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setHamperImage(null)
    setHamperImagePreview(null)
    setExistingImageUrl(null)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Filter products by category and search term
  useEffect(() => {
    let filtered = products

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((product) => product.category_id === selectedCategory)
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          (product.description && product.description.toLowerCase().includes(term)),
      )
    }

    setFilteredProducts(filtered)
  }, [selectedCategory, searchTerm, products])

  const handleAddProduct = (product: Product) => {
    setSelectedProducts((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      } else {
        return [...prev, { product, quantity: 1 }]
      }
    })

    toast.success(`${product.name} added to hamper`)

    // Scroll to the product list if on mobile
    if (window.innerWidth < 768) {
      setTimeout(() => {
        productListRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }

  const handleRemoveProduct = (productId: number) => {
    const productToRemove = selectedProducts.find((item) => item.product.id === productId)
    if (productToRemove) {
      setSelectedProducts((prev) => prev.filter((item) => item.product.id !== productId))
      toast.success(`${productToRemove.product.name} removed from hamper`)
    }
  }

  const handleQuantityChange = (productId: number, quantity: number) => {
    if (quantity < 1) {
      handleRemoveProduct(productId)
      return
    }

    setSelectedProducts((prev) => prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item)))
  }

  const handleSaveHamper = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to save your hamper")
      // Redirect to login page
      router.push("/login?redirect=/hampers/build")
      return
    }

    if (selectedProducts.length === 0) {
      toast.error("Please add at least one product to your hamper")
      return
    }

    setIsSaving(true)

    try {
      // Create FormData for the API request
      const formData = new FormData()
      formData.append("name", hamperName)
      formData.append("description", hamperDescription)
      formData.append("price", totalPrice.toString())
      formData.append("stock_quantity", "1") // Custom hampers have stock of 1
      formData.append("is_active", "1")
      formData.append("is_custom", "1") // Mark as custom hamper
      formData.append("user_id", user?.id.toString() || "")
      
      // Add hamper image if available
      if (hamperImage) {
        formData.append("image", hamperImage)
      } else if (existingImageUrl === null && isEditMode) {
        // If in edit mode and the existing image was removed
        formData.append("remove_image", "1")
      }

      // Add products
      selectedProducts.forEach((item, index) => {
        formData.append(`products[${index}][id]`, item.product.id.toString())
        formData.append(`products[${index}][quantity]`, item.quantity.toString())
      })

      let response
      if (isEditMode && editHamperId) {
        // Update existing hamper
        response = await updateCustomHamper(editHamperId, formData)
        toast.success("Your custom hamper has been updated!")
      } else {
        // Create new hamper
        response = await createCustomHamper(formData)
        toast.success("Your custom hamper has been saved!")
      }

      // Redirect to my hampers page
      router.push("/hampers/my-hampers")
    } catch (error: any) {
      console.error("Failed to save hamper:", error)
      toast.error(error.response?.data?.message || "Failed to save your hamper")
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddToCart = () => {
    if (selectedProducts.length === 0) {
      toast.error("Please add at least one product to your hamper")
      return
    }

    // Create a custom hamper object
    const customHamper: Hamper = {
      id: Date.now(),
      name: hamperName,
      description: hamperDescription,
      price: totalPrice,
      stock_quantity: 1,
      is_active: true,
      is_custom: true,
      image_url: hamperImagePreview || undefined,
      products: selectedProducts.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        description: item.product.description,
        price: item.product.price,
        stock_quantity: item.product.stock_quantity,
        category_id: item.product.category_id,
        image_url: item.product.image_url,
        created_at: item.product.created_at,
        updated_at: item.product.updated_at,
        weight: item.product.weight,
        dimensions: item.product.dimensions,
        is_featured: item.product.is_featured,
        pivot: {
          quantity: item.quantity,
        },
      })),
    }

    // Add the custom hamper to cart
    addItem(customHamper, 1, "hamper")

    toast.success("Custom hamper added to cart!")
    router.push("/cart")
  }

  if (authLoading && editHamperId) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (isLoading || isLoadingHamper) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      {/* Header with navigation buttons */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Link href="/hampers" className="inline-flex items-center text-teal-600 hover:text-teal-700">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Hampers
          </Link>
          
          {isAuthenticated && (
            <Link 
              href="/hampers/my-hampers" 
              className="inline-flex items-center px-3 py-1.5 bg-teal-50 text-teal-600 rounded-md hover:bg-teal-100 transition-colors"
            >
              <FolderHeart className="h-4 w-4 mr-1.5" />
              My Hampers
            </Link>
          )}
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {isEditMode ? "Edit Your Custom Hamper" : "Build Your Own Hamper"}
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          {isEditMode
            ? "Update your custom hamper with your preferred products."
            : "Select products to create your personalized gift hamper."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          {/* Search and Filter */}
          <div className="mb-4 bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                className="flex items-center text-sm text-gray-600 hover:text-teal-600"
              >
                <Filter className="h-4 w-4 mr-1.5" />
                Filter by Category
                <ChevronDown
                  className={`ml-1 h-4 w-4 transition-transform ${showCategoryFilter ? "rotate-180" : ""}`}
                />
              </button>

              <div className="text-sm text-gray-500">{filteredProducts.length} products available</div>
            </div>

            {showCategoryFilter && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                      selectedCategory === null
                        ? "bg-teal-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All Categories
                  </button>

                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                        selectedCategory === category.id
                          ? "bg-teal-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-800 mb-1">No Products Found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filter to find products for your hamper.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory(null)
                }}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                const isSelected = selectedProducts.some((item) => item.product.id === product.id)
                const selectedItem = selectedProducts.find((item) => item.product.id === product.id)

                return (
                  <div
                    key={product.id}
                    className={`bg-white rounded-lg overflow-hidden shadow-sm border transition-all ${
                      isSelected ? "border-teal-400 shadow-md" : "border-gray-100 hover:border-teal-200"
                    }`}
                  >
                    <div className="relative h-32 md:h-40 group">
                      <img
                        src={getFullImageUrl(product.image_url) || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-teal-500 text-white rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <p className="text-white font-bold text-sm">${product.price}</p>
                      </div>
                    </div>

                    <div className="p-3">
                      <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 h-8 mt-1">{product.description}</p>

                      <div className="mt-2">
                        {isSelected ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center border border-gray-200 rounded-md">
                              <button
                                onClick={() => handleQuantityChange(product.id, (selectedItem?.quantity || 1) - 1)}
                                className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="px-2 text-sm font-medium">{selectedItem?.quantity || 1}</span>
                              <button
                                onClick={() => handleQuantityChange(product.id, (selectedItem?.quantity || 1) + 1)}
                                className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemoveProduct(product.id)}
                              className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddProduct(product)}
                            className="w-full text-xs px-2 py-1.5 bg-teal-50 text-teal-600 rounded hover:bg-teal-100 flex items-center justify-center"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add to Hamper
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Hamper Summary */}
        <div className="lg:col-span-1 order-1 lg:order-2" ref={productListRef}>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sticky top-4">
            <h2 className="text-lg font-semibold mb-3">
              {isEditMode ? "Edit Your Custom Hamper" : "Your Custom Hamper"}
            </h2>
            
            {/* Hamper Image Upload */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">
                Hamper Image <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative">
                {hamperImagePreview ? (
                  <div className="relative w-full">
                    <div className="relative h-48 w-full overflow-hidden rounded-md">
                      <img 
                        src={hamperImagePreview || "/placeholder.svg"} 
                        alt="Hamper preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        className="p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                        title="Change image"
                      >
                        <Camera className="h-4 w-4 text-gray-700" />
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                        title="Remove image"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="hamper-image"
                        className="relative cursor-pointer rounded-md bg-white font-medium text-teal-600 hover:text-teal-500"
                      >
                        <span className="block">Upload an image</span>
                        <input
                          id="hamper-image"
                          name="hamper-image"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                          ref={fileInputRef}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="hamper-name" className="block text-sm text-gray-600 mb-1">
                Hamper Name
              </label>
              <input
                id="hamper-name"
                type="text"
                value={hamperName}
                onChange={(e) => setHamperName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-teal-500 focus:border-teal-500"
                placeholder="Enter a name for your hamper"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="hamper-description" className="block text-sm text-gray-600 mb-1">
                Description
              </label>
              <textarea
                id="hamper-description"
                value={hamperDescription}
                onChange={(e) => setHamperDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-teal-500 focus:border-teal-500"
                placeholder="Describe your custom hamper"
                rows={2}
              />
            </div>

            <div className="bg-teal-50 rounded-md p-3 mb-4">
              <div className="flex items-start">
                <ShoppingBag className="h-4 w-4 text-teal-600 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-xs text-gray-600">
                  Select products from the list to build your custom hamper. You can adjust quantities below.
                </p>
              </div>
            </div>

            {selectedProducts.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-md">
                <Package className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm">Your hamper is empty</p>
                <p className="text-gray-400 text-xs mt-1">Add products to get started</p>
              </div>
            ) : (
              <div className="mb-4 max-h-[300px] overflow-y-auto pr-1">
                <h3 className="font-medium text-sm text-gray-600 mb-2">Selected Products</h3>
                <ul className="space-y-2">
                  {selectedProducts.map((item) => (
                    <li key={item.product.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                      <div className="flex items-center">
                        <img
                          src={getFullImageUrl(item.product.image_url) || "/placeholder.svg"}
                          alt={item.product.name}
                          className="w-8 h-8 object-cover rounded mr-2 border border-gray-200"
                        />
                        <div>
                          <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                          <p className="text-xs text-gray-500">${item.product.price} each</p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="flex items-center border border-gray-300 rounded-md mr-2">
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                            className="px-2 py-0.5 text-gray-500 hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="px-2 text-sm">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                            className="px-2 py-0.5 text-gray-500 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveProduct(item.product.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="border-t border-gray-200 pt-3 mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Products</span>
                <span className="text-sm">{selectedProducts.length}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Total Items</span>
                <span className="text-sm">{totalItems}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total Price</span>
                <span className="text-teal-600">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {isAuthenticated ? (
              <div className="space-y-2">
                <button
                  onClick={handleSaveHamper}
                  disabled={selectedProducts.length === 0 || isSaving}
                  className={`w-full py-2.5 rounded-md font-medium flex items-center justify-center ${
                    selectedProducts.length === 0 || isSaving
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-teal-600 text-white hover:bg-teal-700"
                  }`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isEditMode ? "Updating..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      {isEditMode ? (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Update Hamper
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Hamper
                        </>
                      )}
                    </>
                  )}
                </button>

                <button
                  onClick={handleAddToCart}
                  disabled={selectedProducts.length === 0 || isSaving}
                  className={`w-full py-2.5 rounded-md font-medium flex items-center justify-center border ${
                    selectedProducts.length === 0 || isSaving
                      ? "border-gray-200 text-gray-400 cursor-not-allowed"
                      : "border-teal-600 text-teal-600 hover:bg-teal-50"
                  }`}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </button>
                
                <Link
                  href="/hampers/my-hampers"
                  className="w-full py-2.5 rounded-md font-medium flex items-center justify-center border border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  <FolderHeart className="h-4 w-4 mr-2" />
                  View My Hampers
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleAddToCart}
                  disabled={selectedProducts.length === 0}
                  className={`w-full py-2.5 rounded-md font-medium flex items-center justify-center ${
                    selectedProducts.length === 0
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-teal-600 text-white hover:bg-teal-700"
                  }`}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </button>

                <Link
                  href="/login?redirect=/hampers/build"
                  className="w-full py-2.5 rounded-md font-medium flex items-center justify-center border border-teal-600 text-teal-600 hover:bg-teal-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Login to Save Hamper
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

