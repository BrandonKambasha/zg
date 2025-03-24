"use client"

import type React from "react"

import { useState } from "react"

export default function BlobTest() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [rawResponse, setRawResponse] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const testUpload = async () => {
    if (!file) return

    setLoading(true)
    setError(null)
    setResult(null)
    setRawResponse(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "test")

      console.log("Sending request to /api/upload-blob")

      const response = await fetch("/lib/api/upload-blob", {
        method: "POST",
        body: formData,
      })

      // Get the raw text response first
      const responseText = await response.text()
      setRawResponse(responseText)

      // Try to parse as JSON
      try {
        const jsonData = JSON.parse(responseText)
        setResult(jsonData)
      } catch (parseError) {
        setError(`Failed to parse response as JSON: ${parseError}`)
      }
    } catch (err: any) {
      setError(`Request failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Blob Upload Test</h1>

      <div className="mb-4">
        <input type="file" onChange={handleFileChange} className="mb-4" />

        <button
          onClick={testUpload}
          disabled={!file || loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {loading ? "Uploading..." : "Test Upload"}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded">
          <h2 className="font-bold text-red-800">Error:</h2>
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
          <h2 className="font-bold text-green-800">Success:</h2>
          <pre className="bg-white p-2 rounded overflow-auto mt-2">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {rawResponse && (
        <div className="mt-4">
          <h2 className="font-bold">Raw Response:</h2>
          <div className="bg-gray-100 p-4 rounded overflow-auto max-h-96 mt-2">
            <pre>
              {rawResponse.substring(0, 1000)}
              {rawResponse.length > 1000 ? "..." : ""}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

