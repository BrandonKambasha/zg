import type { Metadata } from "next"
import FeedbackClientPage from "./FeedbackClientPage"

// Metadata for the page
export const metadata: Metadata = {
  title: "Feedback | Zimbabwe Groceries",
  description: "Share your feedback with Zimbabwe Groceries. We value your opinion!",
}

export default function FeedbackPage() {
  return <FeedbackClientPage />
}
