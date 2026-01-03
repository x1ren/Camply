# Secure Authentication System - Setup Guide

This is a production-ready authentication system for your Next.js app using Supabase and TypeScript.

## Features

✅ **Email/Password Authentication** - Sign up and login with email
✅ **Google OAuth** - One-click Google login
✅ **Session Persistence** - User stays logged in after page refresh
✅ **Password Reset** - Secure password recovery flow
✅ **Rate Limiting** - Prevents brute force login attempts
✅ **TypeScript** - Full type safety for auth objects
✅ **React Context + Hooks** - Global auth state management
✅ **Server-Side Session Verification** - Secure API routes
✅ **Error Handling** - Comprehensive error messages
✅ **Modular Design** - Easy to extend with additional OAuth providers

## Project Structure

```
app/
  auth/
    login/page.tsx           # Login form
    signup/page.tsx          # Registration form
    reset-password/page.tsx  # Password reset form
    logout/page.tsx          # Logout handler
    callback/page.tsx        # OAuth callback handler
  layout.tsx                 # Root layout with AuthProvider
  page.tsx                   # Home page

components/
  (custom components here)

context/
  AuthContext.tsx            # React Context for auth state

hooks/
  useAuth.ts                 # Hook to access auth context

lib/
  authService.ts             # Authentication functions (login, signup, etc.)
  authServer.ts              # Server-side auth utilities
  rateLimiter.ts             # Rate limiting for login attempts
  supabaseClient.ts          # Supabase client initialization

types/
  auth.ts                    # TypeScript types for auth

.env.local                   # Environment variables
```

## Setup Instructions

### 1. Install Required Package

The Supabase package is already installed. Verify it's in `package.json`:

```bash
npm install @supabase/supabase-js
```

### 2. Get Your Supabase Credentials

1. Go to [Supabase Console](https://supabase.com)
2. Create a new project or use existing one
3. Go to **Settings > API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Public Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### 3. Update `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**⚠️ SECURITY WARNING:**
- `NEXT_PUBLIC_*` variables are exposed to the browser - this is intentional for Supabase public key
- `SUPABASE_SERVICE_ROLE_KEY` must NEVER be exposed to the frontend
- Never commit `.env.local` to version control

### 4. Set Up Supabase Database (Optional but Recommended)

Create a `users` table to store additional user info:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  provider TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT users_id_fk FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### 5. Configure Google OAuth (Optional)

To enable Google sign-in:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials (type: Web Application)
3. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)
4. Copy Client ID and Client Secret
5. In Supabase Console, go to **Authentication > Providers > Google**
6. Enable Google and paste your credentials

### 6. Run Your App

```bash
npm run dev
```

Visit `http://localhost:3000`

## Usage

### Using the useAuth Hook

Access authentication state and methods in any component:

```tsx
'use client'

import { useAuth } from '@/hooks/useAuth'

export default function MyComponent() {
  const { user, loading, login, logout, error } = useAuth()

  if (loading) return <div>Loading...</div>

  if (!user) {
    return <button onClick={() => login(email, password)}>Login</button>
  }

  return (
    <div>
      <p>Welcome, {user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### Available Methods

```tsx
const {
  user,              // Current user object (null if not logged in)
  session,           // Session with tokens
  loading,           // Loading state
  error,             // Error object or null
  login,             // (email, password) => Promise<void>
  signUp,            // (email, password, fullName) => Promise<void>
  logout,            // () => Promise<void>
  signInWithGoogle,  // () => Promise<void>
  resetPassword,     // (email) => Promise<void>
  clearError,        // () => void
} = useAuth()
```

### Protecting Pages

Create a protected page component:

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

  if (loading) return <div>Loading...</div>
  if (!user) return null

  return <div>Protected content</div>
}
```

### Protecting API Routes

Use the server-side utilities:

```ts
// app/api/protected/route.ts
import { protectApiRoute } from '@/lib/authServer'

export async function GET(request: Request) {
  try {
    const user = await protectApiRoute(request)
    
    return Response.json({
      message: `Hello ${user.email}`,
      user,
    })
  } catch (error) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
```

## Authentication Flow

### Email/Password Login

1. User enters email and password
2. Rate limiter checks for brute force attempts
3. Supabase validates credentials
4. Session created and stored
5. User redirected to home page

### Google OAuth Login

1. User clicks "Sign in with Google"
2. Redirected to Google login
3. User authorizes app
4. Redirected to `/auth/callback`
5. Session automatically created by Supabase
6. User redirected to home page

### Password Reset

1. User enters email on reset page
2. Email is validated
3. Supabase sends password reset email
4. User clicks link in email
5. User is taken to reset page with token
6. New password is set
7. User can log in with new password

### Session Persistence

- Session tokens stored in browser's secure cookie (managed by Supabase)
- On page load, auth context checks for existing session
- `onAuthStateChange` listener updates state when auth changes
- User remains logged in across page refreshes

## Rate Limiting

The system limits login attempts to prevent brute force attacks:

- **Max Attempts:** 5 failed logins
- **Time Window:** 15 minutes
- **Lockout Duration:** 30 minutes

