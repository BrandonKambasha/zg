"use client"

import type React from "react"

import { useEffect } from "react"
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from "react-leaflet"
import type { Map as LeafletMap } from "leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Component to recenter map
function SetViewOnChange({ coords }: { coords: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(coords, 13) // Zoom level 13 for better detail
  }, [coords, map])
  return null
}

// Component to store map reference
function MapEffect({ mapRef }: { mapRef: React.RefObject<LeafletMap | null> }) {
  const map = useMap()

  useEffect(() => {
    if (map) {
      mapRef.current = map
    }
  }, [map, mapRef])

  return null
}

interface MapProps {
  center: [number, number]
  zones: Array<{
    id: number
    radius: number
    color: string
    fillColor: string
  }>
  addressCoords: [number, number] | null
  selectedZone: number | null
  mapRef: React.RefObject<LeafletMap | null>
  modernStyle?: boolean
}

export default function Map({ center, zones, addressCoords, selectedZone, mapRef, modernStyle = true }: MapProps) {
  // Fix Leaflet icon issues
  useEffect(() => {
    // This is needed to fix the marker icon issues with webpack
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    })
  }, [])

  // Choose a modern map style
  const mapTileUrl = modernStyle
    ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

  const mapAttribution = modernStyle
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

  return (
    <div className="relative h-full w-full">
      <MapContainer center={center} zoom={11} style={{ height: "100%", width: "100%" }} className="z-10">
        <MapEffect mapRef={mapRef} />
        <TileLayer attribution={mapAttribution} url={mapTileUrl} />

        {/* CBD Marker */}
        <Marker position={center}>
          <Popup>Harare CBD</Popup>
        </Marker>

        {/* Zone Circles */}
        {zones.map((zone) => (
          <Circle
            key={zone.id}
            center={center}
            radius={zone.radius}
            pathOptions={{
              color: zone.color,
              fillColor: zone.fillColor,
              fillOpacity: 0.2,
              weight: selectedZone === zone.id ? 3 : 2,
              dashArray: selectedZone === zone.id ? undefined : "5, 5",
            }}
          >
            <Popup>
              Zone {zone.id} - {zone.radius / 1000}km radius
            </Popup>
          </Circle>
        ))}

        {/* Address Marker */}
        {addressCoords && (
          <Marker position={addressCoords}>
            <Popup>
              Your Address
              <br />
              {selectedZone ? `Zone ${selectedZone}` : "Outside delivery zones"}
            </Popup>
          </Marker>
        )}

        {/* Update view when address changes */}
        {addressCoords && <SetViewOnChange coords={addressCoords} />}
      </MapContainer>

      {/* Status indicator */}
      <div className="absolute bottom-2 right-2 z-20 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-xs">
        {addressCoords ? (
          <span className="text-teal-700">
            Location found: {addressCoords[0].toFixed(6)}, {addressCoords[1].toFixed(6)}
          </span>
        ) : (
          <span className="text-gray-600">Enter an address to locate on map</span>
        )}
      </div>
    </div>
  )
}

