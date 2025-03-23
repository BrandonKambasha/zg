"use client"

import { useState } from "react"
import axios from "../lib/axios"

export default function WebhookTestPage() {
  const [testResult, setTestResult] = useState<string | null>(null)
  const [logs, setLogs] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)
  const [testPayload, setTestPayload] = useState(
    JSON.stringify(
      {
        test: true,
        timestamp: new Date().toISOString(),
        message: "This is a test webhook payload",
      },
      null,
      2,
    ),
  )

  const sendTestWebhook = async () => {
    setIsLoading(true)
    try {
      const response = await axios.post("/webhook-test", JSON.parse(testPayload), {
        headers: {
          "Content-Type": "application/json",
          "X-Test-Header": "webhook-test",
        },
      })
      setTestResult(JSON.stringify(response.data, null, 2))
    } catch (error) {
      console.error("Error sending test webhook:", error)
      setTestResult("Error: " + (error instanceof Error ? error.message : String(error)))
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLogs = async () => {
    setIsLoadingLogs(true)
    try {
      const response = await axios.get("/webhook-test/logs")
      setLogs(response.data)
    } catch (error) {
      console.error("Error fetching logs:", error)
      setLogs("Error fetching logs: " + (error instanceof Error ? error.message : String(error)))
    } finally {
      setIsLoadingLogs(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Webhook Testing Tool</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Send Test Webhook</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Payload (JSON)</label>
            <textarea
              className="w-full h-40 p-2 border border-gray-300 rounded-md font-mono text-sm"
              value={testPayload}
              onChange={(e) => setTestPayload(e.target.value)}
            />
          </div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            onClick={sendTestWebhook}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Test Webhook"}
          </button>

          {testResult && (
            <div className="mt-4">
              <h3 className="text-md font-medium mb-2">Result:</h3>
              <pre className="bg-gray-100 p-3 rounded-md overflow-auto text-sm">{testResult}</pre>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Webhook Logs</h2>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition mb-4"
            onClick={fetchLogs}
            disabled={isLoadingLogs}
          >
            {isLoadingLogs ? "Loading..." : "Fetch Logs"}
          </button>

          {logs && (
            <div className="mt-2">
              <pre className="bg-gray-100 p-3 rounded-md overflow-auto h-80 text-sm whitespace-pre-wrap">{logs}</pre>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Stripe Webhook Setup Guide</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-md font-medium">1. Configure your Stripe webhook endpoint</h3>
            <p className="text-gray-600">In your Stripe Dashboard, go to Developers &gt; Webhooks &gt; Add endpoint</p>
            <p className="text-gray-600">
              Set the endpoint URL to:{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">{`${process.env.NEXT_PUBLIC_API_URL}/stripe/webhook`}</code>
            </p>
          </div>

          <div>
            <h3 className="text-md font-medium">2. Select events to listen for</h3>
            <p className="text-gray-600">At minimum, select these events:</p>
            <ul className="list-disc list-inside text-gray-600 ml-4">
              <li>checkout.session.completed</li>
              <li>payment_intent.payment_failed</li>
            </ul>
          </div>

          <div>
            <h3 className="text-md font-medium">3. Get your webhook signing secret</h3>
            <p className="text-gray-600">
              After creating the webhook, Stripe will show you a signing secret. Add this to your environment variables
              as <code className="bg-gray-100 px-2 py-1 rounded">STRIPE_WEBHOOK_SECRET</code>
            </p>
          </div>

          <div>
            <h3 className="text-md font-medium">4. Test your webhook</h3>
            <p className="text-gray-600">In the Stripe Dashboard, you can send test webhook events to your endpoint.</p>
            <p className="text-gray-600">Check the logs above to see if your webhook is receiving events.</p>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Note:</strong> For local development, you'll need to use a tool like ngrok to expose your
                  local server to the internet so Stripe can reach it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

