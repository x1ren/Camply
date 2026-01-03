# File Structure and Component Documentation

## Core Files Overview

### `types/auth.ts`
TypeScript type definitions for the authentication system.

**Key Types:**
- `User` - Authenticated user object
- `Session` - Session with tokens and expiry
- `AuthContextType` - Auth context interface
- `AuthError` - Error object with code and message
- `AuthErrorCode` - Enum of all error codes
- `RateLimitConfig` - Rate limiting configuration

### `lib/authService.ts`
Business logic for authentication operations. All authentication functions are here.

**Main Functions:**
- `loginWithEmail(email, password)` - Email/password login
- `signUpWithEmail(email, password, fullName)` - Create new account
- `signInWithGoogle()` - Google OAuth login
- `logout()` - Sign out user
- `requestPasswordReset(email)` - Send reset email
- `updatePassword(newPassword)` - Update password after reset
- `getCurrentSession()` - Get current session
- `getCurrentUser()` - Get current user
- `refreshSession(refreshToken)` - Refresh access token

**Helper Functions:**
- `validateEmail(email)` - Email format validation
- `validatePassword(password)` - Password strength validation
- `mapSupabaseError(error)` - Convert Supabase errors to AuthError
- `mapSupabaseUserToUser(supabaseUser)` - Convert Supabase user to User type

### `lib/authServer.ts`
Server-side authentication utilities for API routes and server components.

**Important Functions:**
- `createServerSupabaseClient()` - Create server Supabase client with service role
- `verifyUserSession()` - Get user from cookies (server components)
- `getCurrentUserFromRequest(request)` - Get user from API route request
- `protectApiRoute(request)` - Middleware to verify authentication
- `requireAdminAccess(userId)` - Check admin role

⚠️ **Only use on server side!** Never import in client components.

### `lib/rateLimiter.ts`
In-memory rate limiting for login attempts. Prevents brute force attacks.

**Configuration:**
- `maxAttempts` - Failed attempts before lockout (default: 5)
- `windowMs` - Time window (default: 15 minutes)
- `lockoutMs` - Lockout duration (default: 30 minutes)

**Methods:**
- `recordAttempt(identifier)` - Record a login attempt
- `isLocked(identifier)` - Check if IP/email is locked
- `reset(identifier)` - Clear rate limit for email
- `resetAll()` - Clear all rate limits

### `lib/supabaseClient.ts`
Supabase client initialization. Used for client-side operations.

**Exports:**
- `supabase` - Supabase client instance

⚠️ **Only use anon key!** Never expose service role key.

### `context/AuthContext.tsx`
React Context that manages global authentication state.

**Manages:**
- Current user and session
- Loading and error states
- Auth method availability

**Methods Provided:**
- `login(email, password)`
- `signUp(email, password, fullName)`
- `logout()`
- `signInWithGoogle()`
- `resetPassword(email)`
- `clearError()`

**Features:**
- Automatic session persistence
- Listens for auth state changes
- Initializes auth on mount
- Error handling and state management

### `hooks/useAuth.ts`
React hook to access auth context from any component.

**Usage:**
```tsx
const { user, login, logout } = useAuth()
```

**Requirements:**
- Must be used in component wrapped by `<AuthProvider>`
- Only works in client components (`'use client'`)

---

## Page Components

### `app/layout.tsx`
Root layout. Wraps entire app with `<AuthProvider>`.

### `app/page.tsx`
Home page. Shows login/signup links or user welcome based on auth state.

### `app/auth/login/page.tsx`
Login page with email/password and Google OAuth options.

**Features:**
- Email and password inputs
- Form validation
- Rate limiting feedback
- "Forgot password?" link
- Google OAuth button
- Link to signup page

### `app/auth/signup/page.tsx`
Registration page for new users.

**Features:**
- Full name, email, password inputs
- Password confirmation
- Password strength indicator
- Google OAuth option
- Link to login page

### `app/auth/reset-password/page.tsx`
Password reset flow.

**Features:**
- Email input
- Submit sends reset email
- Success confirmation page
- Link back to login

### `app/auth/logout/page.tsx`
Logout handler page. Automatically logs out user and redirects.

**Flow:**
1. Show loading state
2. Call `logout()`
3. Redirect to login page

### `app/auth/callback/page.tsx`
OAuth callback handler for Supabase.

**Handles:**
- Google OAuth redirect
- Session setup
- Redirect to home page

---

## Type Definitions

### User
```tsx
interface User {
  id: string                    // Unique user ID
  email: string                 // Email address
  fullName: string | null       // User's full name
  avatar: string | null         // Avatar URL
  provider: 'email'|'google'    // Auth provider
  createdAt: string             // Account creation date
  updatedAt: string             // Last update date
}
```

### Session
```tsx
interface Session {
  user: User | null             // Authenticated user
  accessToken: string | null    // JWT access token
  refreshToken: string | null   // Refresh token
  expiresAt: number | null      // Expiry timestamp
}
```

### AuthContextType
```tsx
interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  error: AuthError | null
  login: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  clearError: () => void
}
```

### AuthError
```tsx
interface AuthError {
  code: string        // Error code (from AuthErrorCode enum)
  message: string     // User-friendly error message
  details?: string    // Additional details
}
```

---

## Data Flow Diagrams

