import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  console.log("API route: Starting file upload to Vercel Blob")

  // Check if the token exists before doing anything else
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("API route: BLOB_READ_WRITE_TOKEN is not defined")
    return new NextResponse(
      JSON.stringify({
        error: "Blob storage is not properly configured. Missing BLOB_READ_WRITE_TOKEN.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }

  try {
    // Parse the form data
    const formData = await request.formData()
    const file = formData.get("file")
    const folder = (formData.get("folder") as string) || "products"

    // Validate the file
    if (!file || !(file instanceof File)) {
      console.log("API route: No valid file provided")
      return new NextResponse(JSON.stringify({ error: "No valid file provided" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      })
    }

    console.log(`API route: Uploading file "${file.name}" (${file.size} bytes) to folder "${folder}"`)

    // Upload to Vercel Blob
    const blob = await put(`${folder}/${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    })

    console.log(`API route: Successfully uploaded file to ${blob.url}`)

    // Return success response
    return new NextResponse(
      JSON.stringify({
        success: true,
        url: blob.url,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error: any) {
    // Detailed error logging
    console.error("API route: Error uploading to Blob:", error)
    console.error("API route: Error stack:", error.stack)

    // Return a more informative error response
    return new NextResponse(
      JSON.stringify({
        error: error.message || "Failed to upload file to Vercel Blob",
        details: error.stack,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}

