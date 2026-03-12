'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface LikeButtonProps {
  postId: string
  initialLiked: boolean
  initialCount: number
}

export function LikeButton({ postId, initialLiked, initialCount }: LikeButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Optimistic UI state
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click event
    
    // Optimistic update
    const previousLiked = liked
    const previousCount = count
    
    setLiked(!liked)
    setCount(liked ? count - 1 : count + 1)

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to toggle like')
      }

      const data = await response.json()
      
      // Update with server response
      setLiked(data.liked)
      
      // Refresh to get accurate count from server
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      console.error('Error toggling like:', error)
      
      // Rollback optimistic update on error
      setLiked(previousLiked)
      setCount(previousCount)
      
      alert('Không thể thực hiện thao tác. Vui lòng thử lại.')
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`gap-2 ${liked ? 'text-red-500' : ''}`}
      onClick={handleLike}
      disabled={isPending}
      aria-label={liked ? 'Bỏ thích' : 'Thích bài viết'}
    >
      <Heart 
        className={`h-4 w-4 ${liked ? 'fill-current' : ''}`}
        aria-hidden="true"
      />
      <span>{count}</span>
    </Button>
  )
}
