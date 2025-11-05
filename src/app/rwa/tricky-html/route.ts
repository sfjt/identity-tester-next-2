import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import { auth0 } from "@/lib/auth0"

export async function GET() {
  try {
    const session = await auth0.getSession()

    if(session) {
      const filePath = join(process.cwd(), "src", "app", "rwa", "tricky-html", "tricky-html.html")
      const htmlContent = await readFile(filePath, "utf8")
      return new NextResponse(htmlContent, {
        status: 200,
        headers: {
          "Content-Type": "text/html",
        },
      })
    } else {
      const filePath = join(process.cwd(), "src", "app", "rwa", "tricky-html", "login.html")
      const htmlContent = await readFile(filePath, "utf8")
      return new NextResponse(htmlContent, {
        status: 200,
        headers: {
          "Content-Type": "text/html",
        },
      })
    }
  } catch (error) {
    console.error(error)
    return new NextResponse("File not found", { status: 404 })
  }
}
