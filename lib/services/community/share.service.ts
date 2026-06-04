import { prisma } from '@/lib/prisma'

export interface Share {
  id: string
  postId: string
  userId: string
  sharedWith: string | null
  createdAt: Date
  user: {
    id: string
    name: string
    email: string
  }
}

class ShareService {
  async sharePost(
    postId: string,
    userId: string,
    sharedWith?: string
  ): Promise<Share> {
    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      throw new Error('Post not found')
    }

    // Create share record
    const share = await prisma.share.create({
      data: {
        postId,
        userId,
        sharedWith: sharedWith || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return share as Share
  }

  async getShares(postId: string): Promise<Share[]> {
    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      throw new Error('Post not found')
    }

    // Get all shares for the post
    const shares = await prisma.share.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return shares as Share[]
  }
}

export const shareService = new ShareService()
