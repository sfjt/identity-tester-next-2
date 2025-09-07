# Overview

This app is a testing application for Auth0 built with the official Auth0 SDK `@auth0/nextjs-auth0`

# Commands

- `npm run format`: Formats the `.ts` and `.tsx` code under the `src` directory using `prettier`

# Workflow

- Execute `npm run format` when you make changes in the codebase

# Code Style
- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (eg. import { foo } from "bar")
- Use double quotes (")
- Don't use semicolons (";") unless needed (e.g., to prevent ASI issues)

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
