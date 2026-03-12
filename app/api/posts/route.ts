import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createPost, getPosts } from '@/lib/services/post.service'
import { handleApiError, requireAuth } from '@/lib/api-error-handler'

/**
 * GET /api/posts - Get posts with filters
 * 
 * Query parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - authorId: string (optional)
 * - authorType: 'LANDLORD' | 'TENANT' (optional)
 * - search: string (optional)
 * 
 * Requirements: 8.1, 10.1, 10.2, 10.4
 */
export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions)
    const authError = requireAuth(session?.user?.id)
    if (authError) return authError

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const authorId = searchParams.get('authorId') || undefined
    const authorType = searchParams.get('authorType') as 'LANDLORD' | 'TENANT' | undefined
    const search = searchParams.get('search') || undefined

    // Get posts
    const posts = await getPosts({
      page,
      limit,
      authorId,
      authorType,
      search,
      currentUserId: session!.user.id
    })

    return NextResponse.json(posts)
  } catch (error) {
    return handleApiError(error, 'Get posts error')
  }
}

/**
 * POST /api/posts - Create a new post
 * 
 * Body:
 * - content: string (required, 1-5000 characters)
 * - images: string[] (optional, max 10 images)
 * 
 * Requirements: 8.1, 10.1, 10.2, 10.3
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions)
    const authError = requireAuth(session?.user?.id)
    if (authError) return authError

    // Parse request body
    const body = await request.json()
    const { content, images } = body

    // Create post
    const post = await createPost(session!.user.id, {
      content,
      images
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'Create post error')
  }
}
