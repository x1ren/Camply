/**
 * Example: Protected Page Component
 * Shows how to create a page that requires authentication
 */

'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect above)
  if (!user) {
    return null
  }

  // Render protected content
  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={() => router.push('/auth/logout')}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Welcome, {user.fullName || user.email}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-600 text-sm">Email</p>
              <p className="text-gray-900 font-medium">{user.email}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-600 text-sm">Name</p>
              <p className="text-gray-900 font-medium">
                {user.fullName || 'Not provided'}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-600 text-sm">Auth Provider</p>
              <p className="text-gray-900 font-medium capitalize">
                {user.provider}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-600 text-sm">Member Since</p>
              <p className="text-gray-900 font-medium">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {user.avatar && (
            <div className="mt-6">
              <img
                src={user.avatar}
                alt={user.fullName || 'User avatar'}
                className="w-16 h-16 rounded-full"
              />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
