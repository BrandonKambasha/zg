"use client"

import { useEffect, useState } from "react"
import { getProducts } from "../lib/api/products"
import ProductGrid from "@/app/components/ProductGrid"
import { Loader2 } from "lucide-react"
import type { Product } from "../Types"

interface RelatedProductsProps {
  categoryId: number
  currentProductId: number
}

export default function RelatedProducts({ categoryId, currentProductId }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchRelatedProducts() {
      setIsLoading(true)
      try {
        // Fetch products from the same category
        const data = await getProducts({ categoryId })

        // Filter out the current product and limit to 4 products
        const relatedProducts = data.filter((product) => product.id !== currentProductId).slice(0, 4)

        setProducts(relatedProducts)
      } catch (error) {
        console.error("Failed to fetch related products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRelatedProducts()
  }, [categoryId, currentProductId])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <p className="ml-2">Loading related products...</p>
      </div>
    )
  }

  if (products.length === 0) {
    return null
  }

  return <ProductGrid products={products} />
}

