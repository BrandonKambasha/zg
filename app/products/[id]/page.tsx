import { getProductById } from "../../lib/api/products"
import { getCategories } from "../../lib/api/categories"
import { notFound } from "next/navigation"
import ProductDetail from "../../components/ProductDetail"
import RelatedProducts from "../../components/RelatedProducts"
import type { Metadata } from "next"
import type { Product } from "../../Types"

interface ProductPageProps {
  params: Promise<{
    id: string
  }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const { id } = await params
    const product = await getProductById(id)

    return {
      title: `${product.name} | Zimbabwe Groceries`,
      description: product.description,
      openGraph: {
        title: `${product.name} | Zimbabwe Groceries`,
        description: product.description,
        images: product.image_url ? [product.image_url] : [],
      },
    }
  } catch (error) {
    return {
      title: "Product Not Found | Zimbabwe Groceries",
      description: "The requested product could not be found.",
    }
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  try {
    const { id } = await params

    // Fetch product details and categories
    const [product, categories] = await Promise.all([getProductById(id), getCategories()])

    // If product not found, show 404
    if (!product) {
      notFound()
    }

    // Find the category of the current product
    const category = categories.find((cat) => cat.id === product.category_id)

    // Enhance product with category information
    const enhancedProduct: Product = {
      ...product,
      category: category || undefined,
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <ProductDetail product={enhancedProduct} />

        <div className="mt-12 mb-8">
          <div className="flex items-center mb-6">
            <div className="h-1 bg-gray-200 flex-grow"></div>
            <h2 className="text-2xl font-bold px-4">You May Also Like</h2>
            <div className="h-1 bg-gray-200 flex-grow"></div>
          </div>
          <RelatedProducts categoryId={product.category_id} currentProductId={product.id} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error fetching product:", error)
    notFound()
  }
}

