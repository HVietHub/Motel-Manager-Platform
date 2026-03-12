/**
 * Property-Based Tests for Data Integrity
 * Feature: cong-dong-nha-tro
 * Properties: 38, 39, 40, 41, 42
 * Validates: Requirements 7.3, 7.5, 7.6, 7.7, 7.8
 */

import { describe, it, expect, beforeEach, afterAll } from '@jest/globals'
import fc from 'fast-check'
import { PrismaClient } from '@prisma/client'

// Create a separate test database instance
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
    },
  },
})

// Helper to clean up database before each test
async function cleanDatabase() {
  await prisma.$transaction([
    prisma.share.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.like.deleteMany(),
    prisma.post.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.contract.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.maintenanceRequest.deleteMany(),
    prisma.tenant.deleteMany(),
    prisma.room.deleteMany(),
    prisma.building.deleteMany(),
    prisma.landlord.deleteMany(),
    prisma.user.deleteMany(),
  ])
}

beforeEach(async () => {
  await cleanDatabase()
})

afterAll(async () => {
  await cleanDatabase()
  await prisma.$disconnect()
})

describe('Property 38: Referential Integrity - Likes', () => {
  /**
   * Property: For any like record, both postId and userId must reference existing records
   * in their respective tables.
   * 
   * **Validates: Requirement 7.3**
   */

  it('should enforce referential integrity for likes - valid references', async () => {
    // Feature: cong-dong-nha-tro, Property 38: Referential Integrity - Likes
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 100 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }),
          content: fc.string({ minLength: 1, maxLength: 5000 }),
        }),
        async (data) => {
          // Create user
          const user = await prisma.user.create({
            data: {
              email: data.email,
              password: data.password,
              name: data.name,
              role: 'LANDLORD',
            },
          })

          const landlord = await prisma.landlord.create({
            data: {
              userId: user.id,
              phone: data.phone,
            },
          })

          // Create post
          const post = await prisma.post.create({
            data: {
              authorId: user.id,
              authorType: 'LANDLORD',
              content: data.content,
            },
          })

          // Create like with valid references
          const like = await prisma.like.create({
            data: {
              postId: post.id,
              userId: user.id,
            },
          })

          // Property: Like must have valid postId
          expect(like.postId).toBe(post.id)
          
          // Property: Like must have valid userId
          expect(like.userId).toBe(user.id)

          // Property: Referenced post must exist
          const referencedPost = await prisma.post.findUnique({
            where: { id: like.postId },
          })
          expect(referencedPost).toBeDefined()
          expect(referencedPost!.id).toBe(post.id)

          // Property: Referenced user must exist
          const referencedUser = await prisma.user.findUnique({
            where: { id: like.userId },
          })
          expect(referencedUser).toBeDefined()
          expect(referencedUser!.id).toBe(user.id)
        }
      ),
      { numRuns: 10 }
    )
  })

  it('should reject likes with non-existent postId', async () => {
    // Feature: cong-dong-nha-tro, Property 38: Referential Integrity - Likes
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 100 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }),
          fakePostId: fc.uuid(),
        }),
        async (data) => {
          // Create user
          const user = await prisma.user.create({
            data: {
              email: data.email,
              password: data.password,
              name: data.name,
              role: 'LANDLORD',
            },
          })

          await prisma.landlord.create({
            data: {
              userId: user.id,
              phone: data.phone,
            },
          })

          // Property: Creating like with non-existent postId must fail
          await expect(
            prisma.like.create({
              data: {
                postId: data.fakePostId,
                userId: user.id,
              },
            })
          ).rejects.toThrow()
        }
      ),
      { numRuns: 5 }
    )
  })

  it('should reject likes with non-existent userId', async () => {
    // Feature: cong-dong-nha-tro, Property 38: Referential Integrity - Likes
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 100 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }),
          content: fc.string({ minLength: 1, maxLength: 5000 }),
          fakeUserId: fc.uuid(),
        }),
        async (data) => {
          // Create user and post
          const user = await prisma.user.create({
            data: {
              email: data.email,
              password: data.password,
              name: data.name,
              role: 'LANDLORD',
            },
          })

          await prisma.landlord.create({
            data: {
              userId: user.id,
              phone: data.phone,
            },
          })

          const post = await prisma.post.create({
            data: {
              authorId: user.id,
              authorType: 'LANDLORD',
              content: data.content,
            },
          })

          // Property: Creating like with non-existent userId must fail
          await expect(
            prisma.like.create({
              data: {
                postId: post.id,
                userId: data.fakeUserId,
              },
            })
          ).rejects.toThrow()
        }
      ),
      { numRuns: 5 }
    )
  })

  it('should cascade delete likes when post is deleted', async () => {
    // Feature: cong-dong-nha-tro, Property 38: Referential Integrity - Likes
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 100 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }),
          content: fc.string({ minLength: 1, maxLength: 5000 }),
        }),
        async (data) => {
          // Create user and post
          const user = await prisma.user.create({
            data: {
              email: data.email,
              password: data.password,
              name: data.name,
              role: 'LANDLORD',
            },
          })

          await prisma.landlord.create({
            data: {
              userId: user.id,
              phone: data.phone,
            },
          })

          const post = await prisma.post.create({
            data: {
              authorId: user.id,
              authorType: 'LANDLORD',
              content: data.content,
            },
          })

          // Create like
          const like = await prisma.like.create({
            data: {
              postId: post.id,
              userId: user.id,
            },
          })

          // Property: Like exists before post deletion
          const likeBefore = await prisma.like.findUnique({
            where: { id: like.id },
          })
          expect(likeBefore).toBeDefined()

          // Delete post
          await prisma.post.delete({
            where: { id: post.id },
          })

          // Property: Like must be cascade deleted
          const likeAfter = await prisma.like.findUnique({
            where: { id: like.id },
          })
          expect(likeAfter).toBeNull()
        }
      ),
      { numRuns: 5 }
    )
  })
})

