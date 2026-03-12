import { shareService } from '@/lib/services/share.service'
import { prisma } from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    post: {
      findUnique: jest.fn()
    },
    share: {
      create: jest.fn(),
      findMany: jest.fn()
    }
  }
}))

describe('ShareService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('sharePost', () => {
    it('should create a share record', async () => {
      const mockPost = { id: 'post1', content: 'Test post' }
      const mockShare = {
        id: 'share1',
        postId: 'post1',
        userId: 'user1',
        sharedWith: null,
        createdAt: new Date(),
        user: { id: 'user1', name: 'User 1', email: 'user1@test.com' }
      }

      ;(prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost)
      ;(prisma.share.create as jest.Mock).mockResolvedValue(mockShare)

      const result = await shareService.sharePost('post1', 'user1')

      expect(result).toEqual(mockShare)
      expect(prisma.share.create).toHaveBeenCalledWith({
        data: {
          postId: 'post1',
          userId: 'user1',
          sharedWith: null
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
    })

    it('should create a share with platform information', async () => {
      const mockPost = { id: 'post1', content: 'Test post' }
      const mockShare = {
        id: 'share1',
        postId: 'post1',
        userId: 'user1',
        sharedWith: 'facebook',
        createdAt: new Date(),
        user: { id: 'user1', name: 'User 1', email: 'user1@test.com' }
      }

      ;(prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost)
      ;(prisma.share.create as jest.Mock).mockResolvedValue(mockShare)

      const result = await shareService.sharePost('post1', 'user1', 'facebook')

      expect(result.sharedWith).toBe('facebook')
      expect(prisma.share.create).toHaveBeenCalledWith({
        data: {
          postId: 'post1',
          userId: 'user1',
          sharedWith: 'facebook'
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
    })

    it('should throw error if post not found', async () => {
      ;(prisma.post.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(
        shareService.sharePost('invalid', 'user1')
      ).rejects.toThrow('Post not found')
    })
  })

  describe('getShares', () => {
    it('should return all shares for a post', async () => {
      const mockPost = { id: 'post1', content: 'Test post' }
      const mockShares = [
        {
          id: 'share1',
          postId: 'post1',
          userId: 'user1',
          sharedWith: 'facebook',
          createdAt: new Date(),
          user: { id: 'user1', name: 'User 1', email: 'user1@test.com' }
        },
        {
          id: 'share2',
          postId: 'post1',
          userId: 'user2',
          sharedWith: 'twitter',
          createdAt: new Date(),
          user: { id: 'user2', name: 'User 2', email: 'user2@test.com' }
        }
      ]

      ;(prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost)
      ;(prisma.share.findMany as jest.Mock).mockResolvedValue(mockShares)

      const result = await shareService.getShares('post1')

      expect(result).toEqual(mockShares)
      expect(result).toHaveLength(2)
      expect(prisma.share.findMany).toHaveBeenCalledWith({
        where: { postId: 'post1' },
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
    })

    it('should return empty array if no shares', async () => {
      const mockPost = { id: 'post1', content: 'Test post' }

      ;(prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost)
      ;(prisma.share.findMany as jest.Mock).mockResolvedValue([])

      const result = await shareService.getShares('post1')

      expect(result).toEqual([])
    })

    it('should throw error if post not found', async () => {
      ;(prisma.post.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(shareService.getShares('invalid')).rejects.toThrow(
        'Post not found'
      )
    })
  })
})
