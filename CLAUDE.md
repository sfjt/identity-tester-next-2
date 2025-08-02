# Identity Tester Next 2 - Technical Repository Memo

## **Project Overview**
**Purpose**: Comprehensive Auth0 authentication testing platform built with Next.js 15
**Core Function**: Demonstrates and tests multiple Auth0 authentication flows (Regular Web App, SPA with auth0-spa-js, SPA with Auth0 Lock, MFA API testing)

## **Tech Stack & Dependencies**

### **Core Framework**
- **Next.js 15.4.4** with App Router
- **React 19.1.0** (cutting-edge version)
- **TypeScript 5.x**
- **Turbopack** for development builds

### **Authentication**
- **@auth0/nextjs-auth0 v4.8.0** - Server-side Auth0 integration
- **@auth0/auth0-spa-js v2.3.0** - Client-side SPA authentication
- **Auth0 Lock v14.0.0** - Legacy authentication widget (CDN)

### **UI & Image Processing**
- **next/image** - Optimized image rendering
- **qrcode v1.5.4** - QR code generation for MFA enrollment

### **Data & State Management**
- **SWR v2.3.4** - Data fetching and caching
- **@upstash/redis v1.35.2** - Session storage backend

### **Development Tools**
- **ESLint 9.x** with Next.js config
- **Prettier 3.6.2** for code formatting
- Custom `switchenv.mjs` for environment switching

## **Architecture & File Structure**

### **Core Configuration**
```
├── next.config.ts          # Minimal Next.js config
├── middleware.ts           # Auth0 middleware for all routes
├── switchenv.mjs          # Environment switching utility
└── src/
    ├── components/
    │   └── ErrorBoundary.tsx # Generic React Error Boundary component
    ├── lib/
    │   ├── auth0.ts       # Custom Redis session store
    │   └── fetchConfig.ts # API config fetcher
    └── app/               # Next.js App Router structure
```

### **Authentication Setup**
- **Redis Session Store**: Custom implementation with optimized session management
  - Uses Redis Sets (`SADD`/`SMEMBERS`) for inverted indexes tracking sessions by `sid` and `sub`
  - Sequential session creation for simplicity and reliability
  - Supports OIDC Back-channel logout via inverted index lookups
  - Uses Upstash Redis for persistence
- **Middleware**: Auth0 middleware applied to all routes except static assets

## **Routing Structure & Components**

### **Main Routes**

#### **1. Root Layout (`/layout.tsx`)**
```
Features:
- Global navigation header with 32px prominent site title
- Navigation links to all auth flows
- Consistent .app-container styling
- LoginToMFATester component integration
```

#### **2. Home Page (`/page.tsx`)**
```
Status: Empty React fragment - minimal placeholder
Returns: <></>
```

#### **3. Regular Web Application (`/rwa/`)**
```
Files: page.tsx, LoginAndOut.tsx, rwa.module.css
Features:
- Server-side Auth0 authentication flow
- Custom login/logout parameters editor (JSON textarea)
- Session token display (access, ID, refresh tokens)
- Direct Auth0 logout URL links (v2 and OIDC endpoints)
```

#### **4. SPA auth0-spa-js (`/spa/auth0-spa-js/`)**
```
Files: page.tsx
Features:
- Client-side authentication using @auth0/auth0-spa-js
- Login with redirect and popup flows
- Silent token refresh functionality
- Session state management with React hooks
```

#### **5. SPA Auth0 Lock (`/spa/lock/`)**
```
Files: route.ts (API route), lock.html
Features:
- Serves lock.html from src/app/spa/lock/ directory
- Route handler returns HTML with proper content-type headers
- In-memory session storage
```

#### **6. MFA API Tester (`/mfa/`)**
```
Files: page.tsx, Authenticators.tsx, OTPEnrollment.tsx, PushEnrollment.tsx, MFAErrorFallback.tsx, mfa.module.css
Features:
- Protected route (withPageAuthRequired)
- Error boundaries for graceful error handling and isolated component failures
- Expandable sections for better UX organization
- Three main components with individual error isolation:
  1. Authenticators: List/manage enrolled authenticators with delete functionality
  2. OTP Enrollment: Complete TOTP authenticator enrollment with QR codes
  3. Push Enrollment: Guardian app enrollment with real-time polling
- Structured data display using dl/dt/dd elements
- Auto-refresh authenticator list after enrollment/deletion
- MFA-specific error fallback with troubleshooting guidance
- CSS module for component-specific styling
```

### **API Routes**

#### **Configuration API (`/api/config/route.ts`)**
```javascript
{
  auth0_domain: process.env.AUTH0_DOMAIN,
  app_base_url: process.env.APP_BASE_URL,
  spa_client_id: process.env.SPA_CLIENT_ID,
  default_audience: process.env.DEFAULT_AUDIENCE
}
```