describe('Property 39: Referential Integrity - Comments', () => {
  /**
   * Property: For any comment record, both postId and authorId must reference existing records.
   * 
   * **Validates: Requirement 7.5**
   */

  it('should enforce referential integrity for comments - valid references', async () => {
    // Feature: cong-dong-nha-tro, Property 39: Referential Integrity - Comments
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 100 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }),
          postContent: fc.string({ minLength: 1, maxLength: 5000 }),
          commentContent: fc.string({ minLength: 1, maxLength: 1000 }),
        }),
        async (data) => {
          // Create user
          const user = await prisma.user.create({
            data: {
              email: data.email,
              password: data.password,
              name: data.name,
              role: 'TENANT',
            },
          })

          const landlord = await prisma.landlord.create({
            data: {
              userId: user.id,
              phone: data.phone,
            },
          })

          await prisma.tenant.create({
            data: {
              userId: user.id,
              landlordId: landlord.id,
              phone: data.phone,
            },
          })

          // Create post
          const post = await prisma.post.create({
            data: {
              authorId: user.id,
              authorType: 'TENANT',
              content: data.postContent,
            },
          })

          // Create comment with valid references
          const comment = await prisma.comment.create({
            data: {
              postId: post.id,
              authorId: user.id,
              content: data.commentContent,
            },
          })

          // Property: Comment must have valid postId
          expect(comment.postId).toBe(post.id)
          
          // Property: Comment must have valid authorId
          expect(comment.authorId).toBe(user.id)

          // Property: Referenced post must exist
          const referencedPost = await prisma.post.findUnique({
            where: { id: comment.postId },
          })
          expect(referencedPost).toBeDefined()
          expect(referencedPost!.id).toBe(post.id)

          // Property: Referenced author must exist
          const referencedAuthor = await prisma.user.findUnique({
            where: { id: comment.authorId },
          })
          expect(referencedAuthor).toBeDefined()
          expect(referencedAuthor!.id).toBe(user.id)
        }
      ),
      { numRuns: 10 }
    )
  })

  it('should reject comments with non-existent postId', async () => {
    // Feature: cong-dong-nha-tro, Property 39: Referential Integrity - Comments
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 100 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }),
          commentContent: fc.string({ minLength: 1, maxLength: 1000 }),
          fakePostId: fc.uuid(),
        }),
        async (data) => {
          // Create user
          const user = await prisma.user.create({
            data: {
              email: data.email,
              password: data.password,
              name: data.name,
              role: 'TENANT',
            },
          })

          const landlord = await prisma.landlord.create({
            data: {
              userId: user.id,
              phone: data.phone,
            },
          })

          await prisma.tenant.create({
            data: {
              userId: user.id,
              landlordId: landlord.id,
              phone: data.phone,
            },
          })

          // Property: Creating comment with non-existent postId must fail
          await expect(
            prisma.comment.create({
              data: {
                postId: data.fakePostId,
                authorId: user.id,
                content: data.commentContent,
              },
            })
          ).rejects.toThrow()
        }
      ),
      { numRuns: 5 }
    )
  })

  it('should reject comments with non-existent authorId', async () => {
    // Feature: cong-dong-nha-tro, Property 39: Referential Integrity - Comments
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 100 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }),
          postContent: fc.string({ minLength: 1, maxLength: 5000 }),
          commentContent: fc.string({ minLength: 1, maxLength: 1000 }),
          fakeAuthorId: fc.uuid(),
        }),
        async (data) => {
          // Create user and post
          const user = await prisma.user.create({
            data: {
              email: data.email,
              password: data.password,
              name: data.name,
              role: 'TENANT',
            },
          })

          const landlord = await prisma.landlord.create({
            data: {
              userId: user.id,
              phone: data.phone,
            },
          })

          await prisma.tenant.create({
            data: {
              userId: user.id,
              landlordId: landlord.id,
              phone: data.phone,
            },
          })

          const post = await prisma.post.create({
            data: {
              authorId: user.id,
              authorType: 'TENANT',
              content: data.postContent,
            },
          })

          // Property: Creating comment with non-existent authorId must fail
          await expect(
            prisma.comment.create({
              data: {
                postId: post.id,
                authorId: data.fakeAuthorId,
                content: data.commentContent,
              },
            })
          ).rejects.toThrow()
        }
      ),
      { numRuns: 5 }
    )
  })

  it('should cascade delete comments when post is deleted', async () => {
    // Feature: cong-dong-nha-tro, Property 39: Referential Integrity - Comments
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 100 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }),
          postContent: fc.string({ minLength: 1, maxLength: 5000 }),
          commentContent: fc.string({ minLength: 1, maxLength: 1000 }),
        }),
        async (data) => {
          // Create user and post
          const user = await prisma.user.create({
            data: {
              email: data.email,
              password: data.password,
              name: data.name,
              role: 'TENANT',
            },
          })

          const landlord = await prisma.landlord.create({
            data: {
              userId: user.id,
              phone: data.phone,
            },
          })

          await prisma.tenant.create({
            data: {
              userId: user.id,
              landlordId: landlord.id,
              phone: data.phone,
            },
          })

          const post = await prisma.post.create({
            data: {
              authorId: user.id,
              authorType: 'TENANT',
              content: data.postContent,
            },
          })

          // Create comment
          const comment = await prisma.comment.create({
            data: {
              postId: post.id,
              authorId: user.id,
              content: data.commentContent,
            },
          })

          // Property: Comment exists before post deletion
          const commentBefore = await prisma.comment.findUnique({
            where: { id: comment.id },
          })
          expect(commentBefore).toBeDefined()

          // Delete post
          await prisma.post.delete({
            where: { id: post.id },
          })

          // Property: Comment must be cascade deleted
          const commentAfter = await prisma.comment.findUnique({
            where: { id: comment.id },
          })
          expect(commentAfter).toBeNull()
        }
      ),
      { numRuns: 5 }
    )
  })
})

