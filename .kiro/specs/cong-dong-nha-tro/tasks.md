# Implementation Plan: Tính năng Cộng đồng Nhà trọ

## Overview

Triển khai tính năng cộng đồng cho phép Landlord và Tenant tương tác thông qua bài viết, like, comment và share. Hệ thống được xây dựng trên Next.js với TypeScript, Prisma ORM và NextAuth.js. Triển khai theo 3 giai đoạn: Core Features (MVP), Enhanced Features, và Optimization.

## Tasks

- [x] 1. Thiết lập database schema và migrations
  - Tạo Prisma schema cho Post, Like, Comment, Share models
  - Thêm relations và indexes theo design
  - Chạy migration để tạo tables
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 9.1, 9.2, 9.3, 9.4_

- [x] 2. Implement Post Service và API routes
  - [x] 2.1 Tạo Post Service với CRUD operations
    - Implement `createPost()` với validation
    - Implement `getPosts()` với pagination và filtering
    - Implement `updatePost()` và `deletePost()`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_
  
  - [ ]* 2.2 Write property test for Post creation
    - **Property 1: Post Content Validation**
    - **Property 2: Post Author Recording**
    - **Property 3: Post Image Limit**
    - **Property 4: Post Initialization**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.6, 1.8, 1.9, 7.1, 7.2**
  
  - [ ]* 2.3 Write property test for Post retrieval
    - **Property 5: Post Sorting**
    - **Property 6: Pagination Limit**
    - **Property 7: Author Filtering**
    - **Property 8: Author Type Filtering**
    - **Property 9: Search Filtering**
    - **Property 10: Computed Fields Presence**
    - **Property 11: Sensitive Data Exclusion**
    - **Validates: Requirements 2.1, 2.2, 2.5, 2.6, 2.7, 2.8, 2.9, 11.8**
  
  - [ ]* 2.4 Write property test for Post update and deletion
    - **Property 12: Post Update Timestamp**
    - **Property 13: Update Authorization**
    - **Property 14: Post Deletion**
    - **Property 15: Cascade Deletion of Likes**
    - **Property 16: Cascade Deletion of Comments**
    - **Property 17: Cascade Deletion of Shares**
    - **Property 18: Delete Authorization**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 8.5, 8.6**
  
  - [x] 2.5 Tạo API routes cho Post
    - POST `/api/posts` - Create post
    - GET `/api/posts` - Get posts with filters
    - PATCH `/api/posts/[id]` - Update post
    - DELETE `/api/posts/[id]` - Delete post
    - Thêm authentication middleware
    - Thêm authorization checks
    - _Requirements: 8.1, 8.5, 8.6, 10.1, 10.2, 10.3, 10.4_
  
  - [ ]* 2.6 Write unit tests for Post API routes
    - Test authentication và authorization
    - Test validation errors
    - Test success cases
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement Like Service và API routes
  - [x] 4.1 Tạo Like Service
    - Implement `toggleLike()` với idempotency
    - Implement `getLikes()` và `hasUserLiked()`
    - Đảm bảo unique constraint (postId, userId)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 7.3, 7.4_
  
  - [ ]* 4.2 Write property test for Like management
    - **Property 19: Like Creation**
    - **Property 20: Like Toggle Idempotence**
    - **Property 21: Like Uniqueness**
    - **Property 22: Like Count Accuracy**
    - **Property 23: Like Status Query**
    - **Property 24: Like List Completeness**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 7.4**
  
  - [x] 4.3 Tạo API routes cho Like
    - POST `/api/posts/[id]/like` - Toggle like
    - GET `/api/posts/[id]/likes` - Get likes
    - Thêm authentication middleware
    - _Requirements: 8.2, 10.1, 10.4_
  
  - [ ]* 4.4 Write unit tests for Like API routes
    - Test toggle functionality
    - Test duplicate like handling
    - Test authentication
    - _Requirements: 8.2, 10.1_

