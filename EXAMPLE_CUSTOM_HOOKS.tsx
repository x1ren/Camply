/**
 * Example: Custom Authentication Hooks
 * Shows how to create specialized auth hooks for common patterns
 */

'use client'

import { useAuth } from '@/hooks/useAuth'
import { useCallback, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Hook: useAuthGuard
 * Redirects to login if not authenticated
 */
export function useAuthGuard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading])

  return { isAuthenticated: !!user, loading }
}

/**
 * Hook: useAuthForm
 * Handles auth form state and submission
 */
export function useAuthForm(onSubmit: (email: string, password: string) => Promise<void>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)

      try {
        setIsLoading(true)
        await onSubmit(email, password)
      } catch (err: any) {
        setError(err.message || 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    },
    [email, password, onSubmit]
  )

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    error,
    handleSubmit,
    clearError: () => setError(null),
  }
}

/**
 * Hook: useRequireAdmin
 * Checks if user has admin privileges (requires custom implementation)
 * This is an example - implement your own admin check
 */
export function useRequireAdmin() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  return { isAuthenticated: !!user, loading }
}

/**
 * Hook: useAsyncAuth
 * Performs async auth action with proper error/loading handling
 */
export function useAsyncAuth() {
  const { error: contextError, loading: contextLoading } = useAuth()
  const [localLoading, setLocalLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const executeAsync = useCallback(
    async (authFn: () => Promise<void>) => {
      setLocalError(null)
      setLocalLoading(true)

      try {
        await authFn()
      } catch (err: any) {
        setLocalError(err.message || 'An error occurred')
        throw err
      } finally {
        setLocalLoading(false)
      }
    },
    []
  )

  return {
    executeAsync,
    loading: contextLoading || localLoading,
    error: localError || contextError?.message,
  }
}

/**
 * Example Usage:
 * 
 * const { email, password, handleSubmit, error, isLoading } = useAuthForm(async (email, password) => {
 *   await login(email, password)
 * })
 * 
 * return (
 *   <form onSubmit={handleSubmit}>
 *     <input value={email} onChange={e => setEmail(e.target.value)} />
 *     <input value={password} onChange={e => setPassword(e.target.value)} />
 *     <button disabled={isLoading}>Login</button>
 *     {error && <p>{error}</p>}
 *   </form>
 * )
 */
