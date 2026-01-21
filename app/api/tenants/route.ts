import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET all tenants for a landlord
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const landlordId = searchParams.get("landlordId");

    if (!landlordId) {
      return NextResponse.json(
        { error: "Landlord ID is required" },
        { status: 400 }
      );
    }

    const tenants = await prisma.tenant.findMany({
      where: {
        landlordId,
        invitationStatus: "accepted", // Only show accepted tenants
        NOT: {
          landlordId: "",
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        room: {
          include: {
            building: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tenants);
  } catch (error) {
    console.error("Get tenants error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tenants" },
      { status: 500 }
    );
  }
}

// POST create new tenant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { landlordId, name, email, phone, idCard, address } = body;

    if (!landlordId || !name || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Generate random password
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create user and tenant
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "TENANT",
        tenant: {
          create: {
            landlordId,
            phone,
            idCard,
            address,
          },
        },
      },
      include: {
        tenant: true,
      },
    });

    return NextResponse.json({
      tenant: user.tenant,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      temporaryPassword: randomPassword,
    }, { status: 201 });
  } catch (error) {
    console.error("Create tenant error:", error);
    return NextResponse.json(
      { error: "Failed to create tenant" },
      { status: 500 }
    );
  }
}
