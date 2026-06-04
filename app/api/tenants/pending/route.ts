import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Pending Invitations API
 * 
 * Get list of tenants with pending invitations for a landlord
 */

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

    const pendingTenants = await prisma.tenant.findMany({
      where: {
        landlordId,
        invitationStatus: "pending",
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
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(pendingTenants);
  } catch (error) {
    console.error("Get pending invitations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending invitations" },
      { status: 500 }
    );
  }
}