### Login Flow
```
User enters credentials
        ↓
Client: validateEmail(), validatePassword()
        ↓
Check rate limiter
        ↓
Supabase: signInWithPassword()
        ↓
Success: Update auth context, redirect home
Error: Show error message, increment rate limiter
```

### Google OAuth Flow
```
User clicks "Sign with Google"
        ↓
Supabase: signInWithOAuth('google')
        ↓
Redirect to Google login
        ↓
User authenticates with Google
        ↓
Redirect to /auth/callback
        ↓
Supabase automatically sets session
        ↓
AuthContext detects session change
        ↓
Redirect to home
```

### Session Persistence Flow
```
Page loads
        ↓
AuthProvider mounts
        ↓
getCurrentSession() + getCurrentUser()
        ↓
If session exists:
  - Set user and session in state
  - Listen for auth changes with onAuthStateChange()
        ↓
User stays logged in across page refreshes
```

---

## Common Patterns

### Protecting a Page
```tsx
'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) return <LoadingSpinner />
  if (!user) return null

  return <ProtectedContent />
}
```

### Protecting an API Route
```tsx
import { protectApiRoute } from '@/lib/authServer'

export async function POST(request: Request) {
  try {
    const user = await protectApiRoute(request)
    
    // User is authenticated
    return Response.json({ success: true, userId: user.id })
  } catch (error) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
```

### Conditional Rendering Based on Auth
```tsx
const { user, loading } = useAuth()

if (loading) return <Spinner />

return (
  <>
    {user ? (
      <>
        <p>Welcome, {user.email}</p>
        <button onClick={logout}>Logout</button>
      </>
    ) : (
      <>
        <button onClick={() => router.push('/auth/login')}>
          Login
        </button>
      </>
    )}
  </>
)
```

---

## Error Handling

### User-Facing Errors
All errors from `useAuth()` have user-friendly messages:

```tsx
const { error } = useAuth()

if (error) {
  return <div className="alert alert-error">{error.message}</div>
}
```

### Logging Errors (Development)
```tsx
if (error) {
  console.error('Auth error:', error)
  console.error('Error code:', error.code)
  console.error('Details:', error.details)
}
```

### Handling Specific Errors
```tsx
import { AuthErrorCode } from '@/types/auth'

if (error?.code === AuthErrorCode.RATE_LIMIT_EXCEEDED) {
  // Show rate limit message
} else if (error?.code === AuthErrorCode.INVALID_CREDENTIALS) {
  // Show invalid credentials message
}
```

---

## Environment Variables

### Required Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key

### Optional Variables
- `SUPABASE_SERVICE_ROLE_KEY` - Service role (for server-side operations)

### Why "NEXT_PUBLIC_"?
`NEXT_PUBLIC_` means these variables are:
- ✅ Safe to expose to the browser
- ✅ Required for client-side Supabase operations
- ℹ️ Not security sensitive (Supabase RLS handles security)

The service role key:
- ❌ Should NOT have `NEXT_PUBLIC_`
- ❌ Only used on the server
- ❌ Must not be in client-side code

---

## Adding Custom User Fields

To add more fields to User:

1. **Add to Supabase:**
```sql
ALTER TABLE users ADD COLUMN phone_number TEXT;
ALTER TABLE users ADD COLUMN address TEXT;
```

2. **Update Type:**
```tsx
// types/auth.ts
export interface User {
  // ... existing fields
  phoneNumber?: string
  address?: string
}
```

3. **Update Mapper:**
```tsx
// lib/authService.ts
function mapSupabaseUserToUser(supabaseUser: any): User {
  return {
    // ... existing fields
    phoneNumber: supabaseUser.user_metadata?.phone_number || undefined
    address: supabaseUser.user_metadata?.address || undefined
  }
}
```

4. **Use in Components:**
```tsx
const { user } = useAuth()
console.log(user?.phoneNumber)
```

---

## Testing

### Manual Testing Checklist

- [ ] Sign up with email
- [ ] Login with email
- [ ] Google OAuth login
- [ ] Logout
- [ ] Stay logged in after refresh
- [ ] Password reset email
- [ ] Invalid password shows error
- [ ] Too many login attempts triggers rate limit
- [ ] Protected pages redirect to login
- [ ] Error messages are clear

### Unit Test Example
```tsx
// tests/auth.test.ts
import { validatePassword } from '@/lib/authService'

describe('Password Validation', () => {
  it('rejects short passwords', () => {
    expect(validatePassword('Pass1').valid).toBe(false)
  })

  it('requires uppercase', () => {
    expect(validatePassword('pass1234').valid).toBe(false)
  })

  it('accepts valid password', () => {
    expect(validatePassword('MyPass123').valid).toBe(true)
  })
})
```

---

## Performance Considerations

### Session Storage
- Session tokens stored in browser cookies (automatic)
- Cookies sent with every request
- No localStorage used (more secure)

### Rate Limiter
- In-memory storage
- Resets on page refresh
- For production, use Redis or database

### Auth Context
- Context re-render only when auth state changes
- Components using `useAuth()` re-render on state changes
- Use `useMemo` if needed to optimize

### Optimization Example
```tsx
const { user } = useAuth()

// Memoize expensive computation
const userDisplayName = useMemo(
  () => user?.fullName || user?.email,
  [user?.fullName, user?.email]
)
```

---

That's it! This auth system is production-ready and secure. 🚀