describe('Property 40: Referential Integrity - Comment Parent', () => {
  /**
   * Property: For any comment with parentId, the parent comment must exist in the database.
   * 
   * **Validates: Requirement 7.6**
   */

  it('should enforce referential integrity for comment parent - valid parent', async () => {
    // Feature: cong-dong-nha-tro, Property 40: Referential Integrity - Comment Parent
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 100 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }),
          postContent: fc.string({ minLength: 1, maxLength: 5000 }),
          parentContent: fc.string({ minLength: 1, maxLength: 1000 }),
          replyContent: fc.string({ minLength: 1, maxLength: 1000 }),
        }),
        async (data) => {
          // Create user
          const user = await prisma.user.create({
            data: {
              email: data.email,
              password: data.password,
              name: data.name,
              role: 'LANDLORD',
            },
          })

          await prisma.landlord.create({
            data: {
              userId: user.id,
              phone: data.phone,
            },
          })

          // Create post
          const post = await prisma.post.create({
            data: {
              authorId: user.id,
              authorType: 'LANDLORD',
              content: data.postContent,
            },
          })

          // Create parent comment
          const parentComment = await prisma.comment.create({
            data: {
              postId: post.id,
              authorId: user.id,
              content: data.parentContent,
            },
          })

          // Create reply with valid parentId
          const reply = await prisma.comment.create({
            data: {
              postId: post.id,
              authorId: user.id,
              content: data.replyContent,
              parentId: parentComment.id,
            },
          })

          // Property: Reply must have valid parentId
          expect(reply.parentId).toBe(parentComment.id)

          // Property: Referenced parent comment must exist
          const referencedParent = await prisma.comment.findUnique({
            where: { id: reply.parentId! },
          })
          expect(referencedParent).toBeDefined()
          expect(referencedParent!.id).toBe(parentComment.id)

          // Property: Parent and reply must belong to same post
          expect(reply.postId).toBe(parentComment.postId)
        }
      ),
      { numRuns: 10 }
    )
  })

  it('should reject replies with non-existent parentId', async () => {
    // Feature: cong-dong-nha-tro, Property 40: Referential Integrity - Comment Parent
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 100 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }),
          postContent: fc.string({ minLength: 1, maxLength: 5000 }),
          replyContent: fc.string({ minLength: 1, maxLength: 1000 }),
          fakeParentId: fc.uuid(),
        }),
        async (data) => {
          // Create user and post
          const user = await prisma.user.create({
            data: {
              email: data.email,
              password: data.password,
              name: data.name,
              role: 'LANDLORD',
            },
          })

          await prisma.landlord.create({
            data: {
              userId: user.id,
              phone: data.phone,
            },
          })

          const post = await prisma.post.create({
            data: {
              authorId: user.id,
              authorType: 'LANDLORD',
              content: data.postContent,
            },
          })

          // Property: Creating reply with non-existent parentId must fail
          await expect(
            prisma.comment.create({
              data: {
                postId: post.id,
                authorId: user.id,
                content: data.replyContent,
                parentId: data.fakeParentId,
              },
            })
          ).rejects.toThrow()
        }
      ),
      { numRuns: 5 }
    )
  })

  it('should cascade delete replies when parent comment is deleted', async () => {
    // Feature: cong-dong-nha-tro, Property 40: Referential Integrity - Comment Parent
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 100 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }),
          postContent: fc.string({ minLength: 1, maxLength: 5000 }),
          parentContent: fc.string({ minLength: 1, maxLength: 1000 }),
          replyContent: fc.string({ minLength: 1, maxLength: 1000 }),
        }),
        async (data) => {
          // Create user and post
          const user = await prisma.user.create({
            data: {
              email: data.email,
              password: data.password,
              name: data.name,
              role: 'LANDLORD',
            },
          })

          await prisma.landlord.create({
            data: {
              userId: user.id,
              phone: data.phone,
            },
          })

          const post = await prisma.post.create({
            data: {
              authorId: user.id,
              authorType: 'LANDLORD',
              content: data.postContent,
            },
          })

          // Create parent comment and reply
          const parentComment = await prisma.comment.create({
            data: {
              postId: post.id,
              authorId: user.id,
              content: data.parentContent,
            },
          })

          const reply = await prisma.comment.create({
            data: {
              postId: post.id,
              authorId: user.id,
              content: data.replyContent,
              parentId: parentComment.id,
            },
          })

          // Property: Reply exists before parent deletion
          const replyBefore = await prisma.comment.findUnique({
            where: { id: reply.id },
          })
          expect(replyBefore).toBeDefined()

          // Delete parent comment
          await prisma.comment.delete({
            where: { id: parentComment.id },
          })

          // Property: Reply must be cascade deleted
          const replyAfter = await prisma.comment.findUnique({
            where: { id: reply.id },
          })
          expect(replyAfter).toBeNull()
        }
      ),
      { numRuns: 5 }
    )
  })

  it('should maintain referential integrity for nested replies', async () => {
    // Feature: cong-dong-nha-tro, Property 40: Referential Integrity - Comment Parent
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 100 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }),
          postContent: fc.string({ minLength: 1, maxLength: 5000 }),
          comment1: fc.string({ minLength: 1, maxLength: 1000 }),
          comment2: fc.string({ minLength: 1, maxLength: 1000 }),
          comment3: fc.string({ minLength: 1, maxLength: 1000 }),
        }),
        async (data) => {
          // Create user and post
          const user = await prisma.user.create({
            data: {
              email: data.email,
              password: data.password,
              name: data.name,
              role: 'LANDLORD',
            },
          })

          await prisma.landlord.create({
            data: {
              userId: user.id,
              phone: data.phone,
            },
          })

          const post = await prisma.post.create({
            data: {
              authorId: user.id,
              authorType: 'LANDLORD',
              content: data.postContent,
            },
          })

          // Create nested comments (level 1 -> level 2 -> level 3)
          const level1 = await prisma.comment.create({
            data: {
              postId: post.id,
              authorId: user.id,
              content: data.comment1,
            },
          })

          const level2 = await prisma.comment.create({
            data: {
              postId: post.id,
              authorId: user.id,
              content: data.comment2,
              parentId: level1.id,
            },
          })

          const level3 = await prisma.comment.create({
            data: {
              postId: post.id,
              authorId: user.id,
              content: data.comment3,
              parentId: level2.id,
            },
          })

          // Property: Each level must reference its parent correctly
          expect(level2.parentId).toBe(level1.id)
          expect(level3.parentId).toBe(level2.id)

          // Property: All comments must belong to same post
          expect(level1.postId).toBe(post.id)
          expect(level2.postId).toBe(post.id)
          expect(level3.postId).toBe(post.id)

          // Property: Deleting level1 cascades to all children
          await prisma.comment.delete({
            where: { id: level1.id },
          })

          const level2After = await prisma.comment.findUnique({
            where: { id: level2.id },
          })
          const level3After = await prisma.comment.findUnique({
            where: { id: level3.id },
          })

          expect(level2After).toBeNull()
          expect(level3After).toBeNull()
        }
      ),
      { numRuns: 5 }
    )
  })
})