- [x] 5. Implement Comment Service và API routes
  - [x] 5.1 Tạo Comment Service
    - Implement `createComment()` với validation
    - Implement nested replies với depth limit (max 3)
    - Implement `updateComment()` và `deleteComment()`
    - Implement `getComments()` với nested structure
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 7.5, 7.6_
  
  - [ ]* 5.2 Write property test for Comment management
    - **Property 25: Comment Creation**
    - **Property 26: Comment Count Increment**
    - **Property 27: Reply Parent Link**
    - **Property 28: Reply Post Validation**
    - **Property 29: Comment Depth Limit**
    - **Property 30: Comment Update Timestamp**
    - **Property 31: Comment Cascade Deletion**
    - **Property 32: Comment Nested Structure**
    - **Property 33: Comment Authorization**
    - **Validates: Requirements 5.1, 5.4, 5.5, 5.6, 5.7, 5.9, 5.10, 5.11, 8.7, 8.8**
  
  - [x] 5.3 Tạo API routes cho Comment
    - POST `/api/posts/[id]/comments` - Create comment
    - GET `/api/posts/[id]/comments` - Get comments
    - PATCH `/api/comments/[id]` - Update comment
    - DELETE `/api/comments/[id]` - Delete comment
    - Thêm authentication và authorization
    - _Requirements: 8.3, 8.7, 8.8, 10.1, 10.4_
  
  - [ ]* 5.4 Write unit tests for Comment API routes
    - Test comment creation và replies
    - Test depth limit enforcement
    - Test cascade deletion
    - Test authorization
    - _Requirements: 5.7, 5.8, 8.7, 8.8_

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement Share Service và API routes
  - [x] 7.1 Tạo Share Service
    - Implement `sharePost()` với platform tracking
    - Implement `getShares()`
    - Update shareCount khi share
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.7_
  
  - [ ]* 7.2 Write property test for Share management
    - **Property 34: Share Creation**
    - **Property 35: Share Count Increment**
    - **Property 36: Share Platform Recording**
    - **Property 37: Share List Completeness**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**
  
  - [x] 7.3 Tạo API routes cho Share
    - POST `/api/posts/[id]/share` - Share post
    - GET `/api/posts/[id]/shares` - Get shares
    - Thêm authentication middleware
    - _Requirements: 8.4, 10.1_
  
  - [ ]* 7.4 Write unit tests for Share API routes
    - Test share creation
    - Test platform tracking
    - Test authentication
    - _Requirements: 8.4_

- [ ] 8. Implement Image Upload functionality
  - [ ] 8.1 Setup image upload service
    - Cài đặt và cấu hình image hosting (Cloudinary hoặc UploadThing)
    - Tạo upload API route
    - Implement file validation (type, size)
    - Generate unique filenames
    - _Requirements: 11.3, 11.4, 12.1, 12.2, 12.3, 12.4_
  
  - [ ]* 8.2 Write property test for Image upload
    - **Property 46: Image Type Validation**
    - **Property 47: Image Size Validation**
    - **Property 48: Image Filename Uniqueness**
    - **Property 49: Image Cleanup on Post Deletion**
    - **Validates: Requirements 11.3, 11.4, 12.1, 12.2, 12.3, 12.6**
  
  - [ ] 8.3 Tạo API route cho image upload
    - POST `/api/upload` - Upload images
    - Validate file type và size
    - Return image URLs
    - _Requirements: 10.7, 11.3, 11.4, 12.1, 12.2_
  
  - [ ]* 8.4 Write unit tests for Image upload
    - Test file validation
    - Test upload success
    - Test error handling
    - _Requirements: 10.7, 12.5_

- [ ] 9. Implement Content Sanitization và Security
  - [ ] 9.1 Tạo content sanitization utilities
    - Cài đặt `isomorphic-dompurify`
    - Implement `sanitizeContent()` function
    - Strip HTML tags và escape special characters
    - Integrate vào Post và Comment services
    - _Requirements: 11.1, 11.2_
  
  - [ ]* 9.2 Write property test for Content sanitization
    - **Property 45: Content Sanitization**
    - **Validates: Requirements 11.1, 11.2**
  
  - [ ] 9.3 Implement rate limiting
    - Setup rate limiting middleware
    - Configure limits cho các endpoints
    - _Requirements: 11.6_
  
  - [ ] 9.4 Implement CSRF protection
    - Verify NextAuth CSRF tokens
    - Add CSRF validation cho state-changing operations
    - _Requirements: 11.7_
  
  - [ ]* 9.5 Write unit tests for Security features
    - Test content sanitization
    - Test rate limiting
    - Test CSRF protection
    - _Requirements: 11.1, 11.2, 11.6, 11.7_

