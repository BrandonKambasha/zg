import type React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import type { Hamper } from "../Types"
import { apiBaseUrl } from "../lib/axios"

interface HamperGridProps {
  hampers: Hamper[]
}

const HamperGrid: React.FC<HamperGridProps> = ({ hampers }) => {
  // Function to get full image URL with API prefix
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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {hampers.map((hamper) => (
        <Link key={hamper.id} href={`/hampers/${hamper.id}`} className="group">
          <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full border border-gray-100">
            <div className="aspect-square relative overflow-hidden">
              <img
                src={getFullImageUrl(hamper.image_url) || "/placeholder.svg"}
                alt={hamper.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              {hamper.stock_quantity === 0 && (
                <div className="absolute top-2 left-2 bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium">
                  Out of Stock
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium text-sm">${hamper.price}</span>
                  <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">Gift</span>
                </div>
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-medium text-gray-800 group-hover:text-teal-600 transition-colors mb-1 line-clamp-1">
                {hamper.name}
              </h3>
              <p className="text-gray-500 text-sm line-clamp-2">{hamper.description}</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {hamper.products?.length || 0} {hamper.products?.length === 1 ? "item" : "items"}
                </span>
                <div className="text-teal-600 text-xs font-medium flex items-center">
                  View Details
                  <ChevronRight className="h-3 w-3 ml-0.5" />
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default HamperGrid