describe('Property 41: Referential Integrity - Shares', () => {
  /**
   * Property: For any share record, both postId and userId must reference existing records.
   * 
   * **Validates: Requirement 7.7**
   */

  it('should enforce referential integrity for shares - valid references', async () => {
    // Feature: cong-dong-nha-tro, Property 41: Referential Integrity - Shares
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 100 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }),
          content: fc.string({ minLength: 1, maxLength: 5000 }),
          sharedWith: fc.option(fc.constantFrom('facebook', 'twitter', 'link'), { nil: undefined }),
        }),
        async (data) => {
          // Create user
          const user = await prisma.user.create({
            data: {
              email: data.email,
              password: data.password,
              name: data.name,
              role: 'TENANT',
            },
          })

          const landlord = await prisma.landlord.create({
            data: {
              userId: user.id,
              phone: data.phone,
            },
          })

          await prisma.tenant.create({
            data: {
              userId: user.id,
              landlordId: landlord.id,
              phone: data.phone,
            },
          })

          // Create post
          const post = await prisma.post.create({
            data: {
              authorId: user.id,
              authorType: 'TENANT',
              content: data.content,
            },
          })

          // Create share with valid references
          const share = await prisma.share.create({
            data: {
              postId: post.id,
              userId: user.id,
              sharedWith: data.sharedWith,
            },
          })

          // Property: Share must have valid postId
          expect(share.postId).toBe(post.id)
          
          // Property: Share must have valid userId
          expect(share.userId).toBe(user.id)

          // Property: Referenced post must exist
          const referencedPost = await prisma.post.findUnique({
            where: { id: share.postId },
          })
          expect(referencedPost).toBeDefined()
          expect(referencedPost!.id).toBe(post.id)

          // Property: Referenced user must exist
          const referencedUser = await prisma.user.findUnique({
            where: { id: share.userId },
          })
          expect(referencedUser).toBeDefined()
          expect(referencedUser!.id).toBe(user.id)
        }
      ),
      { numRuns: 10 }
    )
  })

  it('should reject shares with non-existent postId', async () => {
    // Feature: cong-dong-nha-tro, Property 41: Referential Integrity - Shares
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 100 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }),
          fakePostId: fc.uuid(),
        }),
        async (data) => {
          // Create user
          const user = await prisma.user.create({
            data: {
              email: data.email,
              password: data.password,
              name: data.name,
              role: 'TENANT',
            },
          })

          const landlord = await prisma.landlord.create({
            data: {
              userId: user.id,
              phone: data.phone,
            },
          })

          await prisma.tenant.create({
            data: {
              userId: user.id,
              landlordId: landlord.id,
              phone: data.phone,
            },
          })

          // Property: Creating share with non-existent postId must fail
          await expect(
            prisma.share.create({
              data: {
                postId: data.fakePostId,
                userId: user.id,
              },
            })
          ).rejects.toThrow()
        }
      ),
      { numRuns: 5 }
    )
  })

  it('should reject shares with non-existent userId', async () => {
    // Feature: cong-dong-nha-tro, Property 41: Referential Integrity - Shares
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 100 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }),
          content: fc.string({ minLength: 1, maxLength: 5000 }),
          fakeUserId: fc.uuid(),
        }),
        async (data) => {
          // Create user and post
          const user = await prisma.user.create({
            data: {
              email: data.email,
              password: data.password,
              name: data.name,
              role: 'TENANT',
            },
          })

          const landlord = await prisma.landlord.create({
            data: {
              userId: user.id,
              phone: data.phone,
            },
          })

          await prisma.tenant.create({
            data: {
              userId: user.id,
              landlordId: landlord.id,
              phone: data.phone,
            },
          })

          const post = await prisma.post.create({
            data: {
              authorId: user.id,
              authorType: 'TENANT',
              content: data.content,
            },
          })

          // Property: Creating share with non-existent userId must fail
          await expect(
            prisma.share.create({
              data: {
                postId: post.id,
                userId: data.fakeUserId,
              },
            })
          ).rejects.toThrow()
        }
      ),
      { numRuns: 5 }
    )
  })

  it('should cascade delete shares when post is deleted', async () => {
    // Feature: cong-dong-nha-tro, Property 41: Referential Integrity - Shares
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 100 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }),
          content: fc.string({ minLength: 1, maxLength: 5000 }),
        }),
        async (data) => {
          // Create user and post
          const user = await prisma.user.create({
            data: {
              email: data.email,
              password: data.password,
              name: data.name,
              role: 'TENANT',
            },
          })

          const landlord = await prisma.landlord.create({
            data: {
              userId: user.id,
              phone: data.phone,
            },
          })

          await prisma.tenant.create({
            data: {
              userId: user.id,
              landlordId: landlord.id,
              phone: data.phone,
            },
          })

          const post = await prisma.post.create({
            data: {
              authorId: user.id,
              authorType: 'TENANT',
              content: data.content,
            },
          })

          // Create share
          const share = await prisma.share.create({
            data: {
              postId: post.id,
              userId: user.id,
            },
          })

          // Property: Share exists before post deletion
          const shareBefore = await prisma.share.findUnique({
            where: { id: share.id },
          })
          expect(shareBefore).toBeDefined()

          // Delete post
          await prisma.post.delete({
            where: { id: post.id },
          })

          // Property: Share must be cascade deleted
          const shareAfter = await prisma.share.findUnique({
            where: { id: share.id },
          })
          expect(shareAfter).toBeNull()
        }
      ),
      { numRuns: 5 }
    )
  })
})

