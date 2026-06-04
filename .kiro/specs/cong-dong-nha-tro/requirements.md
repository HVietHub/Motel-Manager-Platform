# Requirements Document: Tính năng Cộng đồng Nhà trọ

## Introduction

Tính năng cộng đồng cho phép chủ nhà (Landlord) và người thuê (Tenant) tương tác với nhau thông qua các bài viết. Hệ thống cung cấp khả năng tạo bài viết, like, comment và chia sẻ, tạo ra một không gian giao tiếp mở giúp cải thiện mối quan hệ và tạo cảm giác cộng đồng trong hệ sinh thái quản lý nhà trọ.

## Glossary

- **System**: Hệ thống quản lý cộng đồng nhà trọ
- **Post**: Bài viết được tạo bởi người dùng
- **User**: Người dùng hệ thống (Landlord hoặc Tenant)
- **Landlord**: Chủ nhà
- **Tenant**: Người thuê nhà
- **Like**: Hành động thích một bài viết
- **Comment**: Bình luận trên bài viết
- **Reply**: Trả lời một bình luận
- **Share**: Chia sẻ bài viết
- **Author**: Tác giả của bài viết hoặc bình luận
- **Database**: Cơ sở dữ liệu SQLite với Prisma ORM
- **API_Route**: Endpoint API của Next.js
- **Service_Layer**: Lớp xử lý logic nghiệp vụ

## Requirements

### Requirement 1: Post Creation

**User Story:** As a user (Landlord or Tenant), I want to create posts with text content and optional images, so that I can share information and communicate with the community.

#### Acceptance Criteria

1. WHEN a user submits a post with valid content THEN THE System SHALL create a new post with a unique ID
2. WHEN a user submits a post THEN THE System SHALL record the author ID and author type (LANDLORD or TENANT)
3. WHEN a user submits a post with content length between 1 and 5000 characters THEN THE System SHALL accept the post
4. WHEN a user submits a post with empty content THEN THE System SHALL reject the post with validation error
5. WHEN a user submits a post with content exceeding 5000 characters THEN THE System SHALL reject the post with validation error
6. WHEN a user submits a post with images THEN THE System SHALL accept up to 10 images
7. WHEN a user submits a post with more than 10 images THEN THE System SHALL reject the post with validation error
8. WHEN a post is created THEN THE System SHALL set createdAt and updatedAt timestamps to current time
9. WHEN a post is created THEN THE System SHALL initialize likeCount, commentCount, and shareCount to zero

### Requirement 2: Post Retrieval

**User Story:** As a user, I want to view posts from the community with filtering and pagination, so that I can browse relevant content efficiently.

#### Acceptance Criteria

1. WHEN a user requests posts THEN THE System SHALL return posts sorted by creation date descending by default
2. WHEN a user requests posts with pagination parameters THEN THE System SHALL return at most the specified limit of posts
3. WHEN a user requests posts with page number less than 1 THEN THE System SHALL reject the request with validation error
4. WHEN a user requests posts with limit outside range 1-100 THEN THE System SHALL reject the request with validation error
5. WHEN a user requests posts filtered by author ID THEN THE System SHALL return only posts from that author
6. WHEN a user requests posts filtered by author type THEN THE System SHALL return only posts from that author type
7. WHEN a user requests posts with search term THEN THE System SHALL return posts containing that term in content
8. WHEN posts are returned THEN THE System SHALL include computed fields likeCount, commentCount, and shareCount
9. WHEN posts are returned THEN THE System SHALL include author information excluding sensitive data

### Requirement 3: Post Update and Deletion

**User Story:** As a post author, I want to edit or delete my posts, so that I can correct mistakes or remove unwanted content.

#### Acceptance Criteria

1. WHEN a user updates their own post with valid content THEN THE System SHALL save the changes and update the updatedAt timestamp
2. WHEN a user attempts to update another user's post THEN THE System SHALL reject the request with authorization error
3. WHEN a user deletes their own post THEN THE System SHALL remove the post from the database
4. WHEN a post is deleted THEN THE System SHALL cascade delete all associated likes
5. WHEN a post is deleted THEN THE System SHALL cascade delete all associated comments
6. WHEN a post is deleted THEN THE System SHALL cascade delete all associated shares
7. WHEN a user attempts to delete another user's post THEN THE System SHALL reject the request with authorization error
8. WHEN a user attempts to interact with a non-existent post THEN THE System SHALL return not found error

### Requirement 4: Like Management

**User Story:** As a user, I want to like and unlike posts, so that I can express appreciation for content I enjoy.

#### Acceptance Criteria

1. WHEN a user likes a post they haven't liked before THEN THE System SHALL create a like record
2. WHEN a user likes a post they have already liked THEN THE System SHALL remove the like record (unlike)
3. WHEN a like is created THEN THE System SHALL ensure only one like exists per user-post pair
4. WHEN a like is created or removed THEN THE System SHALL update the post's likeCount accordingly
5. WHEN a user checks if they liked a post THEN THE System SHALL return the current like status
6. WHEN likes are queried for a post THEN THE System SHALL return all users who liked that post

### Requirement 5: Comment Creation and Management

**User Story:** As a user, I want to comment on posts and reply to other comments, so that I can participate in discussions.

#### Acceptance Criteria

