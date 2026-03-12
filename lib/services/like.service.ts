import { prisma } from '@/lib/prisma'

export interface LikeResult {
  liked: boolean
}

export interface Like {
  id: string
  postId: string
  userId: string
  createdAt: Date
  user: {
    id: string
    name: string
    email: string
  }
}

export class LikeService {
  /**
   * Toggle like/unlike for a post
   * Implements idempotent behavior - calling twice returns to original state
   * 
   * @param postId - ID of the post to like/unlike
   * @param userId - ID of the user performing the action
   * @returns Object indicating whether the post is now liked
   */
  async toggleLike(postId: string, userId: string): Promise<LikeResult> {
    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      throw new Error('Post not found')
    }

    // Check if like already exists
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId
        }
      }
    })

    if (existingLike) {
      // Unlike: Delete existing like
      await prisma.like.delete({
        where: { id: existingLike.id }
      })
      return { liked: false }
    } else {
      // Like: Create new like
      await prisma.like.create({
        data: {
          postId,
          userId
        }
      })
      return { liked: true }
    }
  }

  /**
   * Get all likes for a post
   * 
   * @param postId - ID of the post
   * @returns Array of likes with user information
   */
  async getLikes(postId: string): Promise<Like[]> {
    const likes = await prisma.like.findMany({
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

    return likes
  }

  /**
   * Check if a user has liked a post
   * 
   * @param postId - ID of the post
   * @param userId - ID of the user
   * @returns Boolean indicating if user has liked the post
   */
  async hasUserLiked(postId: string, userId: string): Promise<boolean> {
    const like = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId
        }
      }
    })

    return like !== null
  }

  /**
   * Get like count for a post
   * 
   * @param postId - ID of the post
   * @returns Number of likes
   */
  async getLikeCount(postId: string): Promise<number> {
    return await prisma.like.count({
      where: { postId }
    })
  }
}

export const likeService = new LikeService()
