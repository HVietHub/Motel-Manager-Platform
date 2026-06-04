import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Invite Tenant API Route
 * 
 * Allows landlords to invite existing tenant users to their property management.
 * Tenants must have already registered with a TENANT account.
 */

// POST invite existing tenant by userCode with room assignment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { landlordId, userCode, roomId } = body;

    if (!landlordId || !userCode || !roomId) {
      return NextResponse.json(
        { error: "Landlord ID, user code, and room ID are required" },
        { status: 400 }
      );
    }

    // Find tenant by userCode
    const tenant = await prisma.tenant.findUnique({
      where: { userCode },
      include: { 
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: "Không tìm thấy người thuê với mã này" },
        { status: 404 }
      );
    }

    if (tenant.user.role !== "TENANT") {
      return NextResponse.json(
        { error: "Người dùng này không phải là người thuê" },
        { status: 400 }
      );
    }

    // Check if tenant is already assigned to a landlord
    if (tenant.landlordId && tenant.landlordId !== '') {
      return NextResponse.json(
        { error: "Người thuê này đã được mời bởi chủ nhà khác" },
        { status: 400 }
      );
    }

    // Check if room exists and is available
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { building: true },
    });

    if (!room) {
      return NextResponse.json(
        { error: "Không tìm thấy phòng" },
        { status: 404 }
      );
    }

    if (room.building.landlordId !== landlordId) {
      return NextResponse.json(
        { error: "Phòng này không thuộc về bạn" },
        { status: 403 }
      );
    }

    if (room.status !== "AVAILABLE") {
      return NextResponse.json(
        { error: "Phòng này không còn trống" },
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

    // Update tenant with pending invitation and room
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: { 
        landlordId,
        invitationStatus: "pending",
        pendingRoomId: roomId,
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

    // Create notification for tenant
    await prisma.notification.create({
      data: {
        tenantId: updatedTenant.id,
        title: "Lời mời từ chủ nhà",
        message: `Chủ nhà ${landlord?.user.name || "N/A"} đã mời bạn thuê phòng ${room.roomNumber} tại ${room.building.name}. Giá thuê: ${room.price.toLocaleString('vi-VN')} VNĐ/tháng. Vui lòng chấp nhận hoặc từ chối lời mời này.`,
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
