'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { ImageUploader } from './image-uploader'

interface EditPostFormProps {
  postId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditPostForm({ postId, open, onOpenChange }: EditPostFormProps) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open && postId) {
      fetchPost()
    }
  }, [open, postId])

  const fetchPost = async () => {
    setFetching(true)
    try {
      const response = await fetch(`/api/posts/${postId}`)
      if (!response.ok) throw new Error('Failed to fetch post')
      
      const post = await response.json()
      setContent(post.content)
      setImages(post.images || [])
    } catch (err) {
      setError('Không thể tải bài viết')
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!content.trim()) {
      setError('Nội dung không được để trống')
      return
    }

    if (content.length > 5000) {
      setError('Nội dung không được vượt quá 5000 ký tự')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          images: images.length > 0 ? images : undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update post')
      }

      onOpenChange(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa bài viết</DialogTitle>
        </DialogHeader>

        {fetching ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Textarea
                placeholder="Nội dung bài viết"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[150px] resize-none"
                disabled={loading}
              />

              <ImageUploader
                images={images}
                onChange={setImages}
                disabled={loading}
              />

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <div className="text-sm text-muted-foreground">
                {content.length}/5000 ký tự
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="submit" disabled={loading || !content.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  'Lưu thay đổi'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
