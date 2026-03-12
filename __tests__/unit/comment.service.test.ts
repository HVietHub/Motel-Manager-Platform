import { commentService } from '@/lib/services/comment.service'
import { prisma } from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    post: {
      findUnique: jest.fn()
    },
    comment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }
}))

describe('CommentService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createComment', () => {
    it('should create a comment with valid data', async () => {
      const mockPost = { id: 'post1', content: 'Test post' }
      const mockComment = {
        id: 'comment1',
        postId: 'post1',
        authorId: 'user1',
        content: 'Test comment',
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: { id: 'user1', name: 'User 1', email: 'user1@test.com' }
      }

      ;(prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost)
      ;(prisma.comment.create as jest.Mock).mockResolvedValue(mockComment)

      const result = await commentService.createComment('post1', 'user1', {
        content: 'Test comment'
      })

      expect(result).toEqual(mockComment)
      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: {
          postId: 'post1',
          authorId: 'user1',
          content: 'Test comment',
          parentId: null
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })
    })

    it('should throw error for empty content', async () => {
      await expect(
        commentService.createComment('post1', 'user1', { content: '' })
      ).rejects.toThrow('Nội dung bình luận không được để trống')
    })

    it('should throw error for content exceeding 1000 characters', async () => {
      const longContent = 'a'.repeat(1001)
      await expect(
        commentService.createComment('post1', 'user1', { content: longContent })
      ).rejects.toThrow('Nội dung bình luận không được vượt quá 1000 ký tự')
    })

    it('should throw error if post not found', async () => {
      ;(prisma.post.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(
        commentService.createComment('post1', 'user1', { content: 'Test' })
      ).rejects.toThrow('Post not found')
    })

    it('should create a reply with valid parent', async () => {
      const mockPost = { id: 'post1', content: 'Test post' }
      const mockParent = {
        id: 'comment1',
        postId: 'post1',
        parentId: null,
        parent: null
      }
      const mockReply = {
        id: 'comment2',
        postId: 'post1',
        authorId: 'user2',
        content: 'Reply',
        parentId: 'comment1',
        createdAt: new Date(),
        updatedAt: new Date(),
        author: { id: 'user2', name: 'User 2', email: 'user2@test.com' }
      }

      ;(prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost)
      ;(prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockParent)
      ;(prisma.comment.create as jest.Mock).mockResolvedValue(mockReply)

      const result = await commentService.createComment('post1', 'user2', {
        content: 'Reply',
        parentId: 'comment1'
      })

      expect(result.parentId).toBe('comment1')
    })

    it('should throw error if parent comment not found', async () => {
      const mockPost = { id: 'post1', content: 'Test post' }
      ;(prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost)
      ;(prisma.comment.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(
        commentService.createComment('post1', 'user2', {
          content: 'Reply',
          parentId: 'invalid'
        })
      ).rejects.toThrow('Parent comment not found')
    })

    it('should throw error if parent belongs to different post', async () => {
      const mockPost = { id: 'post1', content: 'Test post' }
      const mockParent = {
        id: 'comment1',
        postId: 'post2',
        parentId: null,
        parent: null
      }

      ;(prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost)
      ;(prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockParent)

      await expect(
        commentService.createComment('post1', 'user2', {
          content: 'Reply',
          parentId: 'comment1'
        })
      ).rejects.toThrow('Parent comment does not belong to this post')
    })

    it('should throw error if reply depth exceeds 3', async () => {
      const mockPost = { id: 'post1', content: 'Test post' }
      const mockParent = {
        id: 'comment3',
        postId: 'post1',
        parentId: 'comment2',
        parent: {
          id: 'comment2',
          parentId: 'comment1',
          parent: {
            id: 'comment1',
            parentId: null,
            parent: null
          }
        }
      }

      ;(prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost)
      ;(prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockParent)

      await expect(
        commentService.createComment('post1', 'user2', {
          content: 'Deep reply',
          parentId: 'comment3'
        })
      ).rejects.toThrow('Không thể trả lời comment này. Đã đạt giới hạn độ sâu.')
    })
  })

  describe('getComments', () => {
    it('should return nested comments for a post', async () => {
      const mockPost = { id: 'post1', content: 'Test post' }
      const mockComments = [
        {
          id: 'comment1',
          postId: 'post1',
          content: 'Top level',
          parentId: null,
          author: { id: 'user1', name: 'User 1', email: 'user1@test.com' },
          replies: [
            {
              id: 'comment2',
              postId: 'post1',
              content: 'Reply',
              parentId: 'comment1',
              author: { id: 'user2', name: 'User 2', email: 'user2@test.com' },
              replies: []
            }
          ]
        }
      ]

      ;(prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost)
      ;(prisma.comment.findMany as jest.Mock).mockResolvedValue(mockComments)

      const result = await commentService.getComments('post1')

      expect(result).toEqual(mockComments)
      expect(result[0].replies).toHaveLength(1)
    })

    it('should throw error if post not found', async () => {
      ;(prisma.post.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(commentService.getComments('invalid')).rejects.toThrow(
        'Post not found'
      )
    })
  })

  describe('updateComment', () => {
    it('should update comment by owner', async () => {
      const mockComment = {
        id: 'comment1',
        postId: 'post1',
        authorId: 'user1',
        content: 'Old content'
      }
      const mockUpdated = {
        ...mockComment,
        content: 'New content',
        updatedAt: new Date(),
        author: { id: 'user1', name: 'User 1', email: 'user1@test.com' }
      }

      ;(prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockComment)
      ;(prisma.comment.update as jest.Mock).mockResolvedValue(mockUpdated)

      const result = await commentService.updateComment(
        'comment1',
        'New content',
        'user1'
      )

      expect(result.content).toBe('New content')
    })

    it('should throw error if comment not found', async () => {
      ;(prisma.comment.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(
        commentService.updateComment('invalid', 'New content', 'user1')
      ).rejects.toThrow('Comment not found')
    })

    it('should throw error if user is not owner', async () => {
      const mockComment = {
        id: 'comment1',
        authorId: 'user1',
        content: 'Content'
      }

      ;(prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockComment)

      await expect(
        commentService.updateComment('comment1', 'New content', 'user2')
      ).rejects.toThrow('Bạn không có quyền chỉnh sửa bình luận này')
    })
  })

  describe('deleteComment', () => {
    it('should delete comment by owner', async () => {
      const mockComment = {
        id: 'comment1',
        authorId: 'user1',
        content: 'Content'
      }

      ;(prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockComment)
      ;(prisma.comment.delete as jest.Mock).mockResolvedValue(mockComment)

      await commentService.deleteComment('comment1', 'user1')

      expect(prisma.comment.delete).toHaveBeenCalledWith({
        where: { id: 'comment1' }
      })
    })

    it('should throw error if comment not found', async () => {
      ;(prisma.comment.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(
        commentService.deleteComment('invalid', 'user1')
      ).rejects.toThrow('Comment not found')
    })

    it('should throw error if user is not owner', async () => {
      const mockComment = {
        id: 'comment1',
        authorId: 'user1',
        content: 'Content'
      }

      ;(prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockComment)

      await expect(
        commentService.deleteComment('comment1', 'user2')
      ).rejects.toThrow('Bạn không có quyền xóa bình luận này')
    })
  })
})
