import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/services/communication/mail.service';
import { z } from 'zod';

const sendOtpSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = sendOtpSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email đã được sử dụng' },
        { status: 409 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Store OTP in database
    await prisma.verificationToken.upsert({
      where: {
        email_token: {
          email,
          token: otp,
        },
      },
      update: {
        expiresAt,
      },
      create: {
        email,
        token: otp,
        expiresAt,
      },
    });

    // Delete old tokens for this email to keep DB clean (optional but good)
    await prisma.verificationToken.deleteMany({
      where: {
        email,
        token: { not: otp },
      },
    });

    // Send email
    const emailResult = await sendVerificationEmail(email, otp);

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Không thể gửi email. Vui lòng thử lại sau.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Mã xác thực đã được gửi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi gửi mã. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
