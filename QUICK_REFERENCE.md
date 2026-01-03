# Quick Reference Guide

## Setup Checklist

- [ ] Get Supabase credentials from [supabase.com](https://supabase.com)
- [ ] Update `.env.local` with:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- [ ] (Optional) Enable Google OAuth in Supabase
- [ ] Run `npm run dev`
- [ ] Test login/signup at `/auth/login` and `/auth/signup`

## File Quick Links

| File | Purpose |
|------|---------|
| `types/auth.ts` | TypeScript types |
| `lib/authService.ts` | Auth functions |
| `lib/authServer.ts` | Server-side auth |
| `lib/rateLimiter.ts` | Rate limiting |
| `context/AuthContext.tsx` | Global state |
| `hooks/useAuth.ts` | Access auth context |
| `app/auth/login/page.tsx` | Login page |
| `app/auth/signup/page.tsx` | Sign up page |
| `AUTH_SETUP.md` | Full setup guide |
| `ARCHITECTURE.md` | File documentation |

## Common Code Patterns

### Access Auth State
```tsx
const { user, loading, login, logout } = useAuth()
```

### Protect a Page
```tsx
if (!loading && !user) router.push('/auth/login')
```

### Protect an API
```tsx
const user = await protectApiRoute(request)
```

### Show Loading
```tsx
if (loading) return <Spinner />
```

### Show Error
```tsx
if (error) return <div>{error.message}</div>
```

## Pages

| Page | URL | Purpose |
|------|-----|---------|
| Login | `/auth/login` | Email/password login |
| Sign Up | `/auth/signup` | Create account |
| Reset Password | `/auth/reset-password` | Password recovery |
| Logout | `/auth/logout` | Sign out user |
| OAuth Callback | `/auth/callback` | Google OAuth redirect |
| Home | `/` | Dashboard (public) |

## Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Optional (server-side only)
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

## Auth Methods

```tsx
// All available from useAuth() hook

login(email, password)              // Email login
signUp(email, password, fullName)   // Create account
logout()                             // Sign out
signInWithGoogle()                  // Google OAuth
resetPassword(email)                 // Send reset email
clearError()                        // Clear error state
```

## User Object

```tsx
user = {
  id: string              // Unique ID
  email: string           // Email address
  fullName: string | null // Full name
  avatar: string | null   // Avatar URL
  provider: string        // 'email' | 'google'
  createdAt: string       // ISO date
  updatedAt: string       // ISO date
}
```

## Error Codes

```
INVALID_CREDENTIALS      - Wrong email/password
USER_NOT_FOUND          - No account found
USER_ALREADY_EXISTS     - Email already registered
WEAK_PASSWORD           - Password too weak
INVALID_EMAIL           - Invalid format
RATE_LIMIT_EXCEEDED     - Too many attempts
SESSION_EXPIRED         - Session expired
NETWORK_ERROR           - Network issue
UNKNOWN_ERROR           - Unknown error
```

## Rate Limiting

Default settings in `lib/rateLimiter.ts`:
- **5** failed attempts
- **15** minute window
- **30** minute lockout

## Password Requirements

- ✅ Minimum 8 characters
- ✅ At least one uppercase letter
- ✅ At least one lowercase letter
- ✅ At least one number

Example: `MyPassword123`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| User not staying logged in | Check AuthProvider in layout.tsx |
| Google OAuth not working | Enable in Supabase, check redirect URL |
| Rate limiting too strict | Adjust settings in rateLimiter.ts |
| Password rejected | Check requirements above |
| "useAuth outside provider" error | Ensure component is in AuthProvider |

## Security Notes

✅ **Safe to expose:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

❌ **Never expose:**
- `SUPABASE_SERVICE_ROLE_KEY`
- User passwords
- Session tokens (in code)

## Next Steps

1. Update `package.json` metadata
2. Customize `page.tsx` to match your brand
3. Add user profile pages
4. Implement email verification
5. Add two-factor authentication
6. Deploy to production
7. Monitor auth logs

## Support Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

## Database Schema Example

Optional but recommended - create a `users` table:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  provider TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own data" ON users
  FOR UPDATE USING (auth.uid() = id);
```

---

**Ready to go!** 🚀

The authentication system is fully set up and ready to use. Start with [AUTH_SETUP.md](AUTH_SETUP.md) for detailed instructions.
