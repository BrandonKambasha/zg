"use client"

import { useState, useEffect } from "react"
import { getHampers, deleteHamper } from "../lib/api/hampers"
import { getProducts } from "../lib/api/products"
import { Loader2, Search, Edit, Trash2, AlertTriangle, PlusCircle, ChevronLeft } from "lucide-react"
import toast from "react-hot-toast"
import { EditHamperForm } from "./EditHamperForm"
import type { Hamper, Product } from "../Types"
import { apiBaseUrl } from "../lib/axios"

interface HamperManagementProps {
  onAddNew: () => void
}

export function HamperManagement({ onAddNew}: HamperManagementProps) {
  const [hampers, setHampers] = useState<Hamper[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredHampers, setFilteredHampers] = useState<Hamper[]>([])
  const [editingHamper, setEditingHamper] = useState<Hamper | null>(null)
  const [deletingHamper, setDeletingHamper] = useState<Hamper | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterHampers()
  }, [searchTerm, hampers])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [hampersData, productsData] = await Promise.all([getHampers(), getProducts()])
      setHampers(hampersData || [])
      setProducts(productsData || [])
    } catch (error) {
      console.error("Failed to fetch data:", error)
      toast.error("Failed to load hampers and products")
    } finally {
      setIsLoading(false)
    }
  }

  const filterHampers = () => {
    if (!searchTerm) {
      setFilteredHampers(hampers)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = hampers.filter(
      (hamper) =>
        hamper.name.toLowerCase().includes(term) ||
        (hamper.description && hamper.description.toLowerCase().includes(term)),
    )

    setFilteredHampers(filtered)
  }

  const handleDeleteHamper = async () => {
    if (!deletingHamper) return

    setIsDeleting(true)
    try {
      await deleteHamper(deletingHamper.id.toString())
      setHampers((prev) => prev.filter((h) => h.id !== deletingHamper.id))
      toast.success(`Hamper "${deletingHamper.name}" deleted successfully`)
      setDeletingHamper(null)
    } catch (error) {
      console.error("Failed to delete hamper:", error)
      toast.error("Failed to delete hamper")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditSuccess = (updatedHamper: Hamper) => {
    setHampers((prev) => prev.map((h) => (h.id === updatedHamper.id ? updatedHamper : h)))
    setEditingHamper(null)
    toast.success(`Hamper "${updatedHamper.name}" updated successfully`)
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
        <p className="ml-2">Loading hampers...</p>
      </div>
    )
  }

  if (editingHamper) {
    return (
      <div>
        <button
          onClick={() => setEditingHamper(null)}
          className="mb-4 flex items-center text-teal-600 hover:text-teal-800"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Hampers
        </button>
        <EditHamperForm hamper={editingHamper} products={products} onSuccess={handleEditSuccess} />
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
              placeholder="Search hampers..."
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
            Add Hamper
          </button>
        </div>

        {filteredHampers.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">No hampers found matching your criteria.</p>
            <button
              onClick={onAddNew}
              className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition flex items-center mx-auto"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add New Hamper
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHampers.map((hamper) => (
              <div key={hamper.id} className="border rounded-lg overflow-hidden hover:shadow-md transition">
                <div className="h-40 bg-gray-100 relative">
                  {hamper.image_url ? (
                    <img
                      src={getFullImageUrl(hamper.image_url) || "/placeholder.svg"}
                      alt={hamper.name}
                      className="w-full h-full object-cover"
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
                      <h3 className="font-medium text-gray-900">{hamper.name}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {hamper.description || "No description"}
                      </p>
                      <div className="mt-2">
                        <span className="font-bold text-teal-600">${hamper.price}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {hamper.stock_quantity > 0 ? `${hamper.stock_quantity} in stock` : "Out of stock"}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setEditingHamper(hamper)}
                        className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
                        aria-label={`Edit ${hamper.name}`}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingHamper(hamper)}
                        className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                        aria-label={`Delete ${hamper.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {hamper.products && hamper.products.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">Contains {hamper.products.length} products</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingHamper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
              <h3 className="text-lg font-medium">Confirm Deletion</h3>
            </div>
            <p className="mb-4">
              Are you sure you want to delete <span className="font-medium">{deletingHamper.name}</span>? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeletingHamper(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteHamper}
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

