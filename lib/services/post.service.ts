import { prisma } from '@/lib/prisma'
import {
  ValidationError,
  UnauthorizedError,
  NotFoundError
} from '@/lib/api-error-handler'

// Types
export interface CreatePostInput {
  content: string
  images?: string[]
}

export interface UpdatePostInput {
  content?: string
  images?: string[]
}

export interface PostFilters {
  page?: number
  limit?: number
  authorId?: string
  authorType?: 'LANDLORD' | 'TENANT'
  search?: string
  currentUserId?: string
  orderBy?: {
    createdAt?: 'asc' | 'desc'
    updatedAt?: 'asc' | 'desc'
  }
}

export interface PostWithCounts {
  id: string
  authorId: string
  authorType: string
  content: string
  images: string[]
  createdAt: Date
  updatedAt: Date
  likeCount: number
  commentCount: number
  shareCount: number
  isLikedByCurrentUser?: boolean
  author: {
    id: string
    name: string
    email: string
  }
}

// Re-export error classes for backward compatibility
export { ValidationError, UnauthorizedError, NotFoundError }

/**
 * Create a new post
 * 
 * Preconditions:
 * - authorId is non-null and exists in User table
 * - data.content is non-empty string with length ≤ 5000
 * - data.images if provided, is array with length ≤ 10
 * 
 * Postconditions:
 * - Returns valid Post object with generated id
 * - Post is persisted in database
 * - post.authorId === authorId
 * - post.createdAt and post.updatedAt are set to current timestamp
 * - post.likeCount === 0, post.commentCount === 0, post.shareCount === 0
 */
export async function createPost(
  authorId: string,
  data: CreatePostInput
): Promise<PostWithCounts> {
  // Validate input
  if (!authorId || authorId.trim() === '') {
    throw new ValidationError('Author ID is required')
  }

  if (!data.content || data.content.trim() === '') {
    throw new ValidationError('Nội dung bài viết không được để trống')
  }

  if (data.content.length > 5000) {
    throw new ValidationError('Nội dung bài viết không được vượt quá 5000 ký tự')
  }

  if (data.images && data.images.length > 10) {
    throw new ValidationError('Không được tải lên quá 10 ảnh')
  }

  // Get author information
  const author = await prisma.user.findUnique({
    where: { id: authorId },
    include: {
      landlord: true,
      tenant: true
    }
  })

  if (!author) {
    throw new NotFoundError('User not found')
  }

  // Determine author type
  let authorType: 'LANDLORD' | 'TENANT'
  if (author.landlord) {
    authorType = 'LANDLORD'
  } else if (author.tenant) {
    authorType = 'TENANT'
  } else {
    throw new ValidationError('User must be either landlord or tenant')
  }

  // Create post
  const post = await prisma.post.create({
    data: {
      authorId,
      authorType,
      content: data.content.trim(),
      images: JSON.stringify(data.images || [])
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      likes: true,
      comments: true,
      shares: true
    }
  })

  // Compute counts
  return {
    ...post,
    images: JSON.parse(post.images) as string[],
    likeCount: post.likes.length,
    commentCount: post.comments.length,
    shareCount: post.shares.length
  }
}

/**
 * Get a single post by ID
 * 
 * Preconditions:
 * - id is non-null
 * 
 * Postconditions:
 * - Returns Post object with computed counts if found
 * - Returns null if not found
 */
export async function getPost(
  id: string,
  currentUserId?: string
): Promise<PostWithCounts | null> {
  if (!id || id.trim() === '') {
    throw new ValidationError('Post ID is required')
  }

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      likes: true,
      comments: true,
      shares: true
    }
  })

  if (!post) {
    return null
  }

  // Check if current user liked the post
  let isLikedByCurrentUser = false
  if (currentUserId) {
    isLikedByCurrentUser = (post.likes as any[]).some((like: any) => like.userId === currentUserId)
  }

  return {
    ...post,
    images: JSON.parse(post.images) as string[],
    likeCount: post.likes.length,
    commentCount: post.comments.length,
    shareCount: post.shares.length,
    isLikedByCurrentUser
  }
}

/**
 * Get posts with filtering and pagination
 * 
 * Preconditions:
 * - filters.page ≥ 1
 * - filters.limit is between 1 and 100
 * - filters.authorId if provided, exists in User table
 * 
 * Postconditions:
 * - Returns array of Post objects
 * - Posts are sorted by createdAt DESC by default
 * - Array length ≤ filters.limit
 * - Each post includes computed fields (likeCount, commentCount, shareCount)
 * - Posts match all provided filters
 */
