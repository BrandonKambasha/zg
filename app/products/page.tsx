import Link from "next/link"
import { ChevronRight, ShoppingBasket, Filter, Warehouse, ShoppingBag, Search } from "lucide-react"
import ProductGrid from "../components/ProductGrid"
import ProductFilters from "../components/ProductFilters"
import { getProducts } from "../lib/api/products"
import { getCategories } from "../lib/api/categories"
import type { Product, Category } from "../Types"
import ProductSort from "../components/ProductSort"

interface SearchParams {
  category?: string
  query?: string
  minPrice?: string
  maxPrice?: string
  rating?: string
  sort?: string
}

interface ProductsPageProps {
  searchParams: SearchParams
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // Get all filter parameters from URL
  const categoryId = typeof searchParams.category === "string" ? Number.parseInt(searchParams.category) : undefined
  const query = typeof searchParams.query === "string" ? searchParams.query : undefined
  const minPrice = typeof searchParams.minPrice === "string" ? Number.parseInt(searchParams.minPrice) : undefined
  const maxPrice = typeof searchParams.maxPrice === "string" ? Number.parseInt(searchParams.maxPrice) : undefined
  const rating = typeof searchParams.rating === "string" ? Number.parseInt(searchParams.rating) : undefined
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : undefined

  // Fetch products with all filter parameters
  const [productsData, categoriesData] = await Promise.all([
    getProducts({
      categoryId,
      query,
      minPrice,
      maxPrice,
      rating,
      sort,
    }),
    getCategories(),
  ])

  const products: Product[] = productsData || []
  const categories: Category[] = categoriesData || []

  return (
    <div >
      {/* Compact Banner Section */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Shop Our Products</h1>
              <p className="text-teal-100 text-sm md:text-base">
                Quality Zimbabwean groceries delivered to your loved ones
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Link
                href="/categories"
                className="inline-flex items-center text-sm font-medium px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors"
              >
                <Search className="h-4 w-4 mr-2" />
                Browse Categories
              </Link>
              <Link
                href="/hampers"
                className="inline-flex items-center text-sm font-medium px-4 py-2 bg-white text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Shop Hampers
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Desktop Header */}
        <div className="hidden md:flex md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold">All Products</h2>
            <div className="h-6 w-px bg-gray-300"></div>

            {/* Desktop Special Buttons */}
            <div className="flex space-x-3">
              {/* Hampers Link */}
              <Link
                href="/hampers"
                className="inline-flex items-center text-sm font-medium px-3.5 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 transition-colors shadow-sm group"
              >
                <ShoppingBasket className="h-4 w-4 mr-2" />
                <div className="flex flex-col items-start">
                  <span className="leading-tight">Hampers</span>
                  <span className="text-xs text-teal-100 font-normal leading-tight">
                    Buy ready-made or build your own
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 ml-2 transform group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {/* Wholesale Link */}
              <Link
                href="/wholesale"
                className="inline-flex items-center text-sm font-medium px-3.5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors shadow-sm group"
              >
                <Warehouse className="h-4 w-4 mr-2" />
                <div className="flex flex-col items-start">
                  <span className="leading-tight">Wholesale</span>
                  <span className="text-xs text-blue-100 font-normal leading-tight">
                    Bulk orders at discount prices
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 ml-2 transform group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Desktop product count and sort */}
          <div className="flex items-center space-x-4">
            <p className="text-gray-500">{products.length} products found</p>
            <ProductSort currentSort={sort || "featured"} />
          </div>
        </div>

        {/* Improved Mobile Header Layout */}
        <div className="md:hidden">
          {/* Title Row */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">All Products</h2>
          </div>

          {/* Special Buttons Row */}
          <div className="flex items-center space-x-2 mb-4">
            <Link
              href="/hampers"
              className="flex-1 inline-flex items-center justify-center text-xs font-medium px-2 py-1.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg shadow-sm"
            >
              <ShoppingBasket className="h-3.5 w-3.5 mr-1.5" />
              <span>Buy/Build Hampers</span>
            </Link>

            <Link
              href="/wholesale"
              className="flex-1 inline-flex items-center justify-center text-xs font-medium px-2 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-sm"
            >
              <Warehouse className="h-3.5 w-3.5 mr-1.5" />
              <span>Wholesale</span>
            </Link>
          </div>

          {/* Product Count, Filter and Sort in one row */}
          <div className="flex items-center justify-between mb-5 bg-gray-50 rounded-lg p-2.5">
            <p className="text-sm text-gray-500">{products.length} products found</p>

            <div className="flex items-center space-x-2">
              {/* Mobile Filter Button - ID is important for ProductFilters to find it */}
              <button
                id="mobile-filter-button"
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm"
                aria-label="Open filters"
              >
                <Filter className="h-3.5 w-3.5 text-gray-600" />
                <span>Filters</span>
              </button>

              {/* Mobile Sort Button */}
              <ProductSort currentSort={sort || "featured"} isMobile={true} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
          {/* ProductFilters - This component handles both desktop and mobile views */}
          <div className="lg:col-span-1">
            <ProductFilters
              categories={categories}
              selectedCategory={categoryId}
              minPrice={minPrice}
              maxPrice={maxPrice}
              initialQuery={query || ""}
            />
          </div>

          <div className="lg:col-span-3">
            {products.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No products found.</p>
                <Link
                  href="/products"
                  className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors inline-block"
                >
                  Clear Filters
                </Link>
              </div>
            ) : (
              <ProductGrid products={products} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

