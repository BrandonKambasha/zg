"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Search, MapPin, CheckCircle, AlertCircle, Info, ArrowRight } from "lucide-react"
import { GoogleMap, useJsApiLoader, Marker, Circle } from "@react-google-maps/api"

// Fix the Harare CBD coordinates
const HARARE_CBD = {
  lat: -17.831773,
  lng: 31.045686,
}

// Base fee configuration
const BASE_ZONE_RADIUS = 10000 // 10km base zone
const BASE_DELIVERY_FEE = 5 // $5 base fee
const ADDITIONAL_KM_FEE = 1 // $1 per additional km

// We'll keep a visual representation of zones for the map
const ZONES = [
  { id: 1, radius: 10000, color: "#10b981", fillColor: "#10b98133", fee: 5 }, // 10km - Base Zone
  { id: 2, radius: 20000, color: "#3b82f6", fillColor: "#3b82f633", fee: 15 }, // 20km - Visual only
  { id: 3, radius: 30000, color: "#f59e0b", fillColor: "#f59e0b33", fee: 25 }, // 30km - Visual only
  { id: 4, radius: 40000, color: "#ef4444", fillColor: "#ef444433", fee: 35 }, // 40km - Visual only
]

// Calculate delivery fee based on distance
const calculateDeliveryFee = (distanceInMeters: number) => {
  if (distanceInMeters <= BASE_ZONE_RADIUS) {
    return BASE_DELIVERY_FEE
  } else {
    const additionalKm = Math.ceil((distanceInMeters - BASE_ZONE_RADIUS) / 1000)
    return BASE_DELIVERY_FEE + additionalKm * ADDITIONAL_KM_FEE
  }
}

// Calculate distance between two points using the Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

interface DeliveryZoneMapProps {
  onZoneChange: (zone: number | null, distance: number | null, fee: number | null) => void
  initialAddress?: {
    house_number?: string
    street?: string
    city?: string
    location?: string
  }
  formId?: string
}

