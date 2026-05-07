import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { CommunityFeed } from '@/components/community/community-feed'
import { prisma } from '@/lib/prisma'
import { PlanTier, PLAN_LIMITS, planHasFeature } from '@/lib/constants/plans'
import Link from 'next/link'
import { Lock } from 'lucide-react'

export default async function LandlordCommunityPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { landlord: true },
  })

  if (!user?.landlord) {
    redirect('/login')
  }

  const landlordId = user.landlord.id
  const plan = ((user.landlord as any).plan as PlanTier) ?? PlanTier.FREE
  const limits = PLAN_LIMITS[plan]

  // ── Plan gate: communityPosts requires Starter+ ──────────────────────────
  if (!planHasFeature(plan, 'communityPosts')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="max-w-md space-y-5">
          <div className="h-14 w-14 rounded-2xl border border-amber-200 bg-amber-50 flex items-center justify-center mx-auto">
            <Lock className="h-6 w-6 text-amber-500" strokeWidth={1.5} />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Tính năng Cộng Đồng
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Gói <strong>{plan}</strong> hiện tại chưa hỗ trợ tính năng cộng đồng người thuê.
              Nâng cấp lên gói <strong>Starter</strong> trở lên để:
            </p>
          </div>

          <ul className="text-sm text-left space-y-2 bg-amber-50 border border-amber-100 rounded-xl p-4">
            {[
              'Đăng bài thông báo cho toàn bộ người thuê',
              'Người thuê bình luận và tương tác',
              'Tạo không gian cộng đồng riêng cho nhà trọ của bạn',
              'Thông báo qua email tự động',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-gray-700">
                <span className="text-amber-500 mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>

          <div className="text-xs text-muted-foreground">
            Gói Starter từ{' '}
            <span className="font-semibold text-gray-700">
              {PLAN_LIMITS[PlanTier.STARTER].priceVnd.toLocaleString('vi-VN')}đ / tháng
            </span>
          </div>

          <Link
            href="/landlord/payment"
            className="inline-flex items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-6 py-2.5 transition-colors"
          >
            Xem các gói dịch vụ →
          </Link>
        </div>
      </div>
    )
  }

  // ── Fetch posts scoped to this landlord's community ───────────────────────
  const posts = await prisma.$queryRaw<any[]>`
    SELECT 
      p.id, p."authorId", p."authorType", p."landlordId", p.content, p.images,
      p."createdAt", p."updatedAt",
      u.id as "userId", u.name as "userName", u.email as "userEmail"
    FROM "Post" p
    JOIN "User" u ON u.id = p."authorId"
    WHERE p."landlordId" = ${landlordId}
    ORDER BY p."createdAt" DESC
    LIMIT 20
  `

  const postIds = posts.map((p) => p.id)

  const [likes, comments, shares] = postIds.length > 0
    ? await Promise.all([
        prisma.like.findMany({ where: { postId: { in: postIds } } }),
        prisma.comment.findMany({ where: { postId: { in: postIds } } }),
        prisma.share.findMany({ where: { postId: { in: postIds } } }),
      ])
    : [[], [], []]

  const postsWithCounts = posts.map((post) => ({
    id: post.id,
    content: post.content,
    images: (() => {
      try { return JSON.parse(post.images) } catch { return [] }
    })(),
    createdAt: new Date(post.createdAt).toISOString(),
    author: { id: post.userId, name: post.userName, email: post.userEmail },
    authorType: post.authorType as 'LANDLORD' | 'TENANT',
    likeCount: likes.filter((l) => l.postId === post.id).length,
    commentCount: comments.filter((c) => c.postId === post.id).length,
    shareCount: shares.filter((s) => s.postId === post.id).length,
    isLikedByCurrentUser: likes.some((l) => l.postId === post.id && l.userId === user.id),
  }))

  return (
    <CommunityFeed
      initialPosts={postsWithCounts}
      currentUserId={user.id}
      userName={user.name || 'User'}
    />
  )
}
