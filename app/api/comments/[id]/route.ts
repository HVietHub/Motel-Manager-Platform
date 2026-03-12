import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { commentService } from '@/lib/services/comment.service'
import { handleApiError, requireAuth } from '@/lib/api-error-handler'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const authError = requireAuth(session?.user?.id)
    if (authError) return authError

    const { id: commentId } = await params
    const body = await request.json()
    const { content } = body

    if (!content) {
      return NextResponse.json(
        { error: 'Nội dung bình luận không được để trống' },
        { status: 400 }
      )
    }

    const comment = await commentService.updateComment(
      commentId,
      content,
      session!.user.id
    )

    return NextResponse.json(comment, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'Error updating comment')
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const authError = requireAuth(session?.user?.id)
    if (authError) return authError

    const { id: commentId } = await params
    await commentService.deleteComment(commentId, session!.user.id)

    return NextResponse.json(
      { message: 'Comment deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    return handleApiError(error, 'Error deleting comment')
  }
}
