import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getPost, updatePost, deletePost } from '@/lib/services/post.service'
import { handleApiError, requireAuth } from '@/lib/api-error-handler'

/**
 * GET /api/posts/[id] - Get a single post
 * 
 * Requirements: 8.1, 10.4
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions)
    const authError = requireAuth(session?.user?.id)
    if (authError) return authError

    const { id } = await params
    const post = await getPost(id, session!.user.id)

    if (!post) {
      return NextResponse.json(
        { error: 'Bài viết không tồn tại hoặc đã bị xóa' },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    return handleApiError(error, 'Get post error')
  }
}

/**
 * PATCH /api/posts/[id] - Update a post
 * 
 * Body:
 * - content: string (optional, 1-5000 characters)
 * - images: string[] (optional, max 10 images)
 * 
 * Requirements: 8.1, 8.5, 10.1, 10.3, 10.4
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions)
    const authError = requireAuth(session?.user?.id)
    if (authError) return authError

    // Parse request body
    const body = await request.json()
    const { content, images } = body

    const { id } = await params
    // Update post
    const post = await updatePost(id, session!.user.id, {
      content,
      images
    })

    return NextResponse.json(post)
  } catch (error) {
    return handleApiError(error, 'Update post error')
  }
}

/**
 * DELETE /api/posts/[id] - Delete a post
 * 
 * Requirements: 8.1, 8.6, 10.3, 10.4
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions)
    const authError = requireAuth(session?.user?.id)
    if (authError) return authError

    const { id } = await params
    // Delete post
    await deletePost(id, session!.user.id)

    return NextResponse.json(
      { message: 'Post deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    return handleApiError(error, 'Delete post error')
  }
}
