import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { oobCode, mfaToken } = await request.json()

    if (!oobCode || !mfaToken) {
      return NextResponse.json({ error: "OOB code and MFA token are required" }, { status: 400 })
    }

    const domain = process.env.AUTH0_DOMAIN
    const clientId = process.env.AUTH0_CLIENT_ID
    const clientSecret = process.env.AUTH0_CLIENT_SECRET

    if (!domain || !clientId || !clientSecret) {
      return NextResponse.json({ error: "Missing Auth0 configuration" }, { status: 500 })
    }

    const tokenUrl = `https://${domain}/oauth/token`

    const formData = new URLSearchParams({
      grant_type: "http://auth0.com/oauth/grant-type/mfa-oob",
      client_id: clientId,
      client_secret: clientSecret,
      mfa_token: mfaToken,
      oob_code: oobCode,
    })

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    })

    const responseData = await response.json()

    if (!response.ok) {
      // Handle authorization_pending specifically
      if (responseData.error === "authorization_pending") {
        return NextResponse.json({
          status: "pending",
          message: "Authorization pending: please repeat the request in a few seconds.",
        })
      }

      return NextResponse.json(
        { error: "Push enrollment polling failed", details: responseData },
        { status: response.status },
      )
    }

    // Success - user has confirmed enrollment
    return NextResponse.json({
      status: "confirmed",
      message: "Push enrollment confirmed successfully",
      tokenData: responseData,
    })
  } catch (error) {
    console.error("Push enrollment polling error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
