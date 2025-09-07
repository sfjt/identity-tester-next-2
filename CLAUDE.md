# Overview

This app is a testing application for Auth0 bilt with the official Auth0 SDK `@auth0/nextjs-auth0`

# Commands

- `npm run format`: format the `.ts` and `.tsx` codes under the `src` directory using `prettier`

# Workflow

- Execute `npm run format` when you make changes in codebase

# Codebase Structure

```
src/
├── app/
│   ├── api/
│   │   ├── config/        # Auth0 configuration endpoint
│   │   └── mfa/           # MFA API endpoints
│   │       ├── otp/       # OTP (TOTP) MFA enrollment & verification
│   │       ├── push/      # Push notification MFA polling
│   │       └── sms/       # SMS MFA enrollment & verification
│   ├── mfa/               # MFA testing UI components
│   ├── rwa/               # Regular Web Application testing
│   ├── spa/               # Single Page Application testing
│   │   ├── auth0-js/      # Auth0.js SDK integration
│   │   ├── auth0-lock/    # Auth0 Lock widget integration
│   │   └── auth0-spa-js/  # Auth0 SPA JS SDK integration
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/            # Shared React components
├── lib/                   # Auth0 configuration and utilities
└── middleware.ts
```
