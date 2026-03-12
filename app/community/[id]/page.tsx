import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PostDetail } from '@/components/community/post-detail'
import { prisma } from '@/lib/prisma'

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    redirect('/login')
  }

  const { id } = await params

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      likes: true,
      comments: {
        include: {
          replies: {
            include: {
              replies: {
                include: {
                  replies: true,
                },
              },
            },
          },
        },
        where: { parentId: null },
      },
      shares: true,
    },
  })

  if (!post) {
    notFound()
  }

  const author = post.authorType === 'LANDLORD'
    ? await prisma.landlord.findUnique({ where: { userId: post.authorId }, include: { user: true } })
    : await prisma.tenant.findUnique({ where: { userId: post.authorId }, include: { user: true } })

  const postData = {
    id: post.id,
    content: post.content,
    images: Array.isArray(post.images) ? post.images : post.images ? [post.images] : undefined,
    createdAt: post.createdAt.toISOString(),
    author: {
      id: post.authorId,
      name: author?.user.name || 'Unknown',
      email: author?.user.email || '',
    },
    authorType: post.authorType as 'LANDLORD' | 'TENANT',
    likeCount: post.likes.length,
    commentCount: post.comments.length,
    shareCount: post.shares.length,
    isLikedByCurrentUser: post.likes.some(like => like.userId === user.id),
  }

  return (
    <PostDetail
      post={postData}
      currentUserId={user.id}
    />
  )
}
