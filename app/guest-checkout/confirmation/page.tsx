import { Suspense } from "react"
import GuestCheckoutConfirmationContent from "./confirmation-content"

export default function GuestCheckoutConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-lg">Loading order details...</p>
          </div>
        </div>
      }
    >
      <GuestCheckoutConfirmationContent />
    </Suspense>
  )
}
