"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { searchItems, type SearchResult } from "../lib/api/search"
import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, ArrowLeft, Loader2 } from "lucide-react"
import { useCart } from "../hooks/useCart"
import toast from "react-hot-toast"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingToCart, setIsAddingToCart] = useState<Record<string, boolean>>({})
  const { addItem } = useCart()
  const [apiBaseUrl] = useState("http://192.168.0.123:8000")

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setResults([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const data = await searchItems(query)
        setResults(data)
      } catch (error) {
        console.error("Error fetching search results:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [query])

  const handleAddToCart = (result: SearchResult) => {
    if (result.type !== "product" && result.type !== "hamper") return

    const itemKey = `${result.type}-${result.id}`
    setIsAddingToCart((prev) => ({ ...prev, [itemKey]: true }))

    // Simulate a small delay for better UX
    setTimeout(() => {
      addItem(result as any, 1)
      toast.success(`${result.name} added to cart`)
      setIsAddingToCart((prev) => ({ ...prev, [itemKey]: false }))
    }, 500)
  }

  // Ensure image URLs have the API prefix
  const getFullImageUrl = (url: string | undefined): string => {
    if (!url) return "/placeholder.svg"
    return url.startsWith("http") ? url : `${apiBaseUrl}${url}`
  }

  // Group results by type
  const productResults = results.filter((result) => result.type === "product")
  const categoryResults = results.filter((result) => result.type === "category")
  const hamperResults = results.filter((result) => result.type === "hamper")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Search Results</h1>
          {query && <p className="text-gray-500 mt-1">Showing results for "{query}"</p>}
        </div>
        <Link href="/products" className="flex items-center text-teal-600 hover:text-teal-700 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 mr-2" />
          <p>Searching...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No results found</h2>
          <p className="text-gray-500 mb-6">
            We couldn't find any matches for "{query}". Please try a different search term.
          </p>
          <Link
            href="/products"
            className="inline-block bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition"
          >
            Browse All Products
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Categories Section */}
          {categoryResults.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Categories</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categoryResults.map((category) => (
                  <Link
                    key={`category-${category.id}`}
                    href={`/products?category=${category.id}`}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-4 text-center">
                      <h3 className="font-medium text-gray-800">{category.name}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Products Section */}
          {productResults.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {productResults.map((product) => (
                  <div
                    key={`product-${product.id}`}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                  >
                    <div className="relative aspect-square">
                      <Link href={`/products/${product.id}`}>
                        <Image
                          src={getFullImageUrl(product.image_url) || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </Link>
                    </div>

                    <div className="p-4">
                      <Link href={`/products/${product.id}`}>
                        <h3 className="font-medium text-gray-800 mb-1 hover:text-teal-600 transition-colors">
                          {product.name}
                        </h3>
                      </Link>

                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{product.description}</p>

                      <div className="flex items-center justify-between">
                        <span className="font-bold text-teal-600">${product.price}</span>

                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={isAddingToCart[`product-${product.id}`]}
                          className={`p-2 rounded-full transition-all transform hover:scale-110 ${
                            isAddingToCart[`product-${product.id}`]
                              ? "bg-teal-600 text-white"
                              : "bg-teal-100 text-teal-600 hover:bg-teal-600 hover:text-white"
                          }`}
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hampers Section */}
          {hamperResults.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Hampers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {hamperResults.map((hamper) => (
                  <div
                    key={`hamper-${hamper.id}`}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                  >
                    <div className="relative aspect-square">
                      <Link href={`/hampers/${hamper.id}`}>
                        <Image
                          src={getFullImageUrl(hamper.image_url) || "/placeholder.svg"}
                          alt={hamper.name}
                          fill
                          className="object-cover"
                        />
                      </Link>
                    </div>

                    <div className="p-4">
                      <Link href={`/hampers/${hamper.id}`}>
                        <h3 className="font-medium text-gray-800 mb-1 hover:text-teal-600 transition-colors">
                          {hamper.name}
                        </h3>
                      </Link>

                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{hamper.description}</p>

                      <div className="flex items-center justify-between">
                        <span className="font-bold text-teal-600">${hamper.price}</span>

                        <button
                          onClick={() => handleAddToCart(hamper)}
                          disabled={isAddingToCart[`hamper-${hamper.id}`]}
                          className={`p-2 rounded-full transition-all transform hover:scale-110 ${
                            isAddingToCart[`hamper-${hamper.id}`]
                              ? "bg-teal-600 text-white"
                              : "bg-teal-100 text-teal-600 hover:bg-teal-600 hover:text-white"
                          }`}
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

