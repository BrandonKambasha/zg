import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check file size (2MB limit)
    const fileSizeInMB = file.size / (1024 * 1024)
    if (fileSizeInMB > 2) {
      return NextResponse.json({ error: "File size exceeds the 2MB limit" }, { status: 400 })
    }

    // Generate a unique filename
    const timestamp = Date.now()
    const cleanFileName = file.name.replace(/\s+/g, "-")
    const filename = `${timestamp}-${cleanFileName}`

    // Convert the file to a Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Make sure the directory exists
    const directory = path.join(process.cwd(), "public", "products")
    try {
      await mkdir(directory, { recursive: true })
    } catch (error) {
      console.error("Error creating directory:", error)
    }

    // Write the file to the public/products directory
    const filePath = path.join(directory, filename)
    await writeFile(filePath, buffer)

    // Create the public URL for the file
    const fileUrl = `/products/${filename}`

    return NextResponse.json({
      url: fileUrl,
      filename: filename,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}

