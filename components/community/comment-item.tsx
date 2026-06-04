'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Reply, Trash2, Pencil, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ReplyForm } from './reply-form'
import { Textarea } from '@/components/ui/textarea'

interface Comment {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
    email: string
  }
  replies?: Comment[]
}

interface CommentItemProps {
  comment: Comment
  postId: string
  currentUserId?: string
  depth?: number
  onDelete?: (commentId: string) => void
  onReply?: () => void
}

export function CommentItem({ 
  comment, 
  postId, 
  currentUserId, 
  depth = 0,
  onDelete,
  onReply 
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isAuthor = currentUserId === comment.author.id
  const canReply = depth < 3

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete comment')

      onDelete?.(comment.id)
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('Không thể xóa bình luận')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!editContent.trim()) {
      setError('Nội dung không được để trống')
      return
    }

    if (editContent.length > 1000) {
      setError('Nội dung không được vượt quá 1000 ký tự')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent.trim() }),
      })

      if (!response.ok) throw new Error('Failed to update comment')

      setIsEditing(false)
      window.location.reload()
    } catch (err) {
      setError('Không thể cập nhật bình luận')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 pl-4' : ''}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {comment.author.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-sm">{comment.author.name}</p>
              {isAuthor && !isEditing && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-600"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[60px]"
                  disabled={loading}
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleUpdate}
                    disabled={loading}
                  >
                    {loading ? 'Đang lưu...' : 'Lưu'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(false)
                      setEditContent(comment.content)
                      setError('')
                    }}
                    disabled={loading}
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
                locale: vi,
              })}
            </span>

            {canReply && !isEditing && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Trả lời
              </Button>
            )}
          </div>

          {showReplyForm && (
            <div className="mt-2">
              <ReplyForm
                postId={postId}
                parentId={comment.id}
                onSuccess={() => {
                  setShowReplyForm(false)
                  onReply?.()
                }}
                onCancel={() => setShowReplyForm(false)}
              />
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="space-y-4 mt-4">
              {comment.replies.map(reply => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  currentUserId={currentUserId}
                  depth={depth + 1}
                  onDelete={onDelete}
                  onReply={onReply}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
