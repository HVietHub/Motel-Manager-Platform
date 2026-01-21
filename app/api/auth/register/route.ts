import { NextRequest, NextResponse } from 'next/server';
import { registerLandlord } from '@/lib/services/auth.service';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

/**
 * Registration API Route
 * 
 * Handles user registration for landlords.
 * Currently only supports LANDLORD role registration.
 * TENANT accounts are created by landlords through the tenant management interface.
 * 
 * Requirements: 1.1, 1.2
 */

const registerSchema = z.object({
  fullName: z.string().min(1, 'Họ và tên là bắt buộc'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại phải có 10-11 chữ số'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  role: z.enum(['LANDLORD', 'TENANT']),
  idCard: z.string().optional(),
  address: z.string().optional(),
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
    
    const { fullName, email, phone, password, role, idCard, address } = validationResult.data;
    
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user based on role
    if (role === 'LANDLORD') {
      const user = await registerLandlord({
        email,
        password,
        name: fullName,
        phone,
        address,
      });
      
      return NextResponse.json(
        {
          message: 'Đăng ký thành công',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        },
        { status: 201 }
      );
    } else {
      // Create TENANT user without landlordId (will be assigned when landlord invites them)
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: fullName,
          role: 'TENANT',
          tenant: {
            create: {
              phone,
              idCard: idCard || '',
              address: address || null,
              landlordId: '', // Empty until landlord invites them
            },
          },
        },
        include: {
          tenant: true,
        },
      });

      return NextResponse.json(
        {
          message: 'Đăng ký thành công',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
