import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/services/communication/mail.service';
import { z } from 'zod';

const requestSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  role: z.enum(['LANDLORD', 'TENANT']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = requestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, role } = validationResult.data;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, role: true, isValid: true },
    });

    if (!user || user.role !== role || !user.isValid) {
      return NextResponse.json(
        { error: role === 'LANDLORD' ? 'Không tìm thấy tài khoản chủ nhà với email này' : 'Không tìm thấy tài khoản người thuê với email này' },
        { status: 404 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const hashedToken = await bcrypt.hash(otp, 10);

    await prisma.verificationToken.create({
      data: {
        email: normalizedEmail,
        token: `reset:${hashedToken}`,
        expiresAt,
      },
    });

    await prisma.verificationToken.deleteMany({
      where: {
        email: normalizedEmail,
        OR: [
          { expiresAt: { lt: new Date() } },
          { token: { not: `reset:${hashedToken}` } },
        ],
      },
    });

    const emailResult = await sendPasswordResetEmail(normalizedEmail, otp);

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Không thể gửi email. Vui lòng thử lại sau.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Mã xác nhận đặt lại mật khẩu đã được gửi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password request error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi gửi mã. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