Configure in `lib/rateLimiter.ts`:

```tsx
const DEFAULT_CONFIG: RateLimitConfig = {
  maxAttempts: 5,           // Change this
  windowMs: 15 * 60 * 1000, // Change this
  lockoutMs: 30 * 60 * 1000, // Change this
}
```

## Password Requirements

Passwords must have:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)

## Error Handling

All auth errors are typed with `AuthError`:

```tsx
interface AuthError {
  code: string                    // Error code enum
  message: string                 // User-friendly message
  details?: string               // Additional details
}
```

Available error codes in `AuthErrorCode`:
- `INVALID_CREDENTIALS` - Wrong email/password
- `USER_NOT_FOUND` - No account with that email
- `USER_ALREADY_EXISTS` - Email already registered
- `WEAK_PASSWORD` - Password doesn't meet requirements
- `INVALID_EMAIL` - Invalid email format
- `RATE_LIMIT_EXCEEDED` - Too many login attempts
- `SESSION_EXPIRED` - Session token expired
- `NETWORK_ERROR` - Network connectivity issue
- `UNKNOWN_ERROR` - Unknown error

## Extending with More OAuth Providers

To add another OAuth provider (like GitHub):

1. **Update `types/auth.ts`:**

```tsx
export interface User {
  provider: 'email' | 'google' | 'github' // Add 'github'
  // ... rest of fields
}
```

2. **Add method in `lib/authService.ts`:**

```tsx
export async function signInWithGitHub(): Promise<void> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
      },
    })
    if (error) throw error
  } catch (error) {
    throw mapSupabaseError(error)
  }
}
```

3. **Update `context/AuthContext.tsx`:**

```tsx
const handleSignInWithGitHub = useCallback(async () => {
  try {
    setError(null)
    setLoading(true)
    await signInWithGitHub()
  } catch (err: any) {
    // ... error handling
  } finally {
    setLoading(false)
  }
}, [])

const value: AuthContextType = {
  // ... existing properties
  signInWithGitHub: handleSignInWithGitHub,
}
```

4. **Add button in login/signup pages:**

```tsx
<button onClick={handleGitHubLogin}>Sign in with GitHub</button>
```

5. **Configure in Supabase:**
   - Go to Authentication > Providers > GitHub
   - Add your GitHub OAuth credentials

## Security Best Practices

✅ **Implemented:**
- Service role key never exposed to frontend
- Rate limiting on login attempts
- Password validation requirements
- Session tokens in secure cookies
- CSRF protection (automatic with Next.js)
- Type safety prevents runtime errors
- No passwords stored in logs
- SQL injection prevention (Supabase)

✅ **Do This:**
- Enable email confirmation (in Supabase)
- Use HTTPS in production
- Regularly rotate secrets
- Monitor failed login attempts
- Implement multi-factor authentication (Supabase)
- Use environment variables for secrets
- Never commit `.env.local`

## Environment Variables Summary

| Variable | Purpose | Public? |
|----------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key | ❌ No (Server only) |

## Troubleshooting

### Users not staying logged in
- Check that `AuthProvider` wraps entire app in `layout.tsx`
- Ensure browser cookies are enabled
- Check browser console for auth errors

### Google OAuth not working
- Verify OAuth app credentials in Supabase
- Check redirect URI matches exactly
- Clear browser cache and cookies
- Ensure Google provider is enabled in Supabase

### Rate limiting too strict
- Adjust `maxAttempts`, `windowMs`, `lockoutMs` in `rateLimiter.ts`
- Clear rate limiter: `rateLimiter.resetAll()`

### Passwords not accepted
- Password must be 8+ chars
- Must include uppercase, lowercase, number
- Check error message in UI

### Session lost on refresh
- Verify `onAuthStateChange` is set up in `AuthContext.tsx`
- Check Supabase is returning valid tokens
- Look for errors in browser console

## API Reference

### useAuth Hook

```tsx
const {
  user: User | null                      // Current authenticated user
  session: Session | null                // Session with tokens
  loading: boolean                       // True while auth state is loading
  error: AuthError | null                // Last error, if any
  login: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  clearError: () => void                 // Clear error state
} = useAuth()
```

### Server-Side Functions

```tsx
// Verify session from cookies
const user = await verifyUserSession(): Promise<User | null>

// Get user from API request
const user = await getCurrentUserFromRequest(request): Promise<User | null>

// Protect an API route (throws if not authenticated)
const user = await protectApiRoute(request): Promise<User>

// Check admin access
const isAdmin = await requireAdminAccess(userId): Promise<boolean>
```

## Support

For issues, check:
1. Browser console for errors
2. Supabase Dashboard logs
3. Network tab in DevTools
4. Environment variables are correct
5. Supabase project is active

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Configure environment variables
3. ✅ Enable Google OAuth (optional)
4. ✅ Test login/signup/logout flows
5. ✅ Customize UI to match your branding
6. ✅ Add additional OAuth providers
7. ✅ Set up email confirmation (Supabase)
8. ✅ Implement two-factor authentication (Supabase)
9. ✅ Add user profile management
10. ✅ Deploy to production

Happy coding! 🚀
