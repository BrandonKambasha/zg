"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { Search, MapPin, CheckCircle, AlertCircle, Info, ArrowRight } from "lucide-react"
import type { Map as LeafletMap } from "leaflet"

// Fix the Harare CBD coordinates type
const HARARE_CBD: [number, number] = [-17.831773, 31.045686]

// Dynamically import the Map component to avoid SSR issues
const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full flex items-center justify-center bg-gray-100 rounded-md">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
    </div>
  ),
})

// Zone definitions (in meters)
const ZONES = [
  { id: 1, radius: 10000, color: "#10b981", fillColor: "#10b98133", fee: 5 }, // 10km - Zone 1
  { id: 2, radius: 20000, color: "#3b82f6", fillColor: "#3b82f633", fee: 8 }, // 20km - Zone 2
  { id: 3, radius: 30000, color: "#f59e0b", fillColor: "#f59e0b33", fee: 12 }, // 30km - Zone 3
  { id: 4, radius: 40000, color: "#ef4444", fillColor: "#ef444433", fee: 15 }, // 40km - Zone 4
]

interface DeliveryZoneMapProps {
  onZoneChange: (zone: number | null) => void
  initialAddress?: {
    house_number?: string
    street?: string
    city?: string
    location?: string
  }
  formId?: string
}

