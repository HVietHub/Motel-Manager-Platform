'use client'

import { useState, useEffect } from 'react'
import { PostCard } from './post-card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface Post {
  id: string
  content: string
  images?: string[]
  createdAt: string
  author: {
    id: string
    name: string
    email: string
  }
  authorType: 'LANDLORD' | 'TENANT'
  likeCount: number
  commentCount: number
  shareCount: number
  isLikedByCurrentUser?: boolean
}

interface PostListProps {
  initialPosts?: Post[]
  currentUserId?: string
  filters?: {
    authorType?: 'LANDLORD' | 'TENANT'
    search?: string
  }
  onEdit?: (postId: string) => void
}

export function PostList({ initialPosts = [], currentUserId, filters, onEdit }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const loadPosts = async (pageNum: number, reset = false) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10',
        ...(filters?.authorType && { authorType: filters.authorType }),
        ...(filters?.search && { search: filters.search }),
      })

      const response = await fetch(`/api/posts?${params}`)
      if (!response.ok) throw new Error('Failed to fetch posts')

      const newPosts = await response.json()
      
      if (reset) {
        setPosts(newPosts)
      } else {
        setPosts(prev => [...prev, ...newPosts])
      }
      
      setHasMore(newPosts.length === 10)
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (filters) {
      setPage(1)
      loadPosts(1, true)
    }
  }, [filters?.authorType, filters?.search])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    loadPosts(nextPage)
  }

  const handleDelete = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  if (posts.length === 0 && !loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Chưa có bài viết nào</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          onEdit={onEdit}
          onDelete={handleDelete}
        />
      ))}

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleLoadMore}
            disabled={loading}
            variant="outline"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tải...
              </>
            ) : (
              'Xem thêm'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
