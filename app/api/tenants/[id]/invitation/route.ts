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
      // Accept invitation
      await prisma.tenant.update({
        where: { id: params.id },
        data: {
          invitationStatus: "accepted",
        },
      });

      return NextResponse.json({
        message: "Đã chấp nhận lời mời",
        status: "accepted",
      });
    } else {
      // Reject invitation - reset landlordId and status
      await prisma.tenant.update({
        where: { id: params.id },
        data: {
          landlordId: "",
          invitationStatus: "rejected",
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
