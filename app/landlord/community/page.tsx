import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { CommunityFeed } from '@/components/community/community-feed'
import { prisma } from '@/lib/prisma'

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

  const posts = await prisma.post.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      likes: true,
      comments: true,
      shares: true,
    },
  })

  const postsWithCounts = posts.map(post => {
    const author = post.authorType === 'LANDLORD' 
      ? { id: post.authorId, name: 'Landlord', email: '' }
      : { id: post.authorId, name: 'Tenant', email: '' }

    return {
      id: post.id,
      content: post.content,
      images: Array.isArray(post.images) ? post.images : post.images ? [post.images] : undefined,
      createdAt: post.createdAt.toISOString(),
      author,
      authorType: post.authorType as 'LANDLORD' | 'TENANT',
      likeCount: post.likes.length,
      commentCount: post.comments.length,
      shareCount: post.shares.length,
      isLikedByCurrentUser: post.likes.some(like => like.userId === user.id),
    }
  })

  return (
    <CommunityFeed
      initialPosts={postsWithCounts}
      currentUserId={user.id}
      userName={user.name || 'User'}
    />
  )
}
