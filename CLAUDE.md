# Overview

This app is a testing application for Auth0 built with the official Auth0 SDK `@auth0/nextjs-auth0`

# Commands

- `npm test` / `npm test -- <filename>`: Run tests
- `npm run format`: Formats the `.ts` and `.tsx` code under the `src` directory using `prettier`

# Workflow

- Execute `npm run format` when you make changes in the codebase under the `src` directory

# Code Style
- TypeScript
  - ES modules
  - Destructure imports when possible (e.g., `import { foo } from "bar"`)
- Formatting
  - 2-space indentation
  - Double quotes (")
  - Semicolons (;) not required unless necessary
- Files
  - Kebab case (e.g., file-name.ts)
  - Plece unit test files alongside source files. Use the suffix `.test.ts(x)`
  - Plece e2e test files under the `e2e` directory. Use the suffix `.e2e.ts`

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
│   └── spa/               # Single Page Application testing
│       ├── auth0-js/      # Auth0.js SDK integration
│       ├── auth0-lock/    # Auth0 Lock widget integration
│       └── auth0-spa-js/  # Auth0 SPA JS SDK integration
├── components/            # Shared React components
└── lib/                   # Auth0 configuration and utilities
```
