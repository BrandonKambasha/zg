"use client"

import { useState, useEffect } from "react"
import { getProducts, deleteProduct } from "../lib/api/products"
import { getCategories } from "../lib/api/categories"
import {
  Loader2,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
  X,
} from "lucide-react"
import toast from "react-hot-toast"
import Image from "next/image"
import { EditProductForm } from "./EditProductForm"
import type { Product, Category } from "../Types"
import { apiBaseUrl } from "../lib/axios"

interface ProductsManagementProps {
  onAddNew: () => void
}

export function ProductsManagement({ onAddNew }: ProductsManagementProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 10

  // New state for multiple selection and sorting
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "name",
    direction: "asc",
  })
  const [isMultipleDeleting, setIsMultipleDeleting] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")

  // Detect screen size
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 640) {
        setViewMode("grid")
      } else {
        setViewMode("table")
      }
    }

    // Check on initial load
    checkMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterAndSortProducts()
  }, [searchTerm, categoryFilter, products, sortConfig])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [productsData, categoriesData] = await Promise.all([getProducts(), getCategories()])
      setProducts(productsData || [])
      setCategories(categoriesData || [])
    } catch (error) {
      console.error("Failed to fetch data:", error)
      toast.error("Failed to load products and categories")
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortProducts = () => {
    let filtered = [...products]

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((product) => product.category_id.toString() === categoryFilter)
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (product) => product.name.toLowerCase().includes(term) || product.description.toLowerCase().includes(term),
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue

      switch (sortConfig.key) {
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case "price":
          aValue = Number.parseFloat(a.price.toString())
          bValue = Number.parseFloat(b.price.toString())
          break
        case "stock":
          aValue = a.stock_quantity
          bValue = b.stock_quantity
          break
        case "category":
          const aCat = categories.find((c) => c.id === a.category_id)
          const bCat = categories.find((c) => c.id === b.category_id)
          aValue = aCat?.name?.toLowerCase() || ""
          bValue = bCat?.name?.toLowerCase() || ""
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
      return 0
    })

    setFilteredProducts(filtered)
  }

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return

    setIsDeleting(true)
    try {
      await deleteProduct(deletingProduct.id.toString())
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id))
      toast.success(`Product "${deletingProduct.name}" deleted successfully`)
      setDeletingProduct(null)
    } catch (error) {
      console.error("Failed to delete product:", error)
      toast.error("Failed to delete product")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteMultipleProducts = async () => {
    if (selectedProducts.length === 0) return

    setIsMultipleDeleting(true)
    try {
      // Create an array of promises for each delete operation
      const deletePromises = selectedProducts.map((productId) => deleteProduct(productId.toString()))

      // Wait for all delete operations to complete
      await Promise.all(deletePromises)

      // Update the products state by filtering out the deleted products
      setProducts((prev) => prev.filter((p) => !selectedProducts.includes(p.id)))

      // Clear the selected products
      setSelectedProducts([])

      toast.success(`${selectedProducts.length} products deleted successfully`)
    } catch (error) {
      console.error("Failed to delete products:", error)
      toast.error("Failed to delete some products")
    } finally {
      setIsMultipleDeleting(false)
    }
  }

  const handleEditSuccess = (updatedProduct: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)))
    setEditingProduct(null)
    toast.success(`Product "${updatedProduct.name}" updated successfully`)
  }

  // Function to get full image URL with API prefix
  const getFullImageUrl = (url: string | undefined): string => {
    if (!url) return "/placeholder.svg"
    return url.startsWith("http") ? url : `${apiBaseUrl}${url}`
  }

  // Handle sort toggle
  const handleSort = (key: string) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key ? (prevConfig.direction === "asc" ? "desc" : "asc") : "asc",
    }))
  }

  // Handle checkbox selection
  const handleSelectProduct = (productId: number) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId)
      } else {
        return [...prev, productId]
      }
    })
  }

  // Handle select all products on current page
  const handleSelectAllOnPage = () => {
    const currentPageProductIds = currentProducts.map((product) => product.id)

    if (currentPageProductIds.every((id) => selectedProducts.includes(id))) {
      // If all are selected, deselect all
      setSelectedProducts((prev) => prev.filter((id) => !currentPageProductIds.includes(id)))
    } else {
      // Otherwise, select all that aren't already selected
      const newSelectedIds = currentPageProductIds.filter((id) => !selectedProducts.includes(id))
      setSelectedProducts((prev) => [...prev, ...newSelectedIds])
    }
  }

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <p className="ml-2">Loading products...</p>
      </div>
    )
  }

  if (editingProduct) {
    return (
      <div>
        <button
          onClick={() => setEditingProduct(null)}
          className="mb-4 flex items-center text-teal-600 hover:text-teal-800"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Products
        </button>
        <EditProductForm product={editingProduct} categories={categories} onSuccess={handleEditSuccess} />
      </div>
    )
  }

  // Render product card for grid view
  const renderProductCard = (product: Product) => {
    const category = categories.find((c) => c.id === product.category_id)
    const isSelected = selectedProducts.includes(product.id)

    return (
      <div
        key={product.id}
        className={`border rounded-lg overflow-hidden shadow-sm transition-all ${
          isSelected ? "border-teal-500 bg-teal-50" : "border-gray-200"
        }`}
      >
        <div className="relative">
          <div className="aspect-square bg-gray-100 relative">
            <Image
              src={getFullImageUrl(product.image_url) || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="absolute top-2 left-2">
            <input
              type="checkbox"
              className="h-5 w-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              checked={isSelected}
              onChange={() => handleSelectProduct(product.id)}
            />
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
          <div className="flex justify-between items-center mt-1">
            <span className="text-teal-600 font-bold">${Number.parseFloat(product.price.toString()).toFixed(2)}</span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Stock: {product.stock_quantity}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">{category?.name || "Unknown"}</div>
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => setEditingProduct(product)}
              className="text-blue-600 hover:text-blue-900 p-1.5 rounded-md hover:bg-blue-50"
              aria-label={`Edit ${product.name}`}
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDeletingProduct(product)}
              className="text-red-600 hover:text-red-900 p-1.5 rounded-md hover:bg-red-50"
              aria-label={`Delete ${product.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 sm:p-6">
        {/* Search and filters - Mobile optimized */}
        <div className="flex flex-col space-y-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
              aria-label="Toggle filters"
            >
              <Filter className="h-5 w-5" />
            </button>
            <button
              onClick={onAddNew}
              className="bg-teal-600 text-white p-2 rounded-md hover:bg-teal-700 transition md:hidden"
              aria-label="Add product"
            >
              <PlusCircle className="h-5 w-5" />
            </button>
          </div>

          {/* Filters section - Collapsible on mobile */}
          {showFilters && (
            <div className="flex flex-col sm:flex-row gap-3 p-3 bg-gray-50 rounded-md border border-gray-200 animate-in fade-in duration-200">
              <div className="flex-1">
                <label htmlFor="category-filter" className="block text-xs font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category-filter"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id.toString()}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label htmlFor="sort-by" className="block text-xs font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <div className="flex gap-2">
                  <select
                    id="sort-by"
                    value={sortConfig.key}
                    onChange={(e) => handleSort(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  >
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="stock">Stock</option>
                    <option value="category">Category</option>
                  </select>
                  <button
                    onClick={() =>
                      setSortConfig((prev) => ({
                        ...prev,
                        direction: prev.direction === "asc" ? "desc" : "asc",
                      }))
                    }
                    className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100"
                    aria-label={`Sort ${sortConfig.direction === "asc" ? "descending" : "ascending"}`}
                  >
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </button>
                </div>
              </div>
              <div className="flex-1 hidden sm:block">
                <label className="block text-xs font-medium text-gray-700 mb-1 opacity-0">Action</label>
                <button
                  onClick={onAddNew}
                  className="bg-teal-600 text-white px-3 py-2 rounded-md hover:bg-teal-700 transition flex items-center text-sm whitespace-nowrap w-full justify-center"
                >
                  <PlusCircle className="w-4 h-4 mr-1" />
                  Add Product
                </button>
              </div>
            </div>
          )}

          {/* Desktop Add Product button */}
          <div className="hidden sm:flex justify-end">
            {!showFilters && (
              <button
                onClick={onAddNew}
                className="bg-teal-600 text-white px-3 py-2 rounded-md hover:bg-teal-700 transition flex items-center text-sm whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4 mr-1" />
                Add Product
              </button>
            )}
          </div>
        </div>

        {/* View mode toggle for mobile/tablet */}
        <div className="sm:hidden mb-3 flex justify-end">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 text-xs font-medium rounded-l-lg border ${
                viewMode === "table"
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 text-xs font-medium rounded-r-lg border ${
                viewMode === "grid"
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Grid
            </button>
          </div>
        </div>

        {currentProducts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">No products found matching your criteria.</p>
            <button
              onClick={onAddNew}
              className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition flex items-center mx-auto"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add New Product
            </button>
          </div>
        ) : (
          <>
            {/* Bulk action bar */}
            {selectedProducts.length > 0 && (
              <div className="mb-4 flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200 sticky top-0 z-10">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">{selectedProducts.length}</span> products selected
                </div>
                <button
                  onClick={handleDeleteMultipleProducts}
                  disabled={isMultipleDeleting}
                  className="bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 transition flex items-center text-sm disabled:opacity-70"
                >
                  {isMultipleDeleting ? (
                    <>
                      <Loader2 className="animate-spin h-3.5 w-3.5 mr-1.5" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      Delete Selected
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Grid view for mobile */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {currentProducts.map((product) => renderProductCard(product))}
              </div>
            )}

            {/* Table view */}
            {viewMode === "table" && (
              <div className="overflow-x-auto -mx-4 sm:-mx-6">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-3 py-3 text-left">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                              checked={
                                currentProducts.length > 0 &&
                                currentProducts.every((product) => selectedProducts.includes(product.id))
                              }
                              onChange={handleSelectAllOnPage}
                            />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("name")}
                        >
                          <div className="flex items-center">
                            Product
                            <ArrowUpDown
                              className={`ml-1 h-4 w-4 ${
                                sortConfig.key === "name" ? "text-teal-600" : "text-gray-400"
                              }`}
                            />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell cursor-pointer"
                          onClick={() => handleSort("category")}
                        >
                          <div className="flex items-center">
                            Category
                            <ArrowUpDown
                              className={`ml-1 h-4 w-4 ${
                                sortConfig.key === "category" ? "text-teal-600" : "text-gray-400"
                              }`}
                            />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("price")}
                        >
                          <div className="flex items-center">
                            Price
                            <ArrowUpDown
                              className={`ml-1 h-4 w-4 ${
                                sortConfig.key === "price" ? "text-teal-600" : "text-gray-400"
                              }`}
                            />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell cursor-pointer"
                          onClick={() => handleSort("stock")}
                        >
                          <div className="flex items-center">
                            Stock
                            <ArrowUpDown
                              className={`ml-1 h-4 w-4 ${
                                sortConfig.key === "stock" ? "text-teal-600" : "text-gray-400"
                              }`}
                            />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentProducts.map((product) => {
                        const category = categories.find((c) => c.id === product.category_id)
                        const isSelected = selectedProducts.includes(product.id)

                        return (
                          <tr key={product.id} className={isSelected ? "bg-teal-50" : ""}>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                                checked={isSelected}
                                onChange={() => handleSelectProduct(product.id)}
                              />
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0 mr-3 bg-gray-100 rounded-md overflow-hidden">
                                  {product.image_url ? (
                                    <Image
                                      src={getFullImageUrl(product.image_url) || "/placeholder.svg"}
                                      alt={product.name}
                                      width={40}
                                      height={40}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                                      No img
                                    </div>
                                  )}
                                </div>
                                <div className="ml-2 max-w-[120px] sm:max-w-none">
                                  <div className="text-sm font-medium text-gray-900 truncate">{product.name}</div>
                                  <div className="text-xs text-gray-500 sm:hidden truncate">
                                    {category?.name || "Unknown"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                              {category?.name || "Unknown"}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ${Number.parseFloat(product.price.toString()).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                              {product.stock_quantity}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setEditingProduct(product)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                  aria-label={`Edit ${product.name}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setDeletingProduct(product)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                  aria-label={`Delete ${product.name}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination - Mobile optimized */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 px-2 sm:px-6">
                <div className="flex items-center justify-center sm:justify-start w-full sm:w-auto">
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
                <div className="flex items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center w-10 h-10 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Show pages around current page
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 text-sm font-medium rounded-md ${
                            currentPage === pageNum
                              ? "bg-teal-600 text-white"
                              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center w-10 h-10 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal - Mobile optimized */}
      {deletingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-2 flex-shrink-0" />
              <h3 className="text-lg font-medium">Confirm Deletion</h3>
            </div>
            <p className="mb-4">
              Are you sure you want to delete <span className="font-medium">{deletingProduct.name}</span>? This action
              cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-70 flex items-center justify-center order-1 sm:order-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