1. WHEN a user creates a comment with valid content THEN THE System SHALL create a new comment with unique ID
2. WHEN a user creates a comment with empty content THEN THE System SHALL reject with validation error
3. WHEN a user creates a comment with content exceeding 1000 characters THEN THE System SHALL reject with validation error
4. WHEN a comment is created THEN THE System SHALL increment the post's commentCount
5. WHEN a user replies to a comment THEN THE System SHALL create a comment with parentId set to the parent comment
6. WHEN a user replies to a comment THEN THE System SHALL verify the parent comment belongs to the same post
7. WHEN a user creates a reply THEN THE System SHALL ensure the reply depth does not exceed 3 levels
8. WHEN a user attempts to reply beyond depth 3 THEN THE System SHALL reject with validation error
9. WHEN a user updates their own comment THEN THE System SHALL save changes and update the updatedAt timestamp
10. WHEN a user deletes their own comment THEN THE System SHALL remove the comment and all its replies
11. WHEN comments are retrieved for a post THEN THE System SHALL return them with nested reply structure

### Requirement 6: Share Management

**User Story:** As a user, I want to share posts to track engagement, so that popular content can be identified.

#### Acceptance Criteria

1. WHEN a user shares a post THEN THE System SHALL create a share record
2. WHEN a share is created THEN THE System SHALL increment the post's shareCount
3. WHEN a user shares a post with platform information THEN THE System SHALL record the sharedWith value
4. WHEN shares are queried for a post THEN THE System SHALL return all share records for that post

### Requirement 7: Data Integrity and Validation

**User Story:** As a system administrator, I want data integrity constraints enforced, so that the database remains consistent and reliable.

#### Acceptance Criteria

1. THE System SHALL ensure every post has a valid authorId that exists in the User table
2. THE System SHALL ensure every post has an authorType of either LANDLORD or TENANT
3. THE System SHALL ensure every like has a valid postId and userId
4. THE System SHALL ensure the combination of postId and userId is unique for likes
5. THE System SHALL ensure every comment has a valid postId and authorId
6. THE System SHALL ensure every comment with parentId has a valid parent that exists
7. THE System SHALL ensure every share has a valid postId and userId
8. THE System SHALL ensure createdAt is less than or equal to updatedAt for all posts and comments

### Requirement 8: Authentication and Authorization

**User Story:** As a system administrator, I want proper authentication and authorization, so that users can only perform actions they are permitted to do.

#### Acceptance Criteria

1. WHEN a user attempts any post operation THEN THE System SHALL verify the user is authenticated
2. WHEN a user attempts any like operation THEN THE System SHALL verify the user is authenticated
3. WHEN a user attempts any comment operation THEN THE System SHALL verify the user is authenticated
4. WHEN a user attempts any share operation THEN THE System SHALL verify the user is authenticated
5. WHEN a user attempts to update a post THEN THE System SHALL verify the user is the post author
6. WHEN a user attempts to delete a post THEN THE System SHALL verify the user is the post author
7. WHEN a user attempts to update a comment THEN THE System SHALL verify the user is the comment author
8. WHEN a user attempts to delete a comment THEN THE System SHALL verify the user is the comment author

### Requirement 9: Performance and Scalability

**User Story:** As a user, I want the system to respond quickly, so that I have a smooth experience browsing and interacting with posts.

#### Acceptance Criteria

1. WHEN posts are queried THEN THE System SHALL use database indexes on authorId for efficient filtering
2. WHEN posts are queried THEN THE System SHALL use database indexes on createdAt for efficient sorting
3. WHEN likes are queried THEN THE System SHALL use composite index on postId and userId
4. WHEN comments are queried THEN THE System SHALL use database indexes on postId and parentId
5. WHEN posts are retrieved THEN THE System SHALL use select to fetch only required fields
6. WHEN posts are retrieved with relations THEN THE System SHALL use include to avoid N+1 queries

### Requirement 10: Error Handling

**User Story:** As a user, I want clear error messages when something goes wrong, so that I understand what happened and how to fix it.

#### Acceptance Criteria

1. WHEN validation fails THEN THE System SHALL return 400 Bad Request with descriptive error message
2. WHEN authentication fails THEN THE System SHALL return 401 Unauthorized
3. WHEN authorization fails THEN THE System SHALL return 403 Forbidden with descriptive error message
4. WHEN a resource is not found THEN THE System SHALL return 404 Not Found with descriptive error message
5. WHEN database connection fails THEN THE System SHALL return 503 Service Unavailable
6. WHEN an unexpected error occurs THEN THE System SHALL return 500 Internal Server Error and log the error
7. WHEN image upload fails THEN THE System SHALL return appropriate error with reason

### Requirement 11: Security

**User Story:** As a system administrator, I want the system to be secure against common attacks, so that user data and the system remain protected.

#### Acceptance Criteria

1. WHEN user content is stored THEN THE System SHALL sanitize HTML tags to prevent XSS attacks
2. WHEN user content is stored THEN THE System SHALL escape special characters
3. WHEN images are uploaded THEN THE System SHALL validate file type is image/jpeg, image/png, or image/gif
4. WHEN images are uploaded THEN THE System SHALL validate file size does not exceed 5MB
5. THE System SHALL use Prisma parameterized queries to prevent SQL injection
6. WHEN API requests are made THEN THE System SHALL enforce rate limiting per user
7. WHEN state-changing operations are performed THEN THE System SHALL validate CSRF tokens
8. WHEN user data is returned THEN THE System SHALL exclude sensitive fields like passwords

### Requirement 12: Image Upload

**User Story:** As a user, I want to upload images with my posts, so that I can share visual content with the community.

#### Acceptance Criteria

1. WHEN a user uploads an image THEN THE System SHALL validate the file type is an allowed image format
2. WHEN a user uploads an image THEN THE System SHALL validate the file size is within limits
3. WHEN an image is uploaded THEN THE System SHALL generate a unique filename to prevent conflicts
4. WHEN an image is uploaded THEN THE System SHALL store it in a secure location
5. WHEN an image upload fails THEN THE System SHALL return an error and allow retry
6. WHEN a post with images is deleted THEN THE System SHALL clean up the associated image files
