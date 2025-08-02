import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

export async function GET() {
  try {
    const filePath = join(process.cwd(), "src", "app", "spa", "lock", "lock.html")
    const htmlContent = await readFile(filePath, "utf8")

    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    })
  } catch (error) {
    console.error(error)
    return new NextResponse("File not found", { status: 404 })
  }
}
