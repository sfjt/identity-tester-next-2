import { NextRequest, NextResponse } from "next/server"
import * as jose from "jose"

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN as string
const DEFAULT_AUDIENCE = process.env.DEFAULT_AUDIENCE as string

export const GET = async (req: NextRequest) => {
  const authHeader = req.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const token = authHeader.split(" ")[1]

  let JWKS
  try {
    JWKS = jose.createRemoteJWKSet(new URL(`https://${AUTH0_DOMAIN}/.well-known/jwks.json`))
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }

  try {
    const { payload } = await jose.jwtVerify(token, JWKS, {
      issuer: `https://${AUTH0_DOMAIN}/`,
      audience: DEFAULT_AUDIENCE,
    })
    console.log("Access token verified:", payload)
    return NextResponse.json({ message: "Authorized" }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
}
