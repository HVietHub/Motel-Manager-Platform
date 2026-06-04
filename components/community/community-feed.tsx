'use client'

import { useState } from 'react'
import { CreatePostForm } from './create-post-form'
import { PostList } from './post-list'
import { EditPostForm } from './edit-post-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'

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

interface CommunityFeedProps {
  initialPosts: Post[]
  currentUserId: string
  userName: string
}

export function CommunityFeed({ initialPosts, currentUserId, userName }: CommunityFeedProps) {
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [filters, setFilters] = useState<{
    authorType?: 'LANDLORD' | 'TENANT'
    search?: string
  }>({})
  const [searchInput, setSearchInput] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters(prev => ({ ...prev, search: searchInput }))
  }

  return (
    <div className="container max-w-3xl mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Cộng đồng</h1>
        
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Tìm kiếm..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-48 h-9"
            />
            <Button type="submit" size="icon" className="h-9 w-9">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <Select
            value={filters.authorType || 'all'}
            onValueChange={(value) =>
              setFilters(prev => ({
                ...prev,
                authorType: value === 'all' ? undefined : value as 'LANDLORD' | 'TENANT',
              }))
            }
          >
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Lọc theo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="LANDLORD">Chủ nhà</SelectItem>
              <SelectItem value="TENANT">Người thuê</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <CreatePostForm userName={userName} />

      <PostList
        initialPosts={initialPosts}
        currentUserId={currentUserId}
        filters={filters}
        onEdit={setEditingPostId}
      />

      {editingPostId && (
        <EditPostForm
          postId={editingPostId}
          open={!!editingPostId}
          onOpenChange={(open) => !open && setEditingPostId(null)}
        />
      )}
    </div>
  )
}
