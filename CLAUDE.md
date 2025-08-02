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
    ├── lib/
    │   ├── auth0.ts       # Custom Redis session store
    │   └── fetchConfig.ts # API config fetcher
    └── app/               # Next.js App Router structure
```

### **Authentication Setup**
- **Redis Session Store**: Custom implementation with sophisticated session management
  - Tracks sessions by `sid` (session ID) and `sub` (subject/user ID)
  - Handles session expiration and cleanup
  - Uses Upstash Redis for persistence
- **Middleware**: Auth0 middleware applied to all routes except static assets

## **Routing Structure & Components**

### **Main Routes**

#### **1. Root Layout (`/layout.tsx`)**
```typescript
// Features:
- Global navigation header with 32px prominent site title
- Navigation links to all auth flows
- Consistent .app-container styling
- LoginToMFATester component integration
```

#### **2. Home Page (`/page.tsx`)**
```typescript
// Status: Empty React fragment - minimal placeholder
// Returns: <></>
```

#### **3. Regular Web Application (`/rwa/`)**
```typescript
// Files: page.tsx, LoginAndOut.tsx, rwa.module.css
// Features:
- Server-side Auth0 authentication flow
- Custom login/logout parameters editor (JSON textarea)
- Session token display (access, ID, refresh tokens)
- Direct Auth0 logout URL links (v2 and OIDC endpoints)
```

#### **4. SPA auth0-spa-js (`/spa/auth0-spa-js/`)**
```typescript
// Files: page.tsx
// Features:
- Client-side authentication using @auth0/auth0-spa-js
- Login with redirect and popup flows
- Silent token refresh functionality
- Session state management with React hooks
```

#### **5. SPA Auth0 Lock (`/spa/lock/`)**
```typescript
// Files: route.ts (API route)
// Features:
- Serves static lock.html from public directory
- Route handler returns HTML with proper content-type headers
```

#### **6. MFA API Tester (`/mfa/`)**
```typescript
// Files: page.tsx, Authenticators.tsx
// Features:
- Protected route (withPageAuthRequired)
- Auth0 Management API integration
- MFA authenticators endpoint testing
- HTTP status and JSON response display
```

### **API Routes**

#### **Configuration API (`/api/config/route.ts`)**
```typescript
// Returns:
{
  auth0_domain: process.env.AUTH0_DOMAIN,
  app_base_url: process.env.APP_BASE_URL,
  spa_client_id: process.env.SPA_CLIENT_ID,
  default_audience: process.env.DEFAULT_AUDIENCE
}
```

### **Static Assets**

#### **Auth0 Lock HTML (`/public/lock.html`)**
```html
// Features:
- Standalone HTML page with Auth0 Lock integration
- Dynamic config fetching from /api/config
- Complete auth flow (login, logout, token display)
- Local storage session persistence
- Error handling and loading states
- 2-space indentation, double quotes, minimal semicolons
```

## **Styling Architecture**

### **Global CSS (`/src/app/globals.css`)**
```css
/* Core Design System */
- Roboto font family (Google Fonts)
- 800px max-width container
- Consistent spacing (20px outer, 30px inner padding)
- Component-based utility classes:
  - .btn, .btn-primary, .btn-danger, .btn-secondary
  - .section, .user-info, .token-display
  - .loading, .error
  - .list-unstyled, .link-list
  - .app-container, .app-header, .nav-list

/* Color Scheme */
- Primary: #007bff (Bootstrap blue)
- Danger: #dc3545 (Bootstrap red)
- Secondary: #6c757d (Bootstrap gray)
- Background: #f5f5f5 (Light gray)
- Text: #333 (Dark gray)
```

### **Module CSS**
- **RWA Module**: `rwa.module.css` with custom parameter editor styles
- **Naming Convention**: kebab-case (e.g., `custom-params-editor`)

### **Design Consistency**
- All pages use same container, button, and token display styling
- Unified navigation header across React components
- Professional card-based layout with shadows and rounded corners

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
- Session persistence in localStorage

### **4. MFA API Testing**
- Auth0 Management API integration
- Requires specific MFA scopes
- Tests authenticator enrollment/management endpoints

## **Environment Configuration**

### **Required Environment Variables**
```bash
# Auth0 Core Config
AUTH0_DOMAIN=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH0_SECRET=

# Application Config  
APP_BASE_URL=
SPA_CLIENT_ID=
DEFAULT_AUDIENCE=
MFA_API_AUDIENCE=

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

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
- Redis-based session storage with custom implementation
- Session tracking by both session ID and user ID
- Automatic cleanup and expiration handling
- Support for logout token-based session invalidation

### **Component Architecture**
- Server components for protected routes (`withPageAuthRequired`)
- Client components for interactive auth flows
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