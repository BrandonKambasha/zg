"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getHamperById, getHampers } from "../../lib/api/hampers"
import {
  ShoppingCart,
  ChevronLeft,
  Minus,
  Plus,
  Check,
  Truck,
  Package,
  Info,
  Gift,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import type { Hamper } from "../../Types"
import useCart from "../../hooks/useCart"
import toast from "react-hot-toast"
import { apiBaseUrl } from "../../lib/axios"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function HamperDetailPage() {
  const params = useParams()
  const router = useRouter()
  const hamperId = params.id as string

  const [hamper, setHamper] = useState<Hamper | null>(null)
  const [similarHampers, setSimilarHampers] = useState<Hamper[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [showAllProducts, setShowAllProducts] = useState(false)
  const { addHamper } = useCart()

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const data = await getHamperById(hamperId)
        setHamper(data)

        // Fetch all hampers for similar hampers section
        const allHampers = await getHampers()

        // Filter out current hamper and get similar ones
        // Similar can be defined by same category or random if no category
        const filtered = allHampers.filter((h) => h.id !== data.id)
        let similar: Hamper[] = []

        if (data.category_id) {
          // Get hampers with same category first
          similar = filtered.filter((h) => h.category_id === data.category_id)
        }

        // If we don't have enough similar hampers by category, add some random ones
        if (similar.length < 5) {
          const randomHampers = filtered
            .filter((h) => !similar.some((s) => s.id === h.id))
            .sort(() => 0.5 - Math.random())
            .slice(0, 5 - similar.length)

          similar = [...similar, ...randomHampers]
        }

        // Limit to 5 similar hampers
        setSimilarHampers(similar.slice(0, 5))
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (hamperId) {
      fetchData()
    }
  }, [hamperId])

  // Function to get full image URL with API prefix
  const getFullImageUrl = (url: string | undefined): string => {
    if (!url) return "/placeholder.svg"
    return url.startsWith("http") ? url : `${apiBaseUrl}${url}`
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const increaseQuantity = () => {
    if (hamper && quantity < (hamper.stock_quantity || 10)) {
      setQuantity(quantity + 1)
    }
  }

  const handleAddToCart = () => {
    if (!hamper) return

    if (hamper.stock_quantity <= 0) {
      toast.error("This hamper is out of stock")
      return
    }

    setIsAddingToCart(true)

    // Simulate a small delay for better UX
    setTimeout(() => {
      addHamper(hamper, quantity)
      toast.success(`${quantity} ${quantity === 1 ? "item" : "items"} of ${hamper.name} added to cart`)
      setIsAddingToCart(false)
    }, 500)
  }

  // Function to handle clicking on a product in the hamper
  const handleProductClick = (productId: string | number) => {
    // Navigate to the product detail page
    router.push(`/products/${productId}`)
  }

  // Toggle showing all products
  const toggleShowAllProducts = () => {
    setShowAllProducts(!showAllProducts)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600 mr-2"></div>
        <p>Loading hamper details...</p>
      </div>
    )
  }

  if (!hamper) {
    return (
      <div className="container mx-auto px-4 py-12 text-center min-h-[60vh]">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Hamper Not Found</h1>
        <p className="text-gray-600 mb-6">The hamper you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => router.push("/hampers")}
          className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition"
        >
          View All Hampers
        </button>
      </div>
    )
  }

  // Determine which products to show based on the toggle state
  const visibleProducts = showAllProducts ? hamper.products : hamper.products?.slice(0, 2)

  // Calculate if there are more products to show
  const hasMoreProducts = hamper.products && hamper.products.length > 2
  const hiddenProductsCount = hamper.products ? hamper.products.length - 2 : 0

  return (
    <div className="container mx-auto px-4 py-6">
      <button
        onClick={() => router.push("/hampers")}
        className="flex items-center text-teal-600 hover:text-teal-800 mb-4 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Hampers
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Hamper Image (Smaller) */}
        <div className="lg:col-span-5">
          <div className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-white max-w-md mx-auto">
            <img
              src={getFullImageUrl(hamper.image_url) || "/placeholder.svg"}
              alt={hamper.name}
              className="w-full h-full object-cover"
            />

            {/* Only showing Out of Stock badge as requested */}
            {hamper.stock_quantity === 0 && (
              <Badge variant="outline" className="absolute top-4 left-4 bg-red-100 text-red-800 border-red-200">
                Out of Stock
              </Badge>
            )}
          </div>
        </div>

        {/* Middle Column - Product Info and Tabs */}
        <div className="lg:col-span-7 space-y-4">
          {/* Hamper Title and Badges */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                <Gift className="h-3 w-3 mr-1" />
                Gift Hamper
              </Badge>
              {hamper.stock_quantity > 0 && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Check className="h-3 w-3 mr-1" />
                  In Stock
                </Badge>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">{hamper.name}</h1>
          </div>

          {/* Price and Shipping */}
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-teal-600">${hamper.price}</span>
            {hamper.price > 100 && (
              <div className="flex items-center text-green-600 text-sm">
                <Truck className="h-4 w-4 mr-1" />
                <span>Free shipping</span>
              </div>
            )}
          </div>

          {/* Short Description */}
          <p className="text-gray-600 leading-relaxed line-clamp-2">{hamper.description}</p>

          {/* Add to Cart Section */}
          <div className="bg-gray-50 p-4 rounded-lg flex flex-wrap items-center gap-4">
            {/* Quantity Selector */}
            <div className="flex items-center">
              <span className="font-medium mr-3">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-md bg-white">
                <button
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="px-3 py-2 text-gray-600 hover:text-teal-600 disabled:text-gray-300 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.max(1, Math.min(Number.parseInt(e.target.value) || 1, hamper.stock_quantity || 10)),
                    )
                  }
                  className="w-12 text-center border-none focus:ring-0 bg-white"
                  min="1"
                  max={hamper.stock_quantity || 10}
                  aria-label="Quantity"
                />
                <button
                  onClick={increaseQuantity}
                  disabled={quantity >= (hamper.stock_quantity || 10)}
                  className="px-3 py-2 text-gray-600 hover:text-teal-600 disabled:text-gray-300 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={hamper.stock_quantity === 0 || isAddingToCart}
              className={`flex-1 flex items-center justify-center px-6 py-3 rounded-md font-medium ${
                hamper.stock_quantity === 0
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : isAddingToCart
                    ? "bg-teal-700 text-white"
                    : "bg-teal-600 text-white hover:bg-teal-700 transition-colors"
              }`}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {hamper.stock_quantity === 0 ? "Out of Stock" : isAddingToCart ? "Adding..." : "Add to Cart"}
            </button>
          </div>

          {/* Tabs Section */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-3">Product Information</h2>
            <Tabs defaultValue="contents" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="contents" className="flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Hamper Contents
                </TabsTrigger>
                <TabsTrigger value="details" className="flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Details
                </TabsTrigger>
              </TabsList>

              <TabsContent value="contents" className="space-y-4">
                {hamper.products && hamper.products.length > 0 ? (
                  <div className="space-y-3">
                    {/* Show only the first 2 products initially */}
                    {visibleProducts?.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product.id)}
                        className="border border-gray-200 rounded-lg hover:border-teal-500 hover:shadow-sm transition-all cursor-pointer"
                      >
                        <div className="flex items-center p-3">
                          <div className="w-16 h-16 rounded-md bg-gray-100 flex-shrink-0 mr-3">
                            <img
                              src={
                                product.image_url
                                  ? getFullImageUrl(product.image_url)
                                  : "/placeholder.svg?height=64&width=64&query=gift product"
                              }
                              alt={product.name}
                              className="w-full h-full object-cover rounded-md"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium text-sm mb-1 truncate">{product.name}</h3>
                              <div className="flex items-center">
                                {product.pivot.quantity > 1 && (
                                  <Badge variant="outline" className="mr-2 text-xs">
                                    {product.pivot.quantity}x
                                  </Badge>
                                )}
                                <span className="font-medium text-teal-600">
                                  ${product.price ? product.price : "0.00"}
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                              {product.stock_quantity !== undefined && (
                                <span
                                  className={`text-xs ${product.stock_quantity > 5 ? "text-green-600" : product.stock_quantity > 0 ? "text-amber-600" : "text-red-600"}`}
                                >
                                  {product.stock_quantity > 5
                                    ? "In Stock"
                                    : product.stock_quantity > 0
                                      ? `Only ${product.stock_quantity} left`
                                      : "Out of Stock"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Show/Hide More Products Button */}
                    {hasMoreProducts && (
                      <Button
                        variant="outline"
                        onClick={toggleShowAllProducts}
                        className="w-full flex items-center justify-center gap-2 text-teal-600 border-teal-200 hover:bg-teal-50"
                      >
                        {showAllProducts ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            Show {hiddenProductsCount} More Items
                          </>
                        )}
                      </Button>
                    )}

                    {/* Total value section */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Value:</span>
                        <span className="font-bold text-teal-600">
                          $
                          {hamper.products
                            .reduce((total, product) => {
                              const productPrice = product.price || 0
                              const quantity = product.pivot?.quantity || 1
                              return total + productPrice * quantity
                            }, 0)
                            .toFixed(2)}
                        </span>
                      </div>
                      {hamper.price <
                        hamper.products.reduce((total, product) => {
                          const productPrice = product.price || 0
                          const quantity = product.pivot?.quantity || 1
                          return total + productPrice * quantity
                        }, 0) && (
                        <div className="flex justify-between items-center mt-2 text-sm">
                          <span className="text-green-600">You Save:</span>
                          <span className="font-medium text-green-600">
                            $
                            {(
                              hamper.products.reduce((total, product) => {
                                const productPrice = product.price || 0
                                const quantity = product.pivot?.quantity || 1
                                return total + productPrice * quantity
                              }, 0) - hamper.price
                            ).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No product information available for this hamper.</p>
                )}
              </TabsContent>

              <TabsContent value="details">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">DESCRIPTION</h3>
                        <p className="text-gray-700 mt-1">{hamper.description}</p>
                      </div>

                      <div>
                        <h3 className="font-medium text-sm text-gray-500">PACKAGING</h3>
                        <p className="text-gray-700 mt-1">
                          Our hampers come in premium gift packaging, perfect for presenting to your loved ones or
                          colleagues.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">DELIVERY INFORMATION</h3>
                        <ul className="mt-1 space-y-1 text-gray-700">
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-teal-600 mr-2 flex-shrink-0 mt-0.5" />
                            <span>Standard delivery: 3-5 business days</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-teal-600 mr-2 flex-shrink-0 mt-0.5" />
                            <span>Express delivery available at checkout</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-teal-600 mr-2 flex-shrink-0 mt-0.5" />
                            <span>Free shipping on orders over $100</span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-medium text-sm text-gray-500">RETURNS</h3>
                        <p className="text-gray-700 mt-1">
                          Due to the nature of our products, we cannot accept returns unless the product is damaged upon
                          arrival.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* You May Also Like Section - Now using real hampers */}
      {similarHampers.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">You May Also Like</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {similarHampers.map((similarHamper) => (
              <div
                key={similarHamper.id}
                className="group cursor-pointer"
                onClick={() => router.push(`/hampers/${similarHamper.id}`)}
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
                  <img
                    src={getFullImageUrl(similarHamper.image_url) || "/placeholder.svg"}
                    alt={similarHamper.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-medium text-sm text-gray-900 group-hover:text-teal-600 transition-colors truncate">
                  {similarHamper.name}
                </h3>
                <p className="text-teal-600 font-medium text-sm">${similarHamper.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
