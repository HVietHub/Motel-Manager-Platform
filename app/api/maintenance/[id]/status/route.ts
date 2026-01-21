import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT update maintenance request status
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { landlordId, status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Verify maintenance request belongs to landlord
    const maintenanceRequest = await prisma.maintenanceRequest.findFirst({
      where: {
        id: params.id,
        tenant: {
          landlordId,
        },
      },
    });

    if (!maintenanceRequest) {
      return NextResponse.json(
        { error: "Maintenance request not found or unauthorized" },
        { status: 404 }
      );
    }

    const updatedRequest = await prisma.maintenanceRequest.update({
      where: { id: params.id },
      data: { status },
      include: {
        tenant: {
          include: {
            user: {
              select: {
                name: true,
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
        },
      },
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Update maintenance status error:", error);
    return NextResponse.json(
      { error: "Failed to update maintenance status" },
      { status: 500 }
    );
  }
}
