import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { CommunityFeed } from '@/components/community/community-feed'
import { prisma } from '@/lib/prisma'

export default async function TenantCommunityPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenant: true },
  })

  if (!user?.tenant) {
    redirect('/login')
  }

  // Tenant's community is scoped to their landlord
  const landlordId = user.tenant.landlordId

  if (!landlordId) {
    // Tenant hasn't been assigned to a landlord yet
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p className="text-lg font-medium mb-2">Chưa có cộng đồng</p>
        <p className="text-sm">Bạn chưa được gán vào nhà trọ nào. Vui lòng liên hệ chủ nhà để được mời vào.</p>
      </div>
    )
  }

  // Only fetch posts belonging to this landlord's community
  // Using $queryRaw until Prisma client is regenerated with landlordId field
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
