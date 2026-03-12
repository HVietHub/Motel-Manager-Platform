'use client'

import { useState, useEffect } from 'react'
import { CommentItem } from './comment-item'
import { CommentForm } from './comment-form'
import { Loader2 } from 'lucide-react'

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
  replies: Comment[]
}

interface CommentListProps {
  postId: string
  currentUserId?: string
}

export function CommentList({ postId, currentUserId }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`)
      if (!response.ok) throw new Error('Failed to fetch comments')
      
      const data = await response.json()
      setComments(data)
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCommentAdded = () => {
    fetchComments()
  }

  const handleCommentDeleted = (commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId))
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <CommentForm
        postId={postId}
        onSuccess={handleCommentAdded}
      />

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Chưa có bình luận nào
          </p>
        ) : (
          comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              currentUserId={currentUserId}
              onDelete={handleCommentDeleted}
              onReply={handleCommentAdded}
            />
          ))
        )}
      </div>
    </div>
  )
}
