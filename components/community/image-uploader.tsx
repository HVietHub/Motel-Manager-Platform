'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Image, X, Upload, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
  maxSizeMB?: number
  disabled?: boolean
  className?: string
  buttonOnly?: boolean
  compact?: boolean
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif']
const DEFAULT_MAX_IMAGES = 10
const DEFAULT_MAX_SIZE_MB = 5

export function ImageUploader({
  images,
  onChange,
  maxImages = DEFAULT_MAX_IMAGES,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  disabled = false,
  className,
  buttonOnly = false,
  compact = false,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `File ${file.name} không đúng định dạng. Chỉ chấp nhận JPG, PNG, GIF.`
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `File ${file.name} vượt quá ${maxSizeMB}MB.`
    }

    return null
  }

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          reject(new Error('Failed to convert file to base64'))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      
      reader.readAsDataURL(file)
    })
  }

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (files.length === 0) return

    // Check if adding these files would exceed max images
    if (images.length + files.length > maxImages) {
      setError(`Tối đa ${maxImages} hình ảnh. Bạn chỉ có thể thêm ${maxImages - images.length} ảnh nữa.`)
      return
    }

    setError('')
    setUploading(true)

    try {
      const newImages: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileId = `${file.name}-${Date.now()}-${i}`

        // Validate file
        const validationError = validateFile(file)
        if (validationError) {
          setError(validationError)
          continue
        }

        // Simulate upload progress
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))

        // Convert to base64
        try {
          // Simulate progress updates
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
              const current = prev[fileId] || 0
              if (current >= 90) {
                clearInterval(progressInterval)
                return prev
              }
              return { ...prev, [fileId]: current + 10 }
            })
          }, 100)

          const base64 = await convertToBase64(file)
          
          clearInterval(progressInterval)
          setUploadProgress(prev => ({ ...prev, [fileId]: 100 }))
          
          newImages.push(base64)

          // Clean up progress after a short delay
          setTimeout(() => {
            setUploadProgress(prev => {
              const updated = { ...prev }
              delete updated[fileId]
              return updated
            })
          }, 500)
        } catch (err) {
          setError(`Không thể tải lên ${file.name}`)
          console.error('Upload error:', err)
        }
      }

      if (newImages.length > 0) {
        onChange([...images, ...newImages])
      }
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
    setError('')
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const hasProgress = Object.keys(uploadProgress).length > 0

  // Button only mode - just show the upload button
  if (buttonOnly) {
    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading || images.length >= maxImages}
        />
        
        <button
          type="button"
          onClick={handleButtonClick}
          className="h-9 w-9 p-0 hover:opacity-80 transition-opacity disabled:opacity-50"
          disabled={disabled || uploading || images.length >= maxImages}
        >
          <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
          </svg>
        </button>
      </>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Compact mode - smaller preview */}
      {compact && images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-md overflow-hidden border bg-muted"
            >
              <img
                src={image}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleRemoveImage(index)}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full mode - original UI */}
      {!compact && (
        <>
          {/* Upload Button */}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_TYPES.join(',')}
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={disabled || uploading || images.length >= maxImages}
            />
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleButtonClick}
              disabled={disabled || uploading || images.length >= maxImages}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tải...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Chọn ảnh ({images.length}/{maxImages})
                </>
              )}
            </Button>

            <span className="text-xs text-muted-foreground">
              JPG, PNG, GIF - Tối đa {maxSizeMB}MB
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {/* Upload Progress */}
          {hasProgress && (
            <div className="space-y-2">
              {Object.entries(uploadProgress).map(([fileId, progress]) => (
                <div key={fileId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Đang tải lên...</span>
                    <span className="text-muted-foreground">{progress}%</span>
                  </div>
                  <div className="h-1 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Image Preview Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative group aspect-square rounded-lg overflow-hidden border bg-muted"
                >
                  <img
                    src={image}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Remove Button */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleRemoveImage(index)}
                      disabled={disabled}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Image Number Badge */}
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {images.length === 0 && !uploading && (
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={handleButtonClick}
            >
              <Image className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-1">
                Nhấp để chọn ảnh hoặc kéo thả vào đây
              </p>
              <p className="text-xs text-muted-foreground">
                Tối đa {maxImages} ảnh, mỗi ảnh không quá {maxSizeMB}MB
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
