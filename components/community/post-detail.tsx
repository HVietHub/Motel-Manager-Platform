'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft, MoreVertical, Pencil, Trash2 } from 'lucide-react'
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
import { CommentList } from './comment-list'
import { EditPostForm } from './edit-post-form'

interface PostDetailProps {
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
  currentUserId: string
}

export function PostDetail({ post, currentUserId }: PostDetailProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
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
      
      router.push('/community')
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Không thể xóa bài viết. Vui lòng thử lại.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="container max-w-3xl mx-auto py-6 space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại
      </Button>

      <Card>
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
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
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
          <p className="whitespace-pre-wrap text-lg">{post.content}</p>
          
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
                  className="rounded-lg object-cover w-full h-64"
                />
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center gap-4 border-t pt-4">
          <LikeButton
            postId={post.id}
            initialLiked={post.isLikedByCurrentUser || false}
            initialCount={post.likeCount}
          />
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>{post.commentCount} bình luận</span>
          </div>
          
          <ShareButton
            postId={post.id}
            initialCount={post.shareCount}
          />
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Bình luận</h2>
        </CardHeader>
        <CardContent>
          <CommentList postId={post.id} currentUserId={currentUserId} />
        </CardContent>
      </Card>

      {isEditing && (
        <EditPostForm
          postId={post.id}
          open={isEditing}
          onOpenChange={setIsEditing}
        />
      )}
    </div>
  )
}
