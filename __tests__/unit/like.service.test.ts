import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { prisma } from '@/lib/prisma'
import { likeService } from '@/lib/services/like.service'

describe('LikeService', () => {
  let testUserId: string
  let testPostId: string

  beforeEach(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: `test-like-${Date.now()}@example.com`,
        password: 'hashedpassword',
        name: 'Test User',
        role: 'TENANT'
      }
    })
    testUserId = user.id

    // Create test post
    const post = await prisma.post.create({
      data: {
        authorId: testUserId,
        authorType: 'TENANT',
        content: 'Test post for likes'
      }
    })
    testPostId = post.id
  })

  afterEach(async () => {
    // Clean up
    await prisma.like.deleteMany({
      where: { postId: testPostId }
    })
    await prisma.post.deleteMany({
      where: { id: testPostId }
    })
    await prisma.user.deleteMany({
      where: { id: testUserId }
    })
  })

  describe('toggleLike', () => {
    it('should create like when user has not liked post', async () => {
      const result = await likeService.toggleLike(testPostId, testUserId)
      
      expect(result.liked).toBe(true)
      
      const hasLiked = await likeService.hasUserLiked(testPostId, testUserId)
      expect(hasLiked).toBe(true)
    })

    it('should remove like when user has already liked post', async () => {
      // First like
      await likeService.toggleLike(testPostId, testUserId)
      
      // Unlike
      const result = await likeService.toggleLike(testPostId, testUserId)
      
      expect(result.liked).toBe(false)
      
      const hasLiked = await likeService.hasUserLiked(testPostId, testUserId)
      expect(hasLiked).toBe(false)
    })

    it('should be idempotent - toggling twice returns to original state', async () => {
      // Initial state: not liked
      const initialState = await likeService.hasUserLiked(testPostId, testUserId)
      expect(initialState).toBe(false)
      
      // Toggle twice
      await likeService.toggleLike(testPostId, testUserId)
      await likeService.toggleLike(testPostId, testUserId)
      
      // Should return to original state
      const finalState = await likeService.hasUserLiked(testPostId, testUserId)
      expect(finalState).toBe(initialState)
    })

    it('should throw error when post does not exist', async () => {
      await expect(
        likeService.toggleLike('non-existent-post', testUserId)
      ).rejects.toThrow('Post not found')
    })

    it('should ensure only one like exists per user-post pair', async () => {
      // Like the post
      await likeService.toggleLike(testPostId, testUserId)
      
      // Check that only one like exists
      const likeCount = await prisma.like.count({
        where: {
          postId: testPostId,
          userId: testUserId
        }
      })
      
      expect(likeCount).toBe(1)
    })
  })

  describe('getLikes', () => {
    it('should return empty array when post has no likes', async () => {
      const likes = await likeService.getLikes(testPostId)
      
      expect(likes).toEqual([])
    })

    it('should return all likes for a post', async () => {
      // Create another user
      const user2 = await prisma.user.create({
        data: {
          email: `test-like-2-${Date.now()}@example.com`,
          password: 'hashedpassword',
          name: 'Test User 2',
          role: 'LANDLORD'
        }
      })

      // Both users like the post
      await likeService.toggleLike(testPostId, testUserId)
      await likeService.toggleLike(testPostId, user2.id)
      
      const likes = await likeService.getLikes(testPostId)
      
      expect(likes).toHaveLength(2)
      expect(likes[0].user).toHaveProperty('id')
      expect(likes[0].user).toHaveProperty('name')
      expect(likes[0].user).toHaveProperty('email')
      expect(likes[0].user).not.toHaveProperty('password')

      // Clean up
      await prisma.user.delete({ where: { id: user2.id } })
    })

    it('should return likes sorted by creation date descending', async () => {
      // Create two more users
      const user2 = await prisma.user.create({
        data: {
          email: `test-like-sort-1-${Date.now()}@example.com`,
          password: 'hashedpassword',
          name: 'User 1',
          role: 'TENANT'
        }
      })

      const user3 = await prisma.user.create({
        data: {
          email: `test-like-sort-2-${Date.now()}@example.com`,
          password: 'hashedpassword',
          name: 'User 2',
          role: 'TENANT'
        }
      })

      // Like in sequence
      await likeService.toggleLike(testPostId, testUserId)
      await new Promise(resolve => setTimeout(resolve, 10))
      await likeService.toggleLike(testPostId, user2.id)
      await new Promise(resolve => setTimeout(resolve, 10))
      await likeService.toggleLike(testPostId, user3.id)
      
      const likes = await likeService.getLikes(testPostId)
      
      expect(likes).toHaveLength(3)
      // Most recent like should be first
      expect(likes[0].userId).toBe(user3.id)
      expect(likes[2].userId).toBe(testUserId)

      // Clean up
      await prisma.user.deleteMany({
        where: { id: { in: [user2.id, user3.id] } }
      })
    })
  })

  describe('hasUserLiked', () => {
    it('should return false when user has not liked post', async () => {
      const hasLiked = await likeService.hasUserLiked(testPostId, testUserId)
      
      expect(hasLiked).toBe(false)
    })

    it('should return true when user has liked post', async () => {
      await likeService.toggleLike(testPostId, testUserId)
      
      const hasLiked = await likeService.hasUserLiked(testPostId, testUserId)
      
      expect(hasLiked).toBe(true)
    })

    it('should return false after user unlikes post', async () => {
      // Like then unlike
      await likeService.toggleLike(testPostId, testUserId)
      await likeService.toggleLike(testPostId, testUserId)
      
      const hasLiked = await likeService.hasUserLiked(testPostId, testUserId)
      
      expect(hasLiked).toBe(false)
    })
  })

  describe('getLikeCount', () => {
    it('should return 0 when post has no likes', async () => {
      const count = await likeService.getLikeCount(testPostId)
      
      expect(count).toBe(0)
    })

    it('should return accurate like count', async () => {
      // Create additional users
      const user2 = await prisma.user.create({
        data: {
          email: `test-count-1-${Date.now()}@example.com`,
          password: 'hashedpassword',
          name: 'User 1',
          role: 'TENANT'
        }
      })

      const user3 = await prisma.user.create({
        data: {
          email: `test-count-2-${Date.now()}@example.com`,
          password: 'hashedpassword',
          name: 'User 2',
          role: 'LANDLORD'
        }
      })

      // Multiple users like
      await likeService.toggleLike(testPostId, testUserId)
      await likeService.toggleLike(testPostId, user2.id)
      await likeService.toggleLike(testPostId, user3.id)
      
      const count = await likeService.getLikeCount(testPostId)
      
      expect(count).toBe(3)

      // Clean up
      await prisma.user.deleteMany({
        where: { id: { in: [user2.id, user3.id] } }
      })
    })

    it('should update count when user unlikes', async () => {
      await likeService.toggleLike(testPostId, testUserId)
      let count = await likeService.getLikeCount(testPostId)
      expect(count).toBe(1)
      
      await likeService.toggleLike(testPostId, testUserId)
      count = await likeService.getLikeCount(testPostId)
      expect(count).toBe(0)
    })
  })
})
