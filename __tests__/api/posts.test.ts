/**
 * Unit tests for Post API routes
 * 
 * Tests authentication, authorization, validation, and success cases
 * Requirements: 8.1, 8.5, 8.6, 10.1, 10.2, 10.3, 10.4
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'

// Mock NextAuth
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    handlers: { GET: jest.fn(), POST: jest.fn() }
  })),
  getServerSession: jest.fn()
}))

// Mock authOptions
jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
  authOptions: {}
}))

// Mock post service
jest.mock('@/lib/services/post.service', () => ({
  createPost: jest.fn(),
  getPosts: jest.fn(),
  getPost: jest.fn(),
  updatePost: jest.fn(),
  deletePost: jest.fn()
}))

// Import error classes from api-error-handler
import {
  ValidationError,
  UnauthorizedError,
  NotFoundError
} from '@/lib/api-error-handler'

import { getServerSession } from 'next-auth'
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  ValidationError,
  UnauthorizedError,
  NotFoundError
} from '@/lib/services/post.service'
import { GET as getPostsHandler, POST as createPostHandler } from '@/app/api/posts/route'
import { GET as getPostHandler, PATCH as updatePostHandler, DELETE as deletePostHandler } from '@/app/api/posts/[id]/route'
import { NextRequest } from 'next/server'

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
const mockCreatePost = createPost as jest.MockedFunction<typeof createPost>
const mockGetPosts = getPosts as jest.MockedFunction<typeof getPosts>
const mockGetPost = getPost as jest.MockedFunction<typeof getPost>
const mockUpdatePost = updatePost as jest.MockedFunction<typeof updatePost>
const mockDeletePost = deletePost as jest.MockedFunction<typeof deletePost>

describe('POST /api/posts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/posts', {
      method: 'POST',
      body: JSON.stringify({ content: 'Test post' })
    })

    const response = await createPostHandler(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should create post successfully', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' }
    } as any)

    const mockPost = {
      id: 'post-1',
      authorId: 'user-1',
      authorType: 'LANDLORD',
      content: 'Test post',
      images: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      author: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com'
      }
    }

    mockCreatePost.mockResolvedValue(mockPost)

    const request = new NextRequest('http://localhost:3000/api/posts', {
      method: 'POST',
      body: JSON.stringify({ content: 'Test post' })
    })

    const response = await createPostHandler(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.content).toBe('Test post')
    expect(mockCreatePost).toHaveBeenCalledWith('user-1', { content: 'Test post' })
  })

  it('should return 400 for validation error', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' }
    } as any)

    mockCreatePost.mockRejectedValue(new ValidationError('Nội dung bài viết không được để trống'))

    const request = new NextRequest('http://localhost:3000/api/posts', {
      method: 'POST',
      body: JSON.stringify({ content: '' })
    })

    const response = await createPostHandler(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Nội dung bài viết không được để trống')
  })
})

describe('GET /api/posts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/posts')

    const response = await getPostsHandler(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should get posts successfully', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' }
    } as any)

    const mockPosts = [
      {
        id: 'post-1',
        authorId: 'user-1',
        authorType: 'LANDLORD',
        content: 'Test post 1',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
        author: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com'
        }
      }
    ]

    mockGetPosts.mockResolvedValue(mockPosts)

    const request = new NextRequest('http://localhost:3000/api/posts?page=1&limit=20')

    const response = await getPostsHandler(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveLength(1)
    expect(mockGetPosts).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      authorId: undefined,
      authorType: null,
      search: undefined,
      currentUserId: 'user-1'
    })
  })
})

describe('PATCH /api/posts/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/posts/post-1', {
      method: 'PATCH',
      body: JSON.stringify({ content: 'Updated content' })
    })

    const response = await updatePostHandler(request, { params: { id: 'post-1' } })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should update post successfully', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' }
    } as any)

    const mockPost = {
      id: 'post-1',
      authorId: 'user-1',
      authorType: 'LANDLORD',
      content: 'Updated content',
      images: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      author: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com'
      }
    }

    mockUpdatePost.mockResolvedValue(mockPost)

    const request = new NextRequest('http://localhost:3000/api/posts/post-1', {
      method: 'PATCH',
      body: JSON.stringify({ content: 'Updated content' })
    })

    const response = await updatePostHandler(request, { params: { id: 'post-1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.content).toBe('Updated content')
    expect(mockUpdatePost).toHaveBeenCalledWith('post-1', 'user-1', { content: 'Updated content' })
  })

  it('should return 403 for unauthorized update', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-2', email: 'test2@example.com' }
    } as any)

    mockUpdatePost.mockRejectedValue(new UnauthorizedError('Bạn không có quyền chỉnh sửa bài viết này'))

    const request = new NextRequest('http://localhost:3000/api/posts/post-1', {
      method: 'PATCH',
      body: JSON.stringify({ content: 'Updated content' })
    })

    const response = await updatePostHandler(request, { params: { id: 'post-1' } })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Bạn không có quyền chỉnh sửa bài viết này')
  })
})

describe('DELETE /api/posts/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/posts/post-1', {
      method: 'DELETE'
    })

    const response = await deletePostHandler(request, { params: { id: 'post-1' } })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should delete post successfully', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' }
    } as any)

    mockDeletePost.mockResolvedValue(undefined)

    const request = new NextRequest('http://localhost:3000/api/posts/post-1', {
      method: 'DELETE'
    })

    const response = await deletePostHandler(request, { params: { id: 'post-1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Post deleted successfully')
    expect(mockDeletePost).toHaveBeenCalledWith('post-1', 'user-1')
  })

  it('should return 403 for unauthorized delete', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-2', email: 'test2@example.com' }
    } as any)

    mockDeletePost.mockRejectedValue(new UnauthorizedError('Bạn không có quyền xóa bài viết này'))

    const request = new NextRequest('http://localhost:3000/api/posts/post-1', {
      method: 'DELETE'
    })

    const response = await deletePostHandler(request, { params: { id: 'post-1' } })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Bạn không có quyền xóa bài viết này')
  })

  it('should return 404 for non-existent post', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' }
    } as any)

    mockDeletePost.mockRejectedValue(new NotFoundError('Bài viết không tồn tại hoặc đã bị xóa'))

    const request = new NextRequest('http://localhost:3000/api/posts/post-999', {
      method: 'DELETE'
    })

    const response = await deletePostHandler(request, { params: { id: 'post-999' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Bài viết không tồn tại hoặc đã bị xóa')
  })
})
