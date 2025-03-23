"use client"

import { useState, useEffect } from "react"
import { getCategories, deleteCategory } from "../lib/api/categories"
import { Loader2, Search, Edit, Trash2, AlertTriangle, PlusCircle, ChevronLeft, Tag } from 'lucide-react'
import toast from "react-hot-toast"
import Image from "next/image"
import { EditCategoryForm } from "./EditCategoryForm"
import type { Category } from "../Types"
import { apiBaseUrl } from "../lib/axios"


interface CategoriesManagementProps {
  onAddNew: () => void
}

export function CategoriesManagement({
  onAddNew,
}: CategoriesManagementProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    filterCategories()
  }, [searchTerm, categories])

  const fetchCategories = async () => {
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

  const filterCategories = () => {
    if (!searchTerm) {
      setFilteredCategories(categories)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = categories.filter(
      (category) =>
        category.name.toLowerCase().includes(term) ||
        (category.description && category.description.toLowerCase().includes(term)),
    )

    setFilteredCategories(filtered)
  }

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return

    setIsDeleting(true)
    try {
      console.error("The deleting id", deletingCategory.id)
      await deleteCategory(deletingCategory.id.toString())
      setCategories((prev) => prev.filter((c) => c.id !== deletingCategory.id))
      toast.success(`Category "${deletingCategory.name}" deleted successfully`)
      setDeletingCategory(null)
    } catch (error) {
      console.error("Failed to delete category:", error)
      toast.error("Failed to delete category")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditSuccess = (updatedCategory: Category) => {
    setCategories((prev) => prev.map((c) => (c.id === updatedCategory.id ? updatedCategory : c)))
    setEditingCategory(null)
    toast.success(`Category "${updatedCategory.name}" updated successfully`)
  }

  // Function to get full image URL with API prefix
  const getFullImageUrl = (url: string | undefined): string => {
    if (!url) return "/placeholder.svg"
    return url.startsWith("http") ? url : `${apiBaseUrl}${url}`
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <p className="ml-2">Loading categories...</p>
      </div>
    )
  }

  if (editingCategory) {
    return (
      <div>
        <button
          onClick={() => setEditingCategory(null)}
          className="mb-4 flex items-center text-teal-600 hover:text-teal-800"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Categories
        </button>
        <EditCategoryForm category={editingCategory} onSuccess={handleEditSuccess} />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>

          <button
            onClick={onAddNew}
            className="bg-teal-600 text-white px-3 py-2 rounded-md hover:bg-teal-700 transition flex items-center text-sm"
          >
            <PlusCircle className="w-4 h-4 mr-1" />
            Add Category
          </button>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">No categories found matching your criteria.</p>
            <button
              onClick={onAddNew}
              className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition flex items-center mx-auto"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add New Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category) => (
              <div key={category.id} className="border rounded-lg overflow-hidden hover:shadow-md transition">
                <div className="h-40 bg-gray-100 relative">
                  {category.image_url ? (
                    <Image
                      src={getFullImageUrl(category.image_url) || "/placeholder.svg"}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      No image available
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                      <div className="flex items-center mt-1">
                        <Tag className="h-3 w-3 text-gray-500 mr-1" />
                        <span className="text-xs text-gray-500 capitalize">{category.type || "products"}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {category.description || "No description"}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setEditingCategory(category)}
                        className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
                        aria-label={`Edit ${category.name}`}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingCategory(category)}
                        className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                        aria-label={`Delete ${category.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
              <h3 className="text-lg font-medium">Confirm Deletion</h3>
            </div>
            <p className="mb-4">
              Are you sure you want to delete <span className="font-medium">{deletingCategory.name}</span>? This will
              also affect all products in this category.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCategory}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-70 flex items-center"
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