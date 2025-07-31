import { NextResponse } from "next/server"

export const GET = async () => {
  return NextResponse.json(
    {
      auth0_domain: process.env.AUTH0_DOMAIN,
      app_base_url: process.env.APP_BASE_URL,
      spa_client_id: process.env.SPA_CLIENT_ID,
      default_audience: process.env.DEFAULT_AUDIENCE,
    },
    {
      status: 200,
    },
  )
}
