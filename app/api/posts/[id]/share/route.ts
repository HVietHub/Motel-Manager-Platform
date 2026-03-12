import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { shareService } from '@/lib/services/share.service'
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
    const { sharedWith } = body

    const share = await shareService.sharePost(
      postId,
      session!.user.id,
      sharedWith
    )

    return NextResponse.json(share, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'Error sharing post')
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const shares = await shareService.getShares(postId)

    return NextResponse.json({ shares }, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'Error getting shares')
  }
}
