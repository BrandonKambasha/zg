"use client"

import { useState } from "react"
import { AddProductForm } from "./AddProductForm"
import { AddCategoryForm } from "./AddCategoryForm"
import { ManageOrdersPanel } from "./ManageOrdersPanel"
import { ProductsManagement } from "./ProductsManagement"
import { CategoriesManagement } from "./CategoriesManagement"
import { HamperManagement } from "./HamperManagement"
import { AddHamperForm } from "./AddHamperForm"
import { NewsletterSubscribersManagement } from "./NewsletterSubscribersManagement"
import { PlusCircle, List, Mail } from "lucide-react"

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState("products")
  const [activeProductView, setActiveProductView] = useState<"list" | "add">("list")
  const [activeCategoryView, setActiveCategoryView] = useState<"list" | "add">("list")
  const [activeHamperView, setActiveHamperView] = useState<"list" | "add">("list")

  return (
    <div>
      <div className="border-b border-gray-200 mb-6 overflow-x-auto">
        <nav className="flex -mb-px min-w-max">
          <button
            onClick={() => setActiveTab("products")}
            className={`py-4 px-6 font-medium text-sm whitespace-nowrap border-b-2 ${
              activeTab === "products"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`py-4 px-6 font-medium text-sm whitespace-nowrap border-b-2 ${
              activeTab === "categories"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab("hampers")}
            className={`py-4 px-6 font-medium text-sm whitespace-nowrap border-b-2 ${
              activeTab === "hampers"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Hampers
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`py-4 px-6 font-medium text-sm whitespace-nowrap border-b-2 ${
              activeTab === "orders"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab("newsletter")}
            className={`py-4 px-6 font-medium text-sm whitespace-nowrap border-b-2 ${
              activeTab === "newsletter"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Newsletter
          </button>
        </nav>
      </div>

      {activeTab === "products" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xl font-medium">Manage Products</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveProductView("list")}
                className={`px-3 py-2 text-sm rounded-md flex items-center ${
                  activeProductView === "list"
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <List className="w-4 h-4 mr-1" />
                View Products
              </button>
              <button
                onClick={() => setActiveProductView("add")}
                className={`px-3 py-2 text-sm rounded-md flex items-center ${
                  activeProductView === "add" ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <PlusCircle className="w-4 h-4 mr-1" />
                Add Product
              </button>
            </div>
          </div>

          {activeProductView === "list" ? (
            <ProductsManagement onAddNew={() => setActiveProductView("add")} />
          ) : (
            <AddProductForm onSuccess={() => setActiveProductView("list")} />
          )}
        </div>
      )}

      {activeTab === "categories" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xl font-medium">Manage Categories</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveCategoryView("list")}
                className={`px-3 py-2 text-sm rounded-md flex items-center ${
                  activeCategoryView === "list"
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <List className="w-4 h-4 mr-1" />
                View Categories
              </button>
              <button
                onClick={() => setActiveCategoryView("add")}
                className={`px-3 py-2 text-sm rounded-md flex items-center ${
                  activeCategoryView === "add"
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <PlusCircle className="w-4 h-4 mr-1" />
                Add Category
              </button>
            </div>
          </div>

          {activeCategoryView === "list" ? (
            <CategoriesManagement onAddNew={() => setActiveCategoryView("add")} />
          ) : (
            <AddCategoryForm onSuccess={() => setActiveCategoryView("list")} />
          )}
        </div>
      )}

      {activeTab === "hampers" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xl font-medium">Manage Hampers</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveHamperView("list")}
                className={`px-3 py-2 text-sm rounded-md flex items-center ${
                  activeHamperView === "list" ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <List className="w-4 h-4 mr-1" />
                View Hampers
              </button>
              <button
                onClick={() => setActiveHamperView("add")}
                className={`px-3 py-2 text-sm rounded-md flex items-center ${
                  activeHamperView === "add" ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <PlusCircle className="w-4 h-4 mr-1" />
                Add Hamper
              </button>
            </div>
          </div>

          {activeHamperView === "list" ? (
            <HamperManagement onAddNew={() => setActiveHamperView("add")} />
          ) : (
            <AddHamperForm onSuccess={() => setActiveHamperView("list")} />
          )}
        </div>
      )}

      {activeTab === "orders" && (
        <div className="space-y-6">
          <h3 className="text-xl font-medium">Manage Orders</h3>
          <ManageOrdersPanel />
        </div>
      )}

      {activeTab === "newsletter" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xl font-medium">Newsletter Subscribers</h3>
            <div className="flex items-center text-teal-600">
              <Mail className="w-5 h-5 mr-2" />
              <span>Manage your newsletter subscribers</span>
            </div>
          </div>
          <NewsletterSubscribersManagement />
        </div>
      )}
    </div>
  )
}

