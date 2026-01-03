/**
 * Server-side authentication utilities
 * Use these in server components and API routes for session verification
 */

import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { User } from '@/types/auth'

/**
 * Create a Supabase client for server-side operations
 * This client has access to the service role key (secure on server only)
 */
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Verify user session from cookies
 * Use this in server components to check if user is authenticated
 */
export async function verifyUserSession(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('sb-auth-token')?.value

    if (!authToken) {
      return null
    }

    const supabase = createServerSupabaseClient()

    // Verify the token
    const { data, error } = await supabase.auth.getUser(authToken)

    if (error || !data.user) {
      return null
    }

    return {
      id: data.user.id,
      email: data.user.email || '',
      fullName: data.user.user_metadata?.full_name || null,
      avatar: data.user.user_metadata?.avatar_url || null,
      provider: (data.user.app_metadata?.provider as 'email' | 'google') || 'email',
      createdAt: data.user.created_at,
      updatedAt: data.user.updated_at || new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error verifying session:', error)
    return null
  }
}

/**
 * Get current user from session (for API routes)
 * Use this in API handlers to get the authenticated user
 */
export async function getCurrentUserFromRequest(request: Request): Promise<User | null> {
  try {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.slice(7)
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      return null
    }

    return {
      id: data.user.id,
      email: data.user.email || '',
      fullName: data.user.user_metadata?.full_name || null,
      avatar: data.user.user_metadata?.avatar_url || null,
      provider: (data.user.app_metadata?.provider as 'email' | 'google') || 'email',
      createdAt: data.user.created_at,
      updatedAt: data.user.updated_at || new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error getting user from request:', error)
    return null
  }
}

/**
 * Protect an API route - returns user or throws error
 */
export async function protectApiRoute(request: Request): Promise<User> {
  const user = await getCurrentUserFromRequest(request)

  if (!user) {
    throw new Error('Unauthorized: No valid session')
  }

  return user
}

/**
 * Require admin access (check user has admin role)
 * Set up a users table with an is_admin column in your database
 */
export async function requireAdminAccess(userId: string): Promise<boolean> {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single()

    if (error || !data) {
      return false
    }

    return data.is_admin === true
  } catch (error) {
    console.error('Error checking admin access:', error)
    return false
  }
}
