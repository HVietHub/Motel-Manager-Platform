'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Share2, Link2, Facebook, Twitter, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'

interface ShareButtonProps {
  postId: string
  initialCount: number
}

export function ShareButton({ postId, initialCount }: ShareButtonProps) {
  const [count, setCount] = useState(initialCount)
  const [open, setOpen] = useState(false)

  const handleShare = async (platform?: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sharedWith: platform }),
      })

      if (!response.ok) throw new Error('Failed to share')

      setCount(count + 1)
      toast.success('Đã chia sẻ bài viết')
    } catch (error) {
      console.error('Error sharing:', error)
      toast.error('Không thể chia sẻ bài viết')
    }
  }

  const copyLink = async () => {
    const url = `${window.location.origin}/community/${postId}`
    try {
      await navigator.clipboard.writeText(url)
      await handleShare('link')
      toast.success('Đã sao chép liên kết')
      setOpen(false)
    } catch (error) {
      toast.error('Không thể sao chép liên kết')
    }
  }

  const shareToFacebook = () => {
    const url = `${window.location.origin}/community/${postId}`
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
    handleShare('facebook')
    setOpen(false)
  }

  const shareToTwitter = () => {
    const url = `${window.location.origin}/community/${postId}`
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`, '_blank')
    handleShare('twitter')
    setOpen(false)
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
      >
        <Share2 className="h-4 w-4" />
        <span>{count}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chia sẻ bài viết</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-2">
            <Button
              variant="outline"
              className="justify-start gap-3"
              onClick={copyLink}
            >
              <Link2 className="h-5 w-5" />
              Sao chép liên kết
            </Button>

            <Button
              variant="outline"
              className="justify-start gap-3"
              onClick={shareToFacebook}
            >
              <Facebook className="h-5 w-5" />
              Chia sẻ lên Facebook
            </Button>

            <Button
              variant="outline"
              className="justify-start gap-3"
              onClick={shareToTwitter}
            >
              <Twitter className="h-5 w-5" />
              Chia sẻ lên Twitter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
