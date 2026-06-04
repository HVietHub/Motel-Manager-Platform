import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createPost, getPosts } from '@/lib/services/community/post.service'
import { handleApiError, requireAuth } from '@/lib/errors/api-error-handler'
import { prisma } from '@/lib/prisma'
import { PlanTier, planHasFeature } from '@/lib/constants/plans'

/**
 * Resolve the landlordId for the current session user.
 * - LANDLORD → their own landlordId
 * - TENANT   → the landlordId of the landlord they rent from
 * Returns null if not resolvable (tenant not yet assigned).
 */
async function resolveLandlordId(userId: string, role: string): Promise<string | null> {
  if (role === 'LANDLORD') {
    const landlord = await prisma.landlord.findUnique({
      where: { userId },
      select: { id: true },
    })
    return landlord?.id ?? null
  }

  if (role === 'TENANT') {
    const tenant = await prisma.tenant.findUnique({
      where: { userId },
      select: { landlordId: true },
    })
    // landlordId defaults to "" when tenant hasn't been assigned yet
    const id = tenant?.landlordId
    return id && id.trim() !== '' ? id : null
  }

  return null
}

/**
 * GET /api/posts - Get posts scoped to the current user's landlord community
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const authError = requireAuth(session?.user?.id)
    if (authError) return authError

    const landlordId = await resolveLandlordId(session!.user.id, session!.user.role)
    if (!landlordId) {
      // Tenant not yet assigned to a landlord — return empty community gracefully
      return NextResponse.json([])
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const authorId = searchParams.get('authorId') || undefined
    const search = searchParams.get('search') || undefined

    const posts = await getPosts({
      page,
      limit,
      authorId,
      search,
      landlordId,
      currentUserId: session!.user.id,
    })

    return NextResponse.json(posts)
  } catch (error) {
    return handleApiError(error, 'Get posts error')
  }
}

/**
 * POST /api/posts - Create a post in the current user's landlord community
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const authError = requireAuth(session?.user?.id)
    if (authError) return authError

    const landlordId = await resolveLandlordId(session!.user.id, session!.user.role)
    if (!landlordId) {
      return NextResponse.json(
        { error: 'Bạn chưa được gán vào nhà trọ nào. Vui lòng liên hệ chủ nhà.' },
        { status: 403 }
      )
    }

    const landlord = await (prisma.landlord.findUnique as any)({
      where: { id: landlordId },
      select: { plan: true },
    })
    const plan = (landlord?.plan as PlanTier) ?? PlanTier.FREE
    if (!planHasFeature(plan, 'communityPosts')) {
      return NextResponse.json(
        {
          error: 'PLAN_REQUIRED',
          message: `Tính năng cộng đồng yêu cầu chủ nhà sở hữu gói Starter trở lên. Gói hiện tại: ${plan}.`,
          requiredPlan: PlanTier.STARTER,
          currentPlan: plan,
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { content, images } = body

    const post = await createPost(session!.user.id, {
      content,
      images,
      landlordId,
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'Create post error')
  }
}