#### **MFA OTP Confirmation API (`/api/mfa/otp/confirm/route.ts`)**
```
Purpose: Secure OTP enrollment confirmation using client secret
Method: POST
Body: { otp: string, mfaToken: string }
Response: { success: boolean, message: string, tokenData: object }
Security: Client secret handled server-side, not exposed to frontend
```

#### **MFA Push Polling API (`/api/mfa/push/poll/route.ts`)**
```
Purpose: Poll Auth0 for push enrollment confirmation status
Method: POST
Body: { oobCode: string, mfaToken: string }
Responses:
  - Pending: { status: "pending", message: "..." }
  - Confirmed: { status: "confirmed", tokenData: object }
Auth0 Grant: http://auth0.com/oauth/grant-type/mfa-oob
```

### **Static Assets**

#### **Auth0 Lock HTML (`/src/app/spa/lock/lock.html`)**
```
Features:
- Standalone HTML page with Auth0 Lock integration
- Dynamic config fetching from /api/config
- Complete auth flow (login, logout, token display)
- In-memory session persistence (authData object)
- Error handling and loading states
- Roboto font integration
- 2-space indentation, double quotes, minimal semicolons
```

## **Styling Architecture**

### **Global CSS (`/src/app/globals.css`)**
```
Core Design System:
- Roboto font family (Google Fonts)
- 800px max-width container
- Consistent spacing (20px outer, 30px inner padding)
- Component-based utility classes:
  - .btn, .btn-primary, .btn-danger, .btn-secondary
  - .section, .user-info, .token-display
  - .loading, .error
  - .list-unstyled, .link-list
  - .app-container, .app-header, .nav-list
  - .expandable-summary (shared across components)

Text handling:
- pre elements with proper word wrapping and overflow handling
- Prevents text overflow in token displays and long URIs

Error boundary styling:
- .error-boundary (red background, bordered container)
- .error-details (collapsible technical details)
- .error-actions (button group for recovery actions)
- Consistent error styling across components

Color Scheme:
- Primary: #007bff (Bootstrap blue)
- Danger: #dc3545 (Bootstrap red)  
- Error Boundary: #f8d7da (Light red background)
- Secondary: #6c757d (Bootstrap gray)
- Background: #f5f5f5 (Light gray)
- Text: #333 (Dark gray)
```

### **Module CSS**
- **RWA Module**: `rwa.module.css` with custom parameter editor styles
- **MFA Module**: `mfa.module.css` with MFA-specific component styles
- **Naming Convention**: kebab-case (e.g., `custom-params-editor`, `authenticator-item`)
- **Organization**: General styles in globals.css, component-specific in modules

### **Design Consistency**
- All pages use same container, button, and token display styling
- Unified navigation header across React components
- Professional card-based layout with shadows and rounded corners
- Expandable sections with consistent summary styling
- Optimized spacing and alignment across components

## **Authentication Flows**

### **1. Regular Web Application (Server-side)**
- Uses `@auth0/nextjs-auth0` middleware
- Server-side session management with Redis
- Standard OAuth2 authorization code flow
- Refresh token support

### **2. SPA auth0-spa-js (Client-side)**
- Uses `@auth0/auth0-spa-js` SDK
- Authorization code flow with PKCE
- Silent authentication and token refresh
- Popup and redirect login options

### **3. SPA Auth0 Lock (Legacy Widget)**
- Auth0 Lock v14.0.0 via CDN
- Customizable authentication widget
- Embedded authentication UI
- In-memory session storage for security

### **4. MFA API Testing**
- **Authenticator Management**: List, view, and delete enrolled authenticators
- **OTP Enrollment**: Complete TOTP authenticator enrollment flow
  - QR code generation using qrcode library
  - Real-time enrollment confirmation via secure API
  - Recovery codes display and management
  - Auto-refresh authenticator list on success
- **Push Enrollment**: Guardian app enrollment with real-time status polling
  - QR code generation for Guardian app scanning
  - Secure server-side polling using client secret
  - 5-minute enrollment window with timeout handling
  - Automatic OTP fallback capability
- **State Management**: useReducer pattern for complex state handling
- **Security**: Client secrets protected on backend, MFA tokens handled securely

## **MFA Implementation Details**

### **Component Architecture**
```
/mfa/
├── page.tsx              # Main MFA route with three expandable sections
├── Authenticators.tsx    # List/manage existing authenticators
├── OTPEnrollment.tsx     # TOTP enrollment with QR codes
├── PushEnrollment.tsx    # Guardian push enrollment with polling
└── mfa.module.css        # Component-specific styling
```

### **Key Features**
- **Expandable UI**: All sections use `<details>` elements for better organization
- **Real-time Updates**: SWR integration with `mutate()` for auto-refresh
- **Type Safety**: Comprehensive TypeScript interfaces for all API responses
- **Error Handling**: Proper error states and user feedback throughout
- **Accessibility**: Semantic HTML with proper labels and ARIA attributes

