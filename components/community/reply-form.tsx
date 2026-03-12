'use client'

import { CommentForm } from './comment-form'

interface ReplyFormProps {
  postId: string
  parentId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function ReplyForm({ postId, parentId, onSuccess, onCancel }: ReplyFormProps) {
  return (
    <CommentForm
      postId={postId}
      parentId={parentId}
      onSuccess={onSuccess}
      onCancel={onCancel}
      placeholder="Viết câu trả lời..."
    />
  )
}
