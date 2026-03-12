import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { commentService } from '@/lib/services/comment.service'
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
    const body = await request.json()
    const { content, parentId } = body

    if (!content) {
      return NextResponse.json(
        { error: 'Nội dung bình luận không được để trống' },
        { status: 400 }
      )
    }

    const comment = await commentService.createComment(
      postId,
      session!.user.id,
      { content, parentId }
    )

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'Error creating comment')
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const comments = await commentService.getComments(postId)

    return NextResponse.json(comments, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'Error getting comments')
  }
}