interface AddressSuggestion {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

export default function DeliveryZoneMap({ onZoneChange, initialAddress = {}, formId }: DeliveryZoneMapProps) {
  // Address input state
  const [addressInput, setAddressInput] = useState("")
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  // Map state
  const [addressCoords, setAddressCoords] = useState<[number, number] | null>(null)
  const [selectedZone, setSelectedZone] = useState<number | null>(null)
  const [zoneConfirmed, setZoneConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  // Debounce timer for address input
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize with any provided address
  useEffect(() => {
    if (initialAddress) {
      const addressParts = [initialAddress.location].filter(Boolean)

      if (addressParts.length > 0) {
        setAddressInput(addressParts.join(", "))
      }
    }
  }, [initialAddress])

  // Handle address input change with debounce
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAddressInput(value)
    setError(null)
    setHasSearched(false)

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Reset zone if address changes
    if (selectedZone !== null) {
      setSelectedZone(null)
      setZoneConfirmed(false)
      onZoneChange(null)
    }

    // Set new timer for debounce
    if (value.length > 3) {
      setIsSearching(true)
      debounceTimerRef.current = setTimeout(() => {
        fetchAddressSuggestions(value)
      }, 500)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
      setIsSearching(false)
    }
  }

  // Fetch address suggestions from Nominatim
  const fetchAddressSuggestions = async (query: string) => {
    try {
      setIsSearching(true)
      const encodedQuery = encodeURIComponent(`${query}, Zimbabwe`)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=5&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en",
            "User-Agent": "ZimbabweDeliveryApp",
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Geocoding service error: ${response.status}`)
      }

      const data = await response.json()
      setSuggestions(data)
      setShowSuggestions(data.length > 0)
      setHasSearched(true)

      if (data.length === 0) {
        setError("No locations found. Try a different neighborhood name.")
      }
    } catch (err) {
      console.error("Error fetching address suggestions:", err)
      setError("Failed to fetch address suggestions. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    setAddressInput(suggestion.display_name)
    setShowSuggestions(false)

    const coords: [number, number] = [Number.parseFloat(suggestion.lat), Number.parseFloat(suggestion.lon)]

    setAddressCoords(coords)
    determineZone(coords)
  }

  // Determine which zone the coordinates fall into
  const determineZone = async (coords: [number, number]) => {
    try {
      const L = await import("leaflet")
      const distanceFromCBD = L.latLng(coords).distanceTo(L.latLng(HARARE_CBD))

      let zone = null
      for (let i = ZONES.length - 1; i >= 0; i--) {
        if (distanceFromCBD <= ZONES[i].radius) {
          zone = ZONES[i].id
        }
      }

      setSelectedZone(zone)
      setZoneConfirmed(false)
    } catch (err) {
      console.error("Error determining zone:", err)
      setError("Failed to determine delivery zone. Please try again.")
    }
  }

  // Handle manual zone selection
  const handleManualZoneSelect = (zoneId: number, e: React.MouseEvent) => {
    // Prevent form submission
    e.preventDefault()
    e.stopPropagation()

    // Prevent any form submission that might be triggered
    if (formId) {
      const form = document.getElementById(formId) as HTMLFormElement
      if (form) {
        // Temporarily disable form submission
        const originalOnSubmit = form.onsubmit
        form.onsubmit = (e) => {
          e.preventDefault()
          return false
        }

        // Restore original handler after a delay
        setTimeout(() => {
          form.onsubmit = originalOnSubmit
        }, 100)
      }
    }

    setSelectedZone(zoneId)
    setZoneConfirmed(true) // Automatically confirm when manually selected
    onZoneChange(zoneId) // Immediately notify parent component
  }

  // Confirm selected zone
  const confirmZone = (e: React.MouseEvent) => {
    // Prevent default behavior and stop propagation
    e.preventDefault()
    e.stopPropagation()

    // Prevent any form submission that might be triggered
    if (formId) {
      const form = document.getElementById(formId) as HTMLFormElement
      if (form) {
        // Temporarily disable form submission
        const originalOnSubmit = form.onsubmit
        form.onsubmit = (e) => {
          e.preventDefault()
          return false
        }

        // Restore original handler after a delay
        setTimeout(() => {
          form.onsubmit = originalOnSubmit
        }, 100)
      }
    }

    if (selectedZone !== null) {
      setZoneConfirmed(true)
      onZoneChange(selectedZone) // This will notify the parent component immediately
    }
  }

  // Get fee for selected zone
  const getZoneFee = (zoneId: number | null) => {
    if (zoneId === null) return null
    const zone = ZONES.find((z) => z.id === zoneId)
    return zone ? zone.fee : null
  }

  // Handle search button click
  const handleSearchClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (addressInput.length > 3) {
      fetchAddressSuggestions(addressInput)
    } else {
      setError("Please enter a neighborhood or area name")
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-medium flex items-center justify-between">
          <span>Delivery Zone Map</span>
          {selectedZone && (
            <span
              className={`px-2 py-1 text-sm rounded-full ${zoneConfirmed ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
            >
              {zoneConfirmed ? (
                <span className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Zone {selectedZone} Confirmed
                </span>
              ) : (
                <span>Zone {selectedZone}</span>
              )}
            </span>
          )}
        </h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-start mb-2">
            <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700 font-medium">Follow these steps to determine your delivery zone:</p>
          </div>
          <ol className="ml-7 text-sm text-blue-700 list-decimal space-y-1">
            <li>Enter your neighborhood name (e.g., "Avondale", "Borrowdale")</li>
            <li>
              Click the <strong>Search</strong> button
            </li>
            <li>Select your location from the dropdown list</li>
            <li>Confirm your delivery zone</li>
          </ol>
          <p className="text-sm text-blue-700 mt-2 italic">You must complete all steps to proceed with checkout.</p>
        </div>

        {/* Address Search with Autocomplete */}
        <div className="relative">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter your neighborhood (e.g., Avondale, Borrowdale)"
                value={addressInput}
                onChange={handleAddressChange}
                className="w-full p-2 pl-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleSearchClick}
              className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition flex items-center"
            >
              <span>Search</span>
            </button>
          </div>

          {/* Search Instructions */}
          {hasSearched && suggestions.length > 0 && (
            <div className="mt-2 text-sm text-teal-600 flex items-center">
              <ArrowRight className="h-4 w-4 mr-1" />
              <span>Now select your location from the list below</span>
            </div>
          )}

          {/* Address Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-[2000] mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
              <div className="sticky top-0 bg-gray-50 p-2 border-b border-gray-200 text-xs text-gray-500">
                Select your location from the list:
              </div>
              <ul className="py-1">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.place_id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-start"
                    onMouseDown={() => handleSelectSuggestion(suggestion)}
                  >
                    <MapPin className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0 text-gray-500" />
                    <span className="text-sm">{suggestion.display_name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <div className="mt-2 text-sm text-red-500 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {error}
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="h-[400px] w-full rounded-md overflow-hidden border border-gray-200">
          <Map
            center={HARARE_CBD}
            zones={ZONES}
            addressCoords={addressCoords}
            selectedZone={selectedZone}
            mapRef={mapRef}
            modernStyle={true}
          />
        </div>

        {/* Zone Information */}
        {selectedZone && (
          <div
            className={`p-4 rounded-md ${zoneConfirmed ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"}`}
          >
            <h3 className={`font-medium mb-2 ${zoneConfirmed ? "text-green-800" : "text-yellow-800"}`}>
              {zoneConfirmed ? "Delivery Zone Confirmed" : "Please Confirm Your Delivery Zone"}
            </h3>
            <p className={`text-sm mb-3 ${zoneConfirmed ? "text-green-700" : "text-yellow-700"}`}>
              Based on your location, you are in <strong>Zone {selectedZone}</strong>. The delivery fee will be{" "}
              <strong>${getZoneFee(selectedZone)}</strong>.
            </p>
            {!zoneConfirmed && (
              <div onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={confirmZone}
                  className="w-full bg-yellow-600 text-white py-2 rounded-md hover:bg-yellow-700 transition"
                >
                  Confirm Zone {selectedZone}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Manual Zone Selection */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h3 className="font-medium text-gray-800 mb-2">Manual Zone Selection</h3>
          <p className="text-sm text-gray-600 mb-3">
            If automatic detection doesn't work, you can manually select your delivery zone:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {ZONES.map((zone) => (
              <div key={zone.id} onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={(e) => handleManualZoneSelect(zone.id, e)}
                  className={`w-full py-2 px-3 rounded-md text-sm font-medium ${
                    selectedZone === zone.id ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span>Zone {zone.id}</span>
                  <span className="ml-1 text-xs opacity-80">${zone.fee}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Zone Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {ZONES.map((zone) => (
            <div key={zone.id} className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: zone.color }}></div>
              <span className="text-xs">
                Zone {zone.id} ({zone.radius / 1000}km)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

