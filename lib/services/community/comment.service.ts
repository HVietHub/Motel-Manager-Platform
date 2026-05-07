import { prisma } from '@/lib/prisma'

export interface CreateCommentInput {
  content: string
  parentId?: string
}

export interface Comment {
  id: string
  postId: string
  authorId: string
  content: string
  parentId: string | null
  createdAt: Date
  updatedAt: Date
  author: {
    id: string
    name: string
    email: string
  }
  replies?: Comment[]
}

class CommentService {
  async createComment(
    postId: string,
    authorId: string,
    data: CreateCommentInput
  ): Promise<Comment> {
    // Validate content
    if (!data.content || data.content.trim().length === 0) {
      throw new Error('Nội dung bình luận không được để trống')
    }

    if (data.content.length > 1000) {
      throw new Error('Nội dung bình luận không được vượt quá 1000 ký tự')
    }

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      throw new Error('Post not found')
    }

    // If reply, validate parent comment
    if (data.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: data.parentId },
        include: {
          parent: {
            include: {
              parent: true
            }
          }
        }
      })

      if (!parentComment) {
        throw new Error('Parent comment not found')
      }

      if (parentComment.postId !== postId) {
        throw new Error('Parent comment does not belong to this post')
      }

      // Check reply depth (max 3 levels)
      let depth = 1
      let current = parentComment
      while (current.parent) {
        depth++
        current = current.parent as any
        if (depth >= 3) {
          throw new Error('Không thể trả lời comment này. Đã đạt giới hạn độ sâu.')
        }
      }
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId,
        content: data.content.trim(),
        parentId: data.parentId || null
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

    return comment as Comment
  }

  async getComments(postId: string): Promise<Comment[]> {
    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      throw new Error('Post not found')
    }

    // Get all comments for the post
    const comments = await prisma.comment.findMany({
      where: {
        postId,
        parentId: null // Only get top-level comments
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            replies: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                },
                replies: {
                  include: {
                    author: {
                      select: {
                        id: true,
                        name: true,
                        email: true
                      }
                    }
                  },
                  orderBy: {
                    createdAt: 'asc'
                  }
                }
              },
              orderBy: {
                createdAt: 'asc'
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return comments as Comment[]
  }

  async updateComment(id: string, content: string, userId: string): Promise<Comment> {
    // Validate content
    if (!content || content.trim().length === 0) {
      throw new Error('Nội dung bình luận không được để trống')
    }

    if (content.length > 1000) {
      throw new Error('Nội dung bình luận không được vượt quá 1000 ký tự')
    }

    // Get comment and verify ownership
    const comment = await prisma.comment.findUnique({
      where: { id }
    })

    if (!comment) {
      throw new Error('Comment not found')
    }

    if (comment.authorId !== userId) {
      throw new Error('Bạn không có quyền chỉnh sửa bình luận này')
    }

    // Update comment
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: {
        content: content.trim(),
        updatedAt: new Date()
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

    return updatedComment as Comment
  }

  async deleteComment(id: string, userId: string): Promise<void> {
    // Get comment and verify ownership
    const comment = await prisma.comment.findUnique({
      where: { id }
    })

    if (!comment) {
      throw new Error('Comment not found')
    }

    if (comment.authorId !== userId) {
      throw new Error('Bạn không có quyền xóa bình luận này')
    }

    // Delete comment (cascade will delete replies)
    await prisma.comment.delete({
      where: { id }
    })
  }
}

export const commentService = new CommentService()