describe('Property 42: Timestamp Ordering', () => {
  /**
   * Property: For any post or comment, createdAt should be less than or equal to updatedAt.
   * 
   * **Validates: Requirement 7.8**
   */

  it('should maintain timestamp ordering for posts - createdAt <= updatedAt', async () => {
    // Feature: cong-dong-nha-tro, Property 42: Timestamp Ordering
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 100 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }),
          content: fc.string({ minLength: 1, maxLength: 5000 }),
          updatedContent: fc.string({ minLength: 1, maxLength: 5000 }),
        }),
        async (data) => {
          // Create user
          const user = await prisma.user.create({
            data: {
              email: data.email,
              password: data.password,
              name: data.name,
              role: 'LANDLORD',
            },
          })

          await prisma.landlord.create({
            data: {
              userId: user.id,
              phone: data.phone,
            },
          })

          // Create post
          const post = await prisma.post.create({
            data: {
              authorId: user.id,
              authorType: 'LANDLORD',
              content: data.content,
            },
          })

          // Property: createdAt <= updatedAt on creation
          expect(post.createdAt.getTime()).toBeLessThanOrEqual(post.updatedAt.getTime())

          // Wait a bit to ensure time difference
          await new Promise(resolve => setTimeout(resolve, 10))

          // Update post
          const updatedPost = await prisma.post.update({
            where: { id: post.id },
            data: { content: data.updatedContent },
          })

          // Property: createdAt <= updatedAt after update
          expect(updatedPost.createdAt.getTime()).toBeLessThanOrEqual(updatedPost.updatedAt.getTime())

          // Property: updatedAt should be greater than original updatedAt
          expect(updatedPost.updatedAt.getTime()).toBeGreaterThanOrEqual(post.updatedAt.getTime())

          // Property: createdAt should remain unchanged
          expect(updatedPost.createdAt.getTime()).toBe(post.createdAt.getTime())
        }
      ),
      { numRuns: 10 }
    )
  })

  it('should maintain timestamp ordering for comments - createdAt <= updatedAt', async () => {
    // Feature: cong-dong-nha-tro, Property 42: Timestamp Ordering
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 100 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }),
          postContent: fc.string({ minLength: 1, maxLength: 5000 }),
          commentContent: fc.string({ minLength: 1, maxLength: 1000 }),
          updatedContent: fc.string({ minLength: 1, maxLength: 1000 }),
        }),
        async (data) => {
          // Create user
          const user = await prisma.user.create({
            data: {
              email: data.email,
              password: data.password,
              name: data.name,
              role: 'TENANT',
            },
          })

          const landlord = await prisma.landlord.create({
            data: {
              userId: user.id,
              phone: data.phone,
            },
          })

          await prisma.tenant.create({
            data: {
              userId: user.id,
              landlordId: landlord.id,
              phone: data.phone,
            },
          })

          // Create post
          const post = await prisma.post.create({
            data: {
              authorId: user.id,
              authorType: 'TENANT',
              content: data.postContent,
            },
          })

          // Create comment
          const comment = await prisma.comment.create({
            data: {
              postId: post.id,
              authorId: user.id,
              content: data.commentContent,
            },
          })

          // Property: createdAt <= updatedAt on creation
          expect(comment.createdAt.getTime()).toBeLessThanOrEqual(comment.updatedAt.getTime())

          // Wait a bit to ensure time difference
          await new Promise(resolve => setTimeout(resolve, 10))

          // Update comment
          const updatedComment = await prisma.comment.update({
            where: { id: comment.id },
            data: { content: data.updatedContent },
          })

          // Property: createdAt <= updatedAt after update
          expect(updatedComment.createdAt.getTime()).toBeLessThanOrEqual(updatedComment.updatedAt.getTime())

          // Property: updatedAt should be greater than original updatedAt
          expect(updatedComment.updatedAt.getTime()).toBeGreaterThanOrEqual(comment.updatedAt.getTime())

          // Property: createdAt should remain unchanged
          expect(updatedComment.createdAt.getTime()).toBe(comment.createdAt.getTime())
        }
      ),
      { numRuns: 10 }
    )
  })

  it('should maintain timestamp ordering across multiple updates', async () => {
    // Feature: cong-dong-nha-tro, Property 42: Timestamp Ordering
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 100 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }),
          content: fc.string({ minLength: 1, maxLength: 5000 }),
          updates: fc.array(fc.string({ minLength: 1, maxLength: 5000 }), { minLength: 2, maxLength: 5 }),
        }),
        async (data) => {
          // Create user
          const user = await prisma.user.create({
            data: {
              email: data.email,
              password: data.password,
              name: data.name,
              role: 'LANDLORD',
            },
          })

          await prisma.landlord.create({
            data: {
              userId: user.id,
              phone: data.phone,
            },
          })

          // Create post
          let post = await prisma.post.create({
            data: {
              authorId: user.id,
              authorType: 'LANDLORD',
              content: data.content,
            },
          })

          const originalCreatedAt = post.createdAt
          let previousUpdatedAt = post.updatedAt

          // Perform multiple updates
          for (const newContent of data.updates) {
            await new Promise(resolve => setTimeout(resolve, 10))

            post = await prisma.post.update({
              where: { id: post.id },
              data: { content: newContent },
            })

            // Property: createdAt <= updatedAt always holds
            expect(post.createdAt.getTime()).toBeLessThanOrEqual(post.updatedAt.getTime())

            // Property: createdAt never changes
            expect(post.createdAt.getTime()).toBe(originalCreatedAt.getTime())

            // Property: updatedAt is monotonically increasing
            expect(post.updatedAt.getTime()).toBeGreaterThanOrEqual(previousUpdatedAt.getTime())

            previousUpdatedAt = post.updatedAt
          }
        }
      ),
      { numRuns: 5 }
    )
  })

  it('should maintain timestamp ordering for all entities in a transaction', async () => {
    // Feature: cong-dong-nha-tro, Property 42: Timestamp Ordering
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 100 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }),
          postContent: fc.string({ minLength: 1, maxLength: 5000 }),
          commentContent: fc.string({ minLength: 1, maxLength: 1000 }),
        }),
        async (data) => {
          // Create user
          const user = await prisma.user.create({
            data: {
              email: data.email,
              password: data.password,
              name: data.name,
              role: 'TENANT',
            },
          })

          const landlord = await prisma.landlord.create({
            data: {
              userId: user.id,
              phone: data.phone,
            },
          })

          await prisma.tenant.create({
            data: {
              userId: user.id,
              landlordId: landlord.id,
              phone: data.phone,
            },
          })

          // Create post, like, comment, and share in transaction
          const result = await prisma.$transaction(async (tx) => {
            const post = await tx.post.create({
              data: {
                authorId: user.id,
                authorType: 'TENANT',
                content: data.postContent,
              },
            })

            const like = await tx.like.create({
              data: {
                postId: post.id,
                userId: user.id,
              },
            })

            const comment = await tx.comment.create({
              data: {
                postId: post.id,
                authorId: user.id,
                content: data.commentContent,
              },
            })

            const share = await tx.share.create({
              data: {
                postId: post.id,
                userId: user.id,
              },
            })

            return { post, like, comment, share }
          })

          // Property: All entities have valid timestamp ordering
          expect(result.post.createdAt.getTime()).toBeLessThanOrEqual(result.post.updatedAt.getTime())
          expect(result.comment.createdAt.getTime()).toBeLessThanOrEqual(result.comment.updatedAt.getTime())

          // Property: All timestamps are defined
          expect(result.post.createdAt).toBeInstanceOf(Date)
          expect(result.post.updatedAt).toBeInstanceOf(Date)
          expect(result.like.createdAt).toBeInstanceOf(Date)
          expect(result.comment.createdAt).toBeInstanceOf(Date)
          expect(result.comment.updatedAt).toBeInstanceOf(Date)
          expect(result.share.createdAt).toBeInstanceOf(Date)
        }
      ),
      { numRuns: 5 }
    )
  })
})
