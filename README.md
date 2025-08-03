# Identity Tester

Auth0 All-in-One Tester

## Quickstart

1. Rename `.env.example` to `.env.local`
2. Generate a secret by executing `openssl rand -hex 32` and set it as the `AUTH0_SECRET` environment variable
3. **Session Storage**
  - Create a Redis database in [Upstash](https://upstash.com/)
  - Set the `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` environment variables in the `.env.local` file
4. **Regular Web Application**
  - Create a Regular Web Application in your [Auth0](https://auth0.com/) tenant
  - Set the `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, and `MFA_API_AUDIENCE` environment variables in the `.env.local` file
  - Allowed Callback URLs: `http://localhost:3000/auth/callback`
  - Allowed Logout URLs: `http://localhost:3000/rwa`
  - Enable the [MFA grant](https://auth0.com/docs/secure/multi-factor-authentication/multi-factor-authentication-developer-resources/mfa-api) for this client to use the MFA API
5. **Single Page Application**
  - Create a Single Page Application in your Auth0 tenant
  - Set the `SPA_CLIENT_ID` environment variable in the `.env.local` file
  - Allowed Callback URLs: `http://localhost:3000/spa/auth0-spa-js`, `http://localhost:3000/spa/lock`
  - Allowed Logout URLs: `http://localhost:3000/spa/auth0-spa-js`, `http://localhost:3000/spa/lock`
  - Allowed Web Origins: `http://localhost:3000`
6. **API**
  - Create an API in your Auth0 tenant with the identifier `https://example.com/api/v1/`
7. Start the server by executing `npm run dev`