### **OTP Enrollment Flow**
1. POST `/mfa/associate` with `authenticator_types: ["otp"]`
2. Generate QR code from `barcode_uri` using qrcode library
3. User enters verification code from authenticator app
4. POST `/api/mfa/otp/confirm` with OTP and MFA token
5. Display success with full token response

### **Push Enrollment Flow**
1. POST `/mfa/associate` with `authenticator_types: ["oob"], oob_channels: ["auth0"]`
2. Generate QR code from `barcode_uri` for Guardian app
3. Start polling `/api/mfa/push/poll` with `oob_code` every 3 seconds
4. Handle `authorization_pending` vs confirmed responses
5. Auto-timeout after 5 minutes, cleanup intervals properly

### **Security Considerations**
- Client secrets never exposed to frontend
- MFA tokens obtained via `getAccessToken()` on each request
- Proper cleanup of polling intervals to prevent memory leaks
- Error boundaries for API failures and network issues

## **Environment Configuration**

### **Required Environment Variables**

#### **Public Configuration (Safe for Client-Side)**

```
AUTH0_DOMAIN=                    # Auth0 tenant domain
AUTH0_CLIENT_ID=                 # OAuth client ID

# Application Config  
APP_BASE_URL=                    # Application URL
SPA_CLIENT_ID=                   # SPA client ID
DEFAULT_AUDIENCE=                # API audience identifier
MFA_API_AUDIENCE=                # MFA API audience
```

#### **SECRET Variables (Server-Side Only - NEVER Expose to Frontend)**
```
# CRITICAL SECRETS - Must remain server-side only
AUTH0_CLIENT_SECRET=             # 🔒 SECRET: OAuth client secret
AUTH0_SECRET=                    # 🔒 SECRET: Session encryption key
UPSTASH_REDIS_REST_TOKEN=        # 🔒 SECRET: Redis authentication token
UPSTASH_REDIS_REST_URL=          # 🔒 PRIVATE: Redis endpoint (better kept server-side)
```

**⚠️ Security Note**: The SECRET variables above must NEVER be exposed to:
- Client-side JavaScript code
- Browser network logs or dev tools
- Frontend bundle files
- Environment variables with `NEXT_PUBLIC_` prefix

### **Environment Management**
- `switchenv.mjs` utility for switching between environment files
- Usage: `npm run switchenv <env-file-path>`

## **Key Development Notes**

### **Code Style Standards**
- **TypeScript**: Strict typing throughout
- **React**: Modern hooks-based components
- **CSS**: 2-space indentation, kebab-case classes
- **HTML**: 2-space indentation, double quotes
- **JavaScript**: 2-space indentation, double quotes, minimal semicolons

### **Data Fetching Patterns**
- **SWR** for client-side data fetching with caching
- **useSWRImmutable** for configuration data
- Custom `fetchConfig` utility for API config

### **Session Management**
- Redis-based session storage using Redis Sets for inverted indexes
- Session tracking by both `sid` (session ID) and `sub` (subject/user ID) via `SADD`
- Intelligent TTL management: uses `SCARD` to detect new indexes, extends existing ones to longest session lifetime
- Proper timestamp handling: converts absolute expiration to relative seconds for Redis TTL
- OIDC Back-channel logout with proper cleanup using `SREM` to maintain data consistency
- Sequential implementation prioritizing data integrity and reliability

### **Component Architecture**
- Server components for protected routes (`withPageAuthRequired`)
- Client components for interactive auth flows
- **Error Boundaries**: React error boundaries for graceful error handling
  - Generic `ErrorBoundary` component (`/src/components/ErrorBoundary.tsx`)
  - MFA-specific error fallback (`/src/app/mfa/MFAErrorFallback.tsx`)
  - Isolated error containment per MFA component section
  - User-friendly error messages with troubleshooting guidance
- Consistent error/loading state handling
- Reusable styling through global CSS classes

### **Security Considerations**
- All routes protected by Auth0 middleware
- Environment-based configuration (no hardcoded secrets)
- Proper token handling and storage
- CSRF protection through Auth0's built-in security

---

## **Development Commands**

### **Common Tasks**
```bash
npm run dev              # Start development server with Turbopack
npm run build           # Production build
npm run lint            # ESLint check
npm run format          # Prettier formatting
npm run switchenv <file> # Switch environment files
```

### **Testing Authentication Flows**
1. **RWA**: Visit `/rwa` - server-side auth with parameter editor
2. **SPA SDK**: Visit `/spa/auth0-spa-js` - client-side auth with redirect/popup
3. **SPA Lock**: Visit `/spa/lock` - legacy Auth0 Lock widget
4. **MFA**: Visit `/mfa` - requires login with MFA scopes

### **Development Tips**
- Use `switchenv.mjs` to quickly switch between different Auth0 tenants
- All auth flows share the same `/api/config` endpoint for configuration
- Redis session store provides persistent sessions across server restarts
- Global CSS classes ensure consistent styling across all auth flows

This repository represents a comprehensive Auth0 testing platform with modern Next.js architecture, multiple authentication patterns, and consistent design system implementation.