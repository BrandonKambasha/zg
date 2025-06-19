import { Suspense } from "react"
import GuestOrderTrackingContent from "./tracking-content"

export default function GuestOrderTrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-center items-center min-h-[50vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
                <p className="mt-4 text-lg">Loading tracking form...</p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <GuestOrderTrackingContent />
    </Suspense>
  )
}
