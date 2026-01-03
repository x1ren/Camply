/**
 * Example: Protected API Route
 * Shows how to secure API endpoints with authentication
 */

import { protectApiRoute, getCurrentUserFromRequest } from '@/lib/authServer'

/**
 * GET /api/user/profile
 * Returns the authenticated user's profile
 */
export async function GET(request: Request) {
  try {
    // Verify the request is authenticated
    const user = await protectApiRoute(request)

    // Return user profile
    return Response.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        provider: user.provider,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

/**
 * POST /api/user/profile
 * Updates the authenticated user's profile
 */
export async function POST(request: Request) {
  try {
    // Verify authentication
    const user = await protectApiRoute(request)

    // Parse request body
    const body = await request.json()
    const { fullName, avatar } = body

    // Validate input
    if (fullName && fullName.trim().length < 2) {
      return Response.json(
        { error: 'Full name must be at least 2 characters' },
        { status: 400 }
      )
    }

    // Here you would update the user in your database
    // Example: await db.users.update(user.id, { fullName, avatar })

    return Response.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        fullName: fullName || user.fullName,
        avatar: avatar || user.avatar,
      },
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Example: Using getCurrentUserFromRequest for more granular control
 * 
 * This approach gives you more control than protectApiRoute
 */
export async function DELETE(request: Request) {
  // Get user without throwing - returns null if not authenticated
  const user = await getCurrentUserFromRequest(request)

  if (!user) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Custom logic here
  if (user.email !== 'admin@example.com') {
    return Response.json(
      { error: 'You do not have permission to delete accounts' },
      { status: 403 }
    )
  }

  // Proceed with deletion
  return Response.json({
    success: true,
    message: 'Account deleted',
  })
}
