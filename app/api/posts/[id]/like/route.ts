import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { likeService } from '@/lib/services/like.service'
import { handleApiError, requireAuth } from '@/lib/api-error-handler'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const authError = requireAuth(session?.user?.id)
    if (authError) return authError

    const { id: postId } = await params
    const result = await likeService.toggleLike(postId, session!.user.id)

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'Error toggling like')
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const likes = await likeService.getLikes(postId)

    return NextResponse.json({ likes }, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'Error getting likes')
  }
}
