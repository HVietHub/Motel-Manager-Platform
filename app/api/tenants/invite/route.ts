import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Invite Tenant API Route
 * 
 * Allows landlords to invite existing tenant users to their property management.
 * Tenants must have already registered with a TENANT account.
 */

// POST invite existing tenant by email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { landlordId, email } = body;

    if (!landlordId || !email) {
      return NextResponse.json(
        { error: "Landlord ID and email are required" },
        { status: 400 }
      );
    }

    // Find user with TENANT role by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Không tìm thấy người dùng với email này" },
        { status: 404 }
      );
    }

    if (user.role !== "TENANT") {
      return NextResponse.json(
        { error: "Người dùng này không phải là người thuê" },
        { status: 400 }
      );
    }

    if (!user.tenant) {
      return NextResponse.json(
        { error: "Không tìm thấy thông tin người thuê" },
        { status: 404 }
      );
    }

    // Check if tenant is already assigned to this landlord
    if (user.tenant.landlordId && user.tenant.landlordId !== '') {
      return NextResponse.json(
        { error: "Người thuê này đã được mời bởi chủ nhà khác" },
        { status: 400 }
      );
    }

    // Get landlord info for notification
    const landlord = await prisma.landlord.findUnique({
      where: { id: landlordId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    // Update tenant with pending invitation
    const updatedTenant = await prisma.tenant.update({
      where: { id: user.tenant.id },
      data: { 
        landlordId,
        invitationStatus: "pending"
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create notification for tenant with action buttons
    await prisma.notification.create({
      data: {
        tenantId: updatedTenant.id,
        title: "Lời mời từ chủ nhà",
        message: `Chủ nhà ${landlord?.user.name || "N/A"} đã gửi lời mời cho bạn tham gia hệ thống quản lý. Vui lòng chấp nhận hoặc từ chối lời mời này.`,
        isRead: false,
      },
    });

    return NextResponse.json({
      message: "Đã gửi lời mời cho người thuê",
      tenant: updatedTenant,
    }, { status: 200 });
  } catch (error) {
    console.error("Invite tenant error:", error);
    return NextResponse.json(
      { error: "Failed to invite tenant" },
      { status: 500 }
    );
  }
}
