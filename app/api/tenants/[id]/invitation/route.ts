import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Tenant Invitation Response API
 * 
 * Allows tenants to accept or reject landlord invitations
 */

// POST accept or reject invitation
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { action } = body; // "accept" or "reject"

    if (!action || !["accept", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'accept' or 'reject'" },
        { status: 400 }
      );
    }

    // Get tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant not found" },
        { status: 404 }
      );
    }

    if (tenant.invitationStatus !== "pending") {
      return NextResponse.json(
        { error: "No pending invitation" },
        { status: 400 }
      );
    }

    if (action === "accept") {
      // Accept invitation - assign room automatically
      if (!tenant.pendingRoomId) {
        return NextResponse.json(
          { error: "Không tìm thấy thông tin phòng trong lời mời" },
          { status: 400 }
        );
      }

      // Check if room is still available
      const room = await prisma.room.findUnique({
        where: { id: tenant.pendingRoomId },
      });

      if (!room || room.status !== "AVAILABLE") {
        return NextResponse.json(
          { error: "Phòng này không còn trống" },
          { status: 400 }
        );
      }

      // Update tenant and room in transaction
      await prisma.$transaction([
        prisma.tenant.update({
          where: { id: params.id },
          data: {
            invitationStatus: "accepted",
            roomId: tenant.pendingRoomId,
            pendingRoomId: null,
          },
        }),
        prisma.room.update({
          where: { id: tenant.pendingRoomId },
          data: { status: "OCCUPIED" },
        }),
      ]);

      return NextResponse.json({
        message: "Đã chấp nhận lời mời và được gán phòng",
        status: "accepted",
      });
    } else {
      // Reject invitation - reset landlordId, status, and pendingRoomId
      await prisma.tenant.update({
        where: { id: params.id },
        data: {
          landlordId: "",
          invitationStatus: "rejected",
          pendingRoomId: null,
        },
      });

      return NextResponse.json({
        message: "Đã từ chối lời mời",
        status: "rejected",
      });
    }
  } catch (error) {
    console.error("Invitation response error:", error);
    return NextResponse.json(
      { error: "Failed to process invitation response" },
      { status: 500 }
    );
  }
}
