/**
 * API Error Handler Utility
 * 
 * Provides centralized error handling for API routes
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6
 */

import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

// Custom error classes
export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class ServiceUnavailableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ServiceUnavailableError'
  }
}

/**
 * Handle API errors and return appropriate NextResponse
 * 
 * @param error - The error to handle
 * @param context - Optional context for logging
 * @returns NextResponse with appropriate status code and error message
 */
export function handleApiError(error: unknown, context?: string): NextResponse {
  // Log error for debugging
  if (context) {
    console.error(`${context}:`, error)
  } else {
    console.error('API Error:', error)
  }

  // Handle custom error types
  if (error instanceof ValidationError) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  if (error instanceof UnauthorizedError) {
    return NextResponse.json(
      { error: error.message },
      { status: 403 }
    )
  }

  if (error instanceof NotFoundError) {
    return NextResponse.json(
      { error: error.message },
      { status: 404 }
    )
  }

  if (error instanceof ServiceUnavailableError) {
    return NextResponse.json(
      { error: error.message },
      { status: 503 }
    )
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Database connection errors
    if (error.code === 'P1001' || error.code === 'P1002' || error.code === 'P1008') {
      return NextResponse.json(
        { error: 'Hệ thống đang bảo trì. Vui lòng thử lại sau.' },
        { status: 503 }
      )
    }

    // Unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Dữ liệu đã tồn tại' },
        { status: 400 }
      )
    }

    // Foreign key constraint violation
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Dữ liệu liên quan không tồn tại' },
        { status: 400 }
      )
    }

    // Record not found
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Dữ liệu không tồn tại hoặc đã bị xóa' },
        { status: 404 }
      )
    }
  }

  // Handle Prisma initialization errors
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return NextResponse.json(
      { error: 'Hệ thống đang bảo trì. Vui lòng thử lại sau.' },
      { status: 503 }
    )
  }

  // Handle Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      { error: 'Dữ liệu không hợp lệ' },
      { status: 400 }
    )
  }

  // Handle generic errors with specific messages
  if (error instanceof Error) {
    // Check for specific error messages
    if (error.message === 'Post not found') {
      return NextResponse.json(
        { error: 'Bài viết không tồn tại hoặc đã bị xóa' },
        { status: 404 }
      )
    }

    if (error.message === 'Comment not found') {
      return NextResponse.json(
        { error: 'Bình luận không tồn tại hoặc đã bị xóa' },
        { status: 404 }
      )
    }

    if (error.message === 'Parent comment not found') {
      return NextResponse.json(
        { error: 'Bình luận cha không tồn tại' },
        { status: 404 }
      )
    }

    // Check for validation error messages
    if (
      error.message.includes('không được để trống') ||
      error.message.includes('không được vượt quá') ||
      error.message.includes('giới hạn độ sâu') ||
      error.message.includes('does not belong to this post')
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Check for authorization error messages
    if (error.message.includes('không có quyền')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }
  }

  // Default to 500 Internal Server Error
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}

/**
 * Check if user is authenticated
 * Returns 401 response if not authenticated
 */
export function requireAuth(userId: string | undefined): NextResponse | null {
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  return null
}
