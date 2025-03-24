import { NextResponse } from "next/server"
import { unlink } from "fs/promises"
import path from "path"

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      console.log("Delete file request missing URL")
      return NextResponse.json({ error: "No file URL provided" }, { status: 400 })
    }

    // Extract the filename from the URL
    // Expecting format: /products/filename.ext
    const urlPath = url.startsWith("/") ? url.substring(1) : url
    const filePath = path.join(process.cwd(), "public", urlPath)

    console.log("Attempting to delete file:", filePath)

    try {
      await unlink(filePath)
      console.log("File deleted successfully:", filePath)
      return NextResponse.json({ success: true })
    } catch (err) {
      console.error("File not found or could not be deleted:", filePath, err)
      return NextResponse.json({ error: "File could not be deleted" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error processing delete file request:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