export async function getPosts(
  filters: PostFilters = {}
): Promise<PostWithCounts[]> {
  // Validate pagination parameters
  const page = filters.page ?? 1
  const limit = filters.limit ?? 20

  if (page < 1) {
    throw new ValidationError('Page number must be at least 1')
  }

  if (limit < 1 || limit > 100) {
    throw new ValidationError('Limit must be between 1 and 100')
  }

  // Calculate skip for pagination
  const skip = (page - 1) * limit

  // Build where clause
  const where: any = {}

  if (filters.authorId) {
    where.authorId = filters.authorId
  }

  if (filters.authorType) {
    where.authorType = filters.authorType
  }

  if (filters.search) {
    where.content = {
      contains: filters.search
    }
  }

  // Build order by clause
  const orderBy = filters.orderBy || { createdAt: 'desc' as const }

  // Fetch posts with relations
  const posts = await prisma.post.findMany({
    where,
    skip,
    take: limit,
    orderBy,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      likes: true,
      comments: true,
      shares: true
    }
  })

  // Compute counts for each post
  return posts.map((post: any) => {
    let isLikedByCurrentUser = false
    if (filters.currentUserId) {
      isLikedByCurrentUser = post.likes.some(
        (like: any) => like.userId === filters.currentUserId
      )
    }

    return {
      ...post,
      images: JSON.parse(post.images) as string[],
      likeCount: post.likes.length,
      commentCount: post.comments.length,
      shareCount: post.shares.length,
      isLikedByCurrentUser
    }
  })
}

/**
 * Update a post
 * 
 * Preconditions:
 * - id is non-null and exists
 * - currentUserId is the post author
 * - data.content if provided, is non-empty and ≤ 5000 characters
 * - data.images if provided, has length ≤ 10
 * 
 * Postconditions:
 * - Post is updated in database
 * - updatedAt timestamp is updated
 * - Returns updated Post object
 */
export async function updatePost(
  id: string,
  currentUserId: string,
  data: UpdatePostInput
): Promise<PostWithCounts> {
  if (!id || id.trim() === '') {
    throw new ValidationError('Post ID is required')
  }

  if (!currentUserId || currentUserId.trim() === '') {
    throw new ValidationError('User ID is required')
  }

  // Validate content if provided
  if (data.content !== undefined) {
    if (!data.content || data.content.trim() === '') {
      throw new ValidationError('Nội dung bài viết không được để trống')
    }

    if (data.content.length > 5000) {
      throw new ValidationError('Nội dung bài viết không được vượt quá 5000 ký tự')
    }
  }

  // Validate images if provided
  if (data.images && data.images.length > 10) {
    throw new ValidationError('Không được tải lên quá 10 ảnh')
  }

  // Check if post exists and user is the author
  const existingPost = await prisma.post.findUnique({
    where: { id }
  })

  if (!existingPost) {
    throw new NotFoundError('Bài viết không tồn tại hoặc đã bị xóa')
  }

  if (existingPost.authorId !== currentUserId) {
    throw new UnauthorizedError('Bạn không có quyền chỉnh sửa bài viết này')
  }

  // Update post
  const updateData: any = {}
  if (data.content !== undefined) {
    updateData.content = data.content.trim()
  }
  if (data.images !== undefined) {
    updateData.images = JSON.stringify(data.images)
  }

  const updatedPost = await prisma.post.update({
    where: { id },
    data: updateData,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      likes: true,
      comments: true,
      shares: true
    }
  })

  return {
    ...updatedPost,
    images: JSON.parse(updatedPost.images) as string[],
    likeCount: updatedPost.likes.length,
    commentCount: updatedPost.comments.length,
    shareCount: updatedPost.shares.length
  }
}

/**
 * Delete a post
 * 
 * Preconditions:
 * - id is non-null and exists
 * - currentUserId is the post author
 * 
 * Postconditions:
 * - Post is deleted from database
 * - All associated likes, comments, and shares are cascade deleted
 */
export async function deletePost(
  id: string,
  currentUserId: string
): Promise<void> {
  if (!id || id.trim() === '') {
    throw new ValidationError('Post ID is required')
  }

  if (!currentUserId || currentUserId.trim() === '') {
    throw new ValidationError('User ID is required')
  }

  // Check if post exists and user is the author
  const existingPost = await prisma.post.findUnique({
    where: { id }
  })

  if (!existingPost) {
    throw new NotFoundError('Bài viết không tồn tại hoặc đã bị xóa')
  }

  if (existingPost.authorId !== currentUserId) {
    throw new UnauthorizedError('Bạn không có quyền xóa bài viết này')
  }

  // Delete post (cascade will handle likes, comments, shares)
  await prisma.post.delete({
    where: { id }
  })
}
