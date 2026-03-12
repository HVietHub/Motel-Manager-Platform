import {
  createPost,
  getPost,
  getPosts,
  updatePost,
  deletePost,
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  CreatePostInput,
  UpdatePostInput,
  PostFilters
} from '@/lib/services/post.service'
import { prisma } from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn()
    },
    post: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }
}))

describe('Post Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createPost', () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      landlord: { id: 'landlord-1' },
      tenant: null
    }

    const mockPost = {
      id: 'post-1',
      authorId: 'user-1',
      authorType: 'LANDLORD',
      content: 'Test post content',
      images: '[]',
      createdAt: new Date(),
      updatedAt: new Date(),
      author: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com'
      },
      likes: [],
      comments: [],
      shares: []
    }

    it('should create post with valid data', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.post.create as jest.Mock).mockResolvedValue(mockPost)

      const input: CreatePostInput = {
        content: 'Test post content',
        images: []
      }

      const result = await createPost('user-1', input)

      expect(result.id).toBe('post-1')
      expect(result.content).toBe('Test post content')
      expect(result.authorId).toBe('user-1')
      expect(result.likeCount).toBe(0)
      expect(result.commentCount).toBe(0)
      expect(result.shareCount).toBe(0)
    })

    it('should throw error for empty content', async () => {
      const input: CreatePostInput = {
        content: ''
      }

      await expect(createPost('user-1', input)).rejects.toThrow(ValidationError)
      await expect(createPost('user-1', input)).rejects.toThrow('Nội dung bài viết không được để trống')
    })

    it('should throw error for content exceeding 5000 characters', async () => {
      const input: CreatePostInput = {
        content: 'a'.repeat(5001)
      }

      await expect(createPost('user-1', input)).rejects.toThrow(ValidationError)
      await expect(createPost('user-1', input)).rejects.toThrow('Nội dung bài viết không được vượt quá 5000 ký tự')
    })

    it('should throw error for more than 10 images', async () => {
      const input: CreatePostInput = {
        content: 'Test content',
        images: Array(11).fill('image.jpg')
      }

      await expect(createPost('user-1', input)).rejects.toThrow(ValidationError)
      await expect(createPost('user-1', input)).rejects.toThrow('Không được tải lên quá 10 ảnh')
    })

    it('should accept post with valid content length', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.post.create as jest.Mock).mockResolvedValue(mockPost)

      const input: CreatePostInput = {
        content: 'a'.repeat(5000) // Exactly 5000 characters
      }

      const result = await createPost('user-1', input)
      expect(result).toBeDefined()
    })

    it('should accept post with up to 10 images', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.post.create as jest.Mock).mockResolvedValue({
        ...mockPost,
        images: JSON.stringify(Array(10).fill('image.jpg'))
      })

      const input: CreatePostInput = {
        content: 'Test content',
        images: Array(10).fill('image.jpg')
      }

      const result = await createPost('user-1', input)
      expect(result).toBeDefined()
    })

    it('should throw error if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      const input: CreatePostInput = {
        content: 'Test content'
      }

      await expect(createPost('user-1', input)).rejects.toThrow(NotFoundError)
    })

    it('should determine authorType as LANDLORD', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.post.create as jest.Mock).mockResolvedValue(mockPost)

      const input: CreatePostInput = {
        content: 'Test content'
      }

      await createPost('user-1', input)

      expect(prisma.post.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            authorType: 'LANDLORD'
          })
        })
      )
    })

    it('should determine authorType as TENANT', async () => {
      const tenantUser = {
        ...mockUser,
        landlord: null,
        tenant: { id: 'tenant-1' }
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(tenantUser);
      (prisma.post.create as jest.Mock).mockResolvedValue({
        ...mockPost,
        authorType: 'TENANT'
      })

      const input: CreatePostInput = {
        content: 'Test content'
      }

      await createPost('user-1', input)

      expect(prisma.post.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            authorType: 'TENANT'
          })
        })
      )
    })
  })

  describe('getPosts', () => {
    const mockPosts = [
      {
        id: 'post-1',
        authorId: 'user-1',
        authorType: 'LANDLORD',
        content: 'Post 1',
        images: '[]',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        author: { id: 'user-1', name: 'User 1', email: 'user1@example.com' },
        likes: [],
        comments: [],
        shares: []
      },
      {
        id: 'post-2',
        authorId: 'user-2',
        authorType: 'TENANT',
        content: 'Post 2',
        images: '[]',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        author: { id: 'user-2', name: 'User 2', email: 'user2@example.com' },
        likes: [],
        comments: [],
        shares: []
      }
    ]

    it('should return posts sorted by createdAt DESC by default', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts)

      const result = await getPosts({})

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('post-1')
      expect(result[1].id).toBe('post-2')
    })

    it('should respect pagination limit', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue([mockPosts[0]])

      const filters: PostFilters = {
        limit: 1
      }

      const result = await getPosts(filters)

      expect(result).toHaveLength(1)
      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 1
        })
      )
    })

    it('should throw error for page less than 1', async () => {
      const filters: PostFilters = {
        page: 0
      }

      await expect(getPosts(filters)).rejects.toThrow(ValidationError)
      await expect(getPosts(filters)).rejects.toThrow('Page number must be at least 1')
    })

    it('should throw error for limit outside range 1-100', async () => {
      const filters1: PostFilters = { limit: 0 }
      const filters2: PostFilters = { limit: 101 }

      await expect(getPosts(filters1)).rejects.toThrow(ValidationError)
      await expect(getPosts(filters2)).rejects.toThrow(ValidationError)
    })

    it('should filter by authorId', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue([mockPosts[0]])

      const filters: PostFilters = {
        authorId: 'user-1'
      }

      await getPosts(filters)

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            authorId: 'user-1'
          })
        })
      )
    })

    it('should filter by authorType', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue([mockPosts[0]])

      const filters: PostFilters = {
        authorType: 'LANDLORD'
      }

      await getPosts(filters)

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            authorType: 'LANDLORD'
          })
        })
      )
    })

    it('should filter by search term', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue([mockPosts[0]])

      const filters: PostFilters = {
        search: 'Post 1'
      }

      await getPosts(filters)

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            content: { contains: 'Post 1' }
          })
        })
      )
    })

    it('should include computed fields', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts)

      const result = await getPosts({})

      expect(result[0]).toHaveProperty('likeCount')
      expect(result[0]).toHaveProperty('commentCount')
      expect(result[0]).toHaveProperty('shareCount')
    })

    it('should check if current user liked posts', async () => {
      const postsWithLikes = [
        {
          ...mockPosts[0],
          likes: [{ userId: 'current-user' }]
        }
      ];
      (prisma.post.findMany as jest.Mock).mockResolvedValue(postsWithLikes)

      const filters: PostFilters = {
        currentUserId: 'current-user'
      }

      const result = await getPosts(filters)

      expect(result[0].isLikedByCurrentUser).toBe(true)
    })
  })

  describe('updatePost', () => {
    const mockPost = {
      id: 'post-1',
      authorId: 'user-1',
      authorType: 'LANDLORD',
      content: 'Original content',
      images: '[]',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    it('should update post by owner', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);
      (prisma.post.update as jest.Mock).mockResolvedValue({
        ...mockPost,
        content: 'Updated content',
        author: { id: 'user-1', name: 'User', email: 'user@example.com' },
        likes: [],
        comments: [],
        shares: []
      })

      const input: UpdatePostInput = {
        content: 'Updated content'
      }

      const result = await updatePost('post-1', 'user-1', input)

      expect(result.content).toBe('Updated content')
    })

    it('should throw error when updating by non-owner', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost)

      const input: UpdatePostInput = {
        content: 'Updated content'
      }

      await expect(updatePost('post-1', 'user-2', input)).rejects.toThrow(UnauthorizedError)
      await expect(updatePost('post-1', 'user-2', input)).rejects.toThrow('Bạn không có quyền chỉnh sửa bài viết này')
    })

    it('should throw error for non-existent post', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null)

      const input: UpdatePostInput = {
        content: 'Updated content'
      }

      await expect(updatePost('post-1', 'user-1', input)).rejects.toThrow(NotFoundError)
    })

    it('should update updatedAt timestamp', async () => {
      const now = new Date();
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);
      (prisma.post.update as jest.Mock).mockResolvedValue({
        ...mockPost,
        updatedAt: now,
        author: { id: 'user-1', name: 'User', email: 'user@example.com' },
        likes: [],
        comments: [],
        shares: []
      })

      const input: UpdatePostInput = {
        content: 'Updated content'
      }

      const result = await updatePost('post-1', 'user-1', input)

      expect(result.updatedAt).toEqual(now)
    })
  })

  describe('deletePost', () => {
    const mockPost = {
      id: 'post-1',
      authorId: 'user-1',
      authorType: 'LANDLORD',
      content: 'Test content',
      images: '[]',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    it('should delete post by owner', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);
      (prisma.post.delete as jest.Mock).mockResolvedValue(mockPost)

      await deletePost('post-1', 'user-1')

      expect(prisma.post.delete).toHaveBeenCalledWith({
        where: { id: 'post-1' }
      })
    })

    it('should throw error when deleting by non-owner', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost)

      await expect(deletePost('post-1', 'user-2')).rejects.toThrow(UnauthorizedError)
      await expect(deletePost('post-1', 'user-2')).rejects.toThrow('Bạn không có quyền xóa bài viết này')
    })

    it('should throw error for non-existent post', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(deletePost('post-1', 'user-1')).rejects.toThrow(NotFoundError)
    })
  })

  describe('getPost', () => {
    const mockPost = {
      id: 'post-1',
      authorId: 'user-1',
      authorType: 'LANDLORD',
      content: 'Test content',
      images: '[]',
      createdAt: new Date(),
      updatedAt: new Date(),
      author: { id: 'user-1', name: 'User', email: 'user@example.com' },
      likes: [],
      comments: [],
      shares: []
    }

    it('should return post with computed counts', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost)

      const result = await getPost('post-1')

      expect(result).toBeDefined()
      expect(result?.id).toBe('post-1')
      expect(result?.likeCount).toBe(0)
      expect(result?.commentCount).toBe(0)
      expect(result?.shareCount).toBe(0)
    })

    it('should return null for non-existent post', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await getPost('post-1')

      expect(result).toBeNull()
    })

    it('should check if current user liked the post', async () => {
      const postWithLikes = {
        ...mockPost,
        likes: [{ userId: 'current-user' }]
      };
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(postWithLikes)

      const result = await getPost('post-1', 'current-user')

      expect(result?.isLikedByCurrentUser).toBe(true)
    })
  })
})