- [ ] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Create Frontend Components
  - [x] 11.1 Tạo Post components
    - `PostCard` - Display single post
    - `PostList` - Display list of posts
    - `CreatePostForm` - Form tạo post mới
    - `EditPostForm` - Form chỉnh sửa post
    - Integrate với API routes
    - _Requirements: 1.1, 1.3, 1.6, 3.1_
  
  - [x] 11.2 Tạo Like components
    - `LikeButton` - Toggle like/unlike
    - Display like count
    - Show liked state
    - Optimistic UI updates
    - _Requirements: 4.1, 4.2, 4.4, 4.5_
  
  - [x] 11.3 Tạo Comment components
    - `CommentList` - Display comments với nested structure
    - `CommentForm` - Form tạo comment
    - `CommentItem` - Display single comment với replies
    - `ReplyForm` - Form reply to comment
    - Handle depth limit (max 3)
    - _Requirements: 5.1, 5.5, 5.7, 5.11_
  
  - [x] 11.4 Tạo Share components
    - `ShareButton` - Share post
    - Share modal với platform options
    - Track share count
    - _Requirements: 6.1, 6.3_
  
  - [x] 11.5 Tạo Image Upload components
    - `ImageUploader` - Upload multiple images
    - Image preview
    - Validate file type và size
    - Show upload progress
    - _Requirements: 1.6, 11.3, 11.4, 12.1, 12.2_

- [x] 12. Create Community Pages
  - [x] 12.1 Tạo Community Feed page
    - Display posts với pagination/infinite scroll
    - Filter by author type (Landlord/Tenant)
    - Search functionality
    - Sort options
    - _Requirements: 2.1, 2.2, 2.5, 2.6, 2.7_
  
  - [x] 12.2 Tạo Post Detail page
    - Display full post với all interactions
    - Show all comments với nested structure
    - Like, comment, share functionality
    - Edit/delete options cho author
    - _Requirements: 3.1, 3.3, 4.1, 5.1, 6.1_
  
  - [x] 12.3 Integrate vào navigation
    - Add Community link vào Landlord sidebar
    - Add Community link vào Tenant sidebar
    - Update routing

- [ ] 13. Implement Error Handling và Validation
  - [x] 13.1 Add error handling cho tất cả API routes
    - Validation errors (400)
    - Authentication errors (401)
    - Authorization errors (403)
    - Not found errors (404)
    - Server errors (500)
    - Service unavailable (503)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_
  
  - [ ]* 13.2 Write property test for Error handling
    - **Property 43: Validation Error Response**
    - **Property 44: Not Found Error Response**
    - **Validates: Requirements 10.1, 10.4**
  
  - [ ] 13.3 Add client-side error handling
    - Display error messages
    - Retry mechanisms
    - Fallback UI
    - _Requirements: 10.1, 10.7_
  
  - [ ]* 13.4 Write unit tests for Error scenarios
    - Test all error types
    - Test error messages
    - Test recovery flows
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

- [ ] 14. Implement Performance Optimizations
  - [ ] 14.1 Add database query optimizations
    - Use `select` để fetch only needed fields
    - Use `include` để avoid N+1 queries
    - Verify indexes are used
    - _Requirements: 9.5, 9.6_
  
  - [ ] 14.2 Add frontend optimizations
    - Implement infinite scroll cho post list
    - Add optimistic updates
    - Lazy load images
    - Debounce search input
    - _Requirements: 9.5, 9.6_
  
  - [ ]* 14.3 Write performance tests
    - Test query performance
    - Test pagination performance
    - Test with large datasets

- [ ] 15. Final Integration và Testing
  - [ ] 15.1 Integration testing
    - Test complete post lifecycle
    - Test multi-user interactions
    - Test all API endpoints
    - Test authentication flows
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_
  
  - [x] 15.2 Write property test for Data integrity
    - **Property 38: Referential Integrity - Likes**
    - **Property 39: Referential Integrity - Comments**
    - **Property 40: Referential Integrity - Comment Parent**
    - **Property 41: Referential Integrity - Shares**
    - **Property 42: Timestamp Ordering**
    - **Validates: Requirements 7.3, 7.5, 7.6, 7.7, 7.8**
  
  - [ ] 15.3 Manual testing
    - Test as Landlord user
    - Test as Tenant user
    - Test edge cases
    - Test error scenarios
  
  - [ ] 15.4 Update documentation
    - Update README với community feature
    - Document API endpoints
    - Add usage examples

- [ ] 16. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Implementation follows 3 phases: Core Features (tasks 1-7), Enhanced Features (tasks 8-12), Optimization (tasks 13-15)
- TypeScript is used throughout for type safety
- Prisma ORM handles database operations with built-in SQL injection protection
- NextAuth.js provides authentication and CSRF protection
