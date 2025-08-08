# Identity Tester

Auth0 All-in-One Tester

## ⚠️ Testing Application Notice

This is a demonstration and testing application for Auth0 authentication flows. The codes are **not intended for production use**. Access tokens and sensitive information may be exposed in the frontend for testing purposes.

## Quickstart

- Rename `.env.example` to `.env.local`
- Generate a secret by executing `openssl rand -hex 32` and set it as the `AUTH0_SECRET` environment variable
- **Session Storage**
  - Create a Redis database in [Upstash](https://upstash.com/)
  - Set the `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` environment variables in the `.env.local` file
- **Regular Web Application**
  - Create a Regular Web Application in your [Auth0](https://auth0.com/) tenant
  - Set the `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, and `MFA_API_AUDIENCE` environment variables in the `.env.local` file
  - Allowed Callback URLs: `http://localhost:3000/auth/callback`
  - Allowed Logout URLs: `http://localhost:3000/rwa`
  - Enable the [MFA grant](https://auth0.com/docs/secure/multi-factor-authentication/multi-factor-authentication-developer-resources/mfa-api) for this client to use the MFA API
- **Single Page Application**
  - Create a Single Page Application in your Auth0 tenant
  - Set the `SPA_CLIENT_ID` environment variable in the `.env.local` file
  - Allowed Callback URLs: `http://localhost:3000/spa/auth0-spa-js`, `http://localhost:3000/spa/auth0-lock`, `http://localhost:3000/spa/auth0-js`
  - Allowed Logout URLs: `http://localhost:3000/spa/auth0-spa-js`, `http://localhost:3000/spa/auth0-lock`, `http://localhost:3000/spa/auth0-js`
  - Allowed Web Origins: `http://localhost:3000`
  - Toggle on Allow Cross-Origin Authentication and add `http://localhost:3000` to Allowed Origins (CORS)
- **API**
  - Create an API in your Auth0 tenant with the identifier `https://example.com/api/v1/`
- Start the server by executing `npm run dev`