interface AddressSuggestion {
  place_id: string
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

export default function DeliveryZoneMap({ onZoneChange, initialAddress = {}, formId }: DeliveryZoneMapProps) {
  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  })

  // State for exact distance and fee
  const [exactDistance, setExactDistance] = useState<number | null>(null)
  const [exactFee, setExactFee] = useState<number | null>(null)

  // Address input state
  const [addressInput, setAddressInput] = useState("")
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  // Map state
  const [addressCoords, setAddressCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedZone, setSelectedZone] = useState<number | null>(null)
  const [zoneConfirmed, setZoneConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  // Refs
  const mapRef = useRef<google.maps.Map | null>(null)
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesService = useRef<google.maps.places.PlacesService | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const addressInputRef = useRef<HTMLInputElement>(null)

  // Initialize Google services when API is loaded
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined" && window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService()
    }
  }, [isLoaded])

  // Initialize Places Service when map is loaded
  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map
    if (typeof window !== "undefined" && window.google && window.google.maps) {
      placesService.current = new window.google.maps.places.PlacesService(map)
    }
  }

  // Initialize with any provided address
  useEffect(() => {
    if (initialAddress) {
      // Format the address in a more logical order with proper separators
      const addressParts = []

      // Add house number and street together
      if (initialAddress.house_number && initialAddress.street) {
        addressParts.push(`${initialAddress.house_number} ${initialAddress.street}`)
      } else if (initialAddress.house_number) {
        addressParts.push(initialAddress.house_number)
      } else if (initialAddress.street) {
        addressParts.push(initialAddress.street)
      }

      // Add location/suburb
      if (initialAddress.location) {
        addressParts.push(initialAddress.location)
      }

      // Add city
      if (initialAddress.city) {
        addressParts.push(initialAddress.city)
      }

      // Add country
      addressParts.push("Zimbabwe")

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
      onZoneChange(null, null, null)
    }

    // Set new timer for debounce
    if (value.length > 3 && isLoaded && autocompleteService.current) {
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

  // Fetch address suggestions from Google Places Autocomplete
  const fetchAddressSuggestions = (query: string) => {
    if (!autocompleteService.current) return

    autocompleteService.current.getPlacePredictions(
      {
        input: query,
        componentRestrictions: { country: "zw" }, // Restrict to Zimbabwe
        types: ["address"], // Focus on addresses
      },
      (predictions, status) => {
        setIsSearching(false)
        setHasSearched(true)

        if (status !== window.google.maps.places.PlacesServiceStatus.OK || !predictions) {
          setSuggestions([])
          setShowSuggestions(false)
          setError("No locations found. Try entering a more specific address.")
          return
        }

        setSuggestions(predictions as AddressSuggestion[])
        setShowSuggestions(predictions.length > 0)

        if (predictions.length === 0) {
          setError("No locations found. Try entering a more specific address.")
        }
      },
    )
  }

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    setAddressInput(suggestion.description)
    setShowSuggestions(false)

    if (!placesService.current) return

    placesService.current.getDetails(
      {
        placeId: suggestion.place_id,
        fields: ["geometry"],
      },
      (place, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          place &&
          place.geometry &&
          place.geometry.location
        ) {
          const coords = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          }
          setAddressCoords(coords)
          determineZone(coords)
        } else {
          setError("Could not find details for this location. Please try another address.")
        }
      },
    )
  }

  // Determine which zone the coordinates fall into and calculate exact fee
  const determineZone = (coords: { lat: number; lng: number }) => {
    // Calculate distance from CBD
    const distanceFromCBD = calculateDistance(coords.lat, coords.lng, HARARE_CBD.lat, HARARE_CBD.lng)

    // Store the exact distance for fee calculation
    const exactDistanceKm = distanceFromCBD / 1000
    const deliveryFee = calculateDeliveryFee(distanceFromCBD)

    // For UI purposes, determine which visual zone the point falls into
    let visualZone = null
    for (let i = ZONES.length - 1; i >= 0; i--) {
      if (distanceFromCBD <= ZONES[i].radius) {
        visualZone = ZONES[i].id
      }
    }

    // Set a custom zone object that includes both the visual zone and the exact fee
    setSelectedZone(visualZone)

    // Store the exact distance and fee
    setExactDistance(exactDistanceKm)
    setExactFee(deliveryFee)

    setZoneConfirmed(false)
  }

  // Fix the confirmZone function to properly handle touch events
  // This function ONLY confirms the zone but doesn't proceed to the next step
  const confirmZone = (e: React.MouseEvent) => {
    // Prevent default behavior and stop propagation
    e.preventDefault()
    e.stopPropagation()

    // Force close dropdown and unfocus input
    setShowSuggestions(false)
    if (addressInputRef.current) {
      addressInputRef.current.blur()
    }

    if (selectedZone !== null) {
      setZoneConfirmed(true)
      // Notify parent component of zone change, but don't trigger form submission
      onZoneChange(selectedZone, exactDistance, exactFee)
    }
  }

  // Get zone fee based on exact fee or zone
  const getZoneFee = (zoneId: number | null) => {
    if (zoneId === null) return null
    // If we have an exact fee calculated, use that
    if (exactFee !== null) return exactFee
    // Fallback to the zone-based fee
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
      setError("Please enter your complete address")
    }
  }

  // Handle map click for manual pin placement
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const coords = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      }
      setAddressCoords(coords)
      determineZone(coords)

      // Try to reverse geocode to get an address
      if (typeof window !== "undefined" && window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder()
        geocoder.geocode({ location: coords }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            setAddressInput(results[0].formatted_address)
          }
        })
      }
    }
  }

  // Map container styles
  const mapContainerStyle = {
    width: "100%",
    height: "400px",
  }

  // Map options
  const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
    ],
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
            <li>Enter your complete address including house number, street, and neighborhood</li>
            <li>
              Click the <strong>Search</strong> button
            </li>
            <li>Select your location from the dropdown list</li>
            <li>You can also click directly on the map to place a pin at your exact location</li>
            <li>Confirm your delivery zone</li>
          </ol>
          <p className="text-sm text-blue-700 mt-2 italic">You must complete all steps to proceed with checkout.</p>
        </div>

        {/* Address Search with Autocomplete */}
        <div className="relative">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                ref={addressInputRef}
                type="text"
                placeholder="Enter your complete address"
                value={addressInput}
                onChange={handleAddressChange}
                className="w-full p-2 pl-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                onFocus={() => {
                  if (suggestions.length > 0) {
                    setShowSuggestions(true)
                  }
                }}
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
              onTouchStart={(e) => {
                e.preventDefault()
                handleSearchClick(e as unknown as React.MouseEvent)
              }}
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
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleSelectSuggestion(suggestion)
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault()
                      handleSelectSuggestion(suggestion)
                    }}
                  >
                    <MapPin className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0 text-gray-500" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{suggestion.structured_formatting.main_text}</span>
                      <span className="text-xs text-gray-500">{suggestion.structured_formatting.secondary_text}</span>
                    </div>
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
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={addressCoords || HARARE_CBD}
              zoom={addressCoords ? 15 : 12}
              options={mapOptions}
              onLoad={onMapLoad}
              onClick={handleMapClick}
            >
              {/* Zone circles */}
              {ZONES.map((zone) => (
                <Circle
                  key={zone.id}
                  center={HARARE_CBD}
                  radius={zone.radius}
                  options={{
                    strokeColor: zone.color,
                    strokeOpacity: 0.8,
                    strokeWeight: 1,
                    fillColor: zone.fillColor,
                    fillOpacity: 0.2,
                    clickable: false,
                    zIndex: 1,
                  }}
                />
              ))}

              {/* Highlight selected zone */}
              {selectedZone !== null && (
                <Circle
                  center={HARARE_CBD}
                  radius={ZONES.find((z) => z.id === selectedZone)?.radius || 10000}
                  options={{
                    strokeColor: ZONES.find((z) => z.id === selectedZone)?.color || "#10b981",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: ZONES.find((z) => z.id === selectedZone)?.fillColor || "#10b98133",
                    fillOpacity: 0.4,
                    clickable: false,
                    zIndex: 2,
                  }}
                />
              )}

              {/* Address marker */}
              {addressCoords &&
                addressCoords.lat &&
                addressCoords.lng &&
                typeof window !== "undefined" &&
                window.google &&
                window.google.maps && <Marker position={addressCoords} animation={window.google.maps.Animation.DROP} />}
            </GoogleMap>
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            </div>
          )}
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
              Based on your location, you are{" "}
              {exactDistance !== null ? `${exactDistance.toFixed(1)}km` : `in Zone ${selectedZone}`} from the city
              center. The delivery fee will be <strong>${getZoneFee(selectedZone)}</strong>.
              {exactDistance !== null && exactDistance > 10 && (
                <span className="block mt-1 text-xs">
                  (Base fee: $5 + ${(exactFee! - 5).toFixed(2)} for {Math.ceil(exactDistance - 10)} additional km)
                </span>
              )}
            </p>
            {!zoneConfirmed && (
              <button
                type="button"
                onClick={confirmZone}
                onTouchStart={(e) => {
                  e.preventDefault()
                  confirmZone(e as unknown as React.MouseEvent)
                }}
                className="w-full bg-yellow-600 text-white py-2 rounded-md hover:bg-yellow-700 transition"
              >
                Confirm Delivery Fee: ${getZoneFee(selectedZone)}
              </button>
            )}
          </div>
        )}

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

