'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { ImageUploader } from './image-uploader'

interface CreatePostFormProps {
  userName: string
  onSuccess?: () => void
}

export function CreatePostForm({ userName, onSuccess }: CreatePostFormProps) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          images: images.length > 0 ? images : undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create post')
      }

      setContent('')
      setImages([])
      setIsDialogOpen(false)
      onSuccess?.()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card className="shadow-sm">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarFallback className="bg-muted">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div 
              className="flex-1 bg-muted/50 rounded-full px-4 py-2 cursor-pointer hover:bg-muted/70 transition-colors"
              onClick={() => setIsDialogOpen(true)}
            >
              <span className="text-sm text-muted-foreground">
                {userName} ơi, bạn đang nghĩ gì thế?
              </span>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                className="h-9 w-9 p-0 hover:opacity-80 transition-opacity"
                onClick={() => setIsDialogOpen(true)}
              >
                <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo bài viết</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-muted">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{userName}</p>
                <p className="text-xs text-muted-foreground">Chỉ mình tôi</p>
              </div>
            </div>

            <Textarea
              placeholder={`${userName} ơi, bạn đang nghĩ gì thế?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px] text-base border-none focus-visible:ring-0 resize-none"
              disabled={loading}
              autoFocus
            />

            {images.length > 0 && (
              <ImageUploader
                images={images}
                onChange={setImages}
                disabled={loading}
              />
            )}

            <div className="border rounded-lg p-3">
              <p className="text-sm font-medium mb-2">Thêm vào bài viết của bạn</p>
              <div className="flex items-center gap-2">
                <ImageUploader
                  images={images}
                  onChange={setImages}
                  disabled={loading}
                  buttonOnly
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <Button 
              type="submit" 
              disabled={loading || !content.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang đăng...
                </>
              ) : (
                'Đăng'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
