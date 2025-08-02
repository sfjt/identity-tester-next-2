import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { otp, mfaToken } = await request.json()

    if (!otp || !mfaToken) {
      return NextResponse.json({ error: "OTP code and MFA token are required" }, { status: 400 })
    }

    const domain = process.env.AUTH0_DOMAIN
    const clientId = process.env.AUTH0_CLIENT_ID
    const clientSecret = process.env.AUTH0_CLIENT_SECRET

    if (!domain || !clientId || !clientSecret) {
      return NextResponse.json({ error: "Missing Auth0 configuration" }, { status: 500 })
    }

    const tokenUrl = `https://${domain}/oauth/token`

    const formData = new URLSearchParams({
      grant_type: "http://auth0.com/oauth/grant-type/mfa-otp",
      client_id: clientId,
      client_secret: clientSecret,
      mfa_token: mfaToken,
      otp: otp,
    })

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: "MFA confirmation failed", details: errorData }, { status: response.status })
    }

    const tokenData = await response.json()

    return NextResponse.json({
      success: true,
      message: "OTP enrollment confirmed successfully",
      tokenData: tokenData,
    })
  } catch (error) {
    console.error("MFA confirmation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
