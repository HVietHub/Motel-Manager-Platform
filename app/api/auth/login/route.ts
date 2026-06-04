import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log("Login attempt for:", email);

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ thông tin" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        landlord: true,
        tenant: true,
      },
    });

    if (!user) {
      console.log("User not found:", email);
      return NextResponse.json(
        { error: "Email hoặc mật khẩu không đúng" },
        { status: 401 }
      );
    }

    console.log("User found:", user.email, "Role:", user.role);

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      console.log("Invalid password for:", email);
      return NextResponse.json(
        { error: "Email hoặc mật khẩu không đúng" },
        { status: 401 }
      );
    }

    console.log("Login successful for:", email);

    // Return user data (in production, use JWT or session)
    const response: any = {
      message: "Đăng nhập thành công",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };

    if (user.landlord) {
      response.landlordId = user.landlord.id;
    }

    if (user.tenant) {
      response.tenantId = user.tenant.id;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi đăng nhập" },
      { status: 500 }
    );
  }
}
