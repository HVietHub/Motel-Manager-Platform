import { NextRequest, NextResponse } from 'next/server';
import { registerLandlord } from '@/lib/services/auth/auth.service';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { validatePassword } from '@/lib/validation/password-validation';

/**
 * Registration API Route
 * 
 * Handles user registration for landlords only.
 * 
 * Requirements: 1.1, 1.2
 */

const registerSchema = z.object({
  fullName: z.string().min(1, 'Họ và tên là bắt buộc'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại phải có 10-11 chữ số'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  role: z.literal('LANDLORD').optional().default('LANDLORD'),
  idCard: z.string().optional(),
  address: z.string().optional(),
  otp: z.string().optional(), // Added for future OTP validation
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = registerSchema.safeParse(body);
    
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }
    
    const { fullName, email, phone, password, address } = validationResult.data;
    
    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] },
        { status: 400 }
      );
    }
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email đã được sử dụng' },
        { status: 409 }
      );
    }

    // Verify OTP
    if (!body.otp) {
      return NextResponse.json(
        { error: 'Vui lòng nhập mã xác thực' },
        { status: 400 }
      );
    }

    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        email,
        token: body.otp,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Mã xác thực không chính xác hoặc đã hết hạn' },
        { status: 400 }
      );
    }

    // Only landlords can self-register. Tenant accounts are created by landlords.
    const registeredUser = await registerLandlord({
      email,
      password,
      name: fullName,
      phone,
      address,
    });


    // Cleanup: Delete used verification token
    prisma.verificationToken.deleteMany({
      where: { email }
    }).catch((err: unknown) => {
      console.error('Failed to cleanup verification tokens for', email, err);
    });

    return NextResponse.json(
      {
        message: 'Đăng ký thành công',
        user: {
          id: registeredUser.id,
          email: registeredUser.email,
          name: registeredUser.name,
          role: registeredUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Registration error:', error);
    
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
