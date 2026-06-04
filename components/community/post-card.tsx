'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Heart, MessageCircle, Share2, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { LikeButton } from './like-button'
import { ShareButton } from './share-button'

interface PostCardProps {
  post: {
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
  currentUserId?: string
  onEdit?: (postId: string) => void
  onDelete?: (postId: string) => void
}

export function PostCard({ post, currentUserId, onEdit, onDelete }: PostCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const isAuthor = currentUserId === post.author.id

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Failed to delete post')
      
      onDelete?.(post.id)
      router.refresh()
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Không thể xóa bài viết. Vui lòng thử lại.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('[role="menuitem"]')
    ) {
      return
    }
    router.push(`/community/${post.id}`)
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleCardClick}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="flex items-start space-x-3">
          <Avatar>
            <AvatarFallback>
              {post.author.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold">{post.author.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                post.authorType === 'LANDLORD' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {post.authorType === 'LANDLORD' ? 'Chủ nhà' : 'Người thuê'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), { 
                addSuffix: true,
                locale: vi 
              })}
            </p>
          </div>
        </div>
        
        {isAuthor && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(post.id)}>
                <Pencil className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? 'Đang xóa...' : 'Xóa'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="whitespace-pre-wrap">{post.content}</p>
        
        {post.images && post.images.length > 0 && (
          <div className={`grid gap-2 ${
            post.images.length === 1 ? 'grid-cols-1' :
            post.images.length === 2 ? 'grid-cols-2' :
            'grid-cols-2 md:grid-cols-3'
          }`}>
            {post.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Post image ${index + 1}`}
                className="rounded-lg object-cover w-full h-48"
              />
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-4">
          <LikeButton
            postId={post.id}
            initialLiked={post.isLikedByCurrentUser || false}
            initialCount={post.likeCount}
          />
          
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/community/${post.id}#comments`)
            }}
          >
            <MessageCircle className="h-4 w-4" />
            <span>{post.commentCount}</span>
          </Button>
          
          <ShareButton
            postId={post.id}
            initialCount={post.shareCount}
          />
        </div>
      </CardFooter>
    </Card>
  )
}
