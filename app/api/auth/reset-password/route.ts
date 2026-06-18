import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const resetSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  role: z.enum(['LANDLORD', 'TENANT']),
  otp: z.string().regex(/^\d{6}$/, 'Mã xác nhận phải gồm 6 chữ số'),
  newPassword: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = resetSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, role, otp, newPassword } = validationResult.data;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, role: true, isValid: true },
    });

    if (!user || user.role !== role || !user.isValid) {
      return NextResponse.json(
        { error: 'Thông tin tài khoản không hợp lệ' },
        { status: 404 }
      );
    }

    const tokens = await prisma.verificationToken.findMany({
      where: {
        email: normalizedEmail,
        token: { startsWith: 'reset:' },
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    let matchedTokenId: string | null = null;

    for (const tokenRecord of tokens) {
      const isMatch = await bcrypt.compare(otp, tokenRecord.token.replace('reset:', ''));

      if (isMatch) {
        matchedTokenId = tokenRecord.id;
        break;
      }
    }

    if (!matchedTokenId) {
      return NextResponse.json(
        { error: 'Mã xác nhận không đúng hoặc đã hết hạn' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      prisma.verificationToken.deleteMany({
        where: {
          email: normalizedEmail,
          token: { startsWith: 'reset:' },
        },
      }),
    ]);

    return NextResponse.json(
      { message: 'Đặt lại mật khẩu thành công' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi đặt lại mật khẩu. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
