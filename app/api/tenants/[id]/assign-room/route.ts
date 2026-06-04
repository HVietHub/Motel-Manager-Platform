import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST assign tenant to room
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { landlordId, roomId } = body;

    if (!roomId) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      );
    }

    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: params.id },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant not found" },
        { status: 404 }
      );
    }

    // If tenant is self-registered or belongs to this landlord, allow assignment
    if (tenant.landlordId !== landlordId && tenant.landlordId !== "self-registered") {
      return NextResponse.json(
        { error: "Tenant belongs to another landlord" },
        { status: 403 }
      );
    }

    // Verify room belongs to landlord and is available
    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        building: {
          landlordId,
        },
      },
    });

    if (!room) {
      return NextResponse.json(
        { error: "Room not found or unauthorized" },
        { status: 404 }
      );
    }

    if (room.status !== "AVAILABLE") {
      return NextResponse.json(
        { error: "Room is not available" },
        { status: 400 }
      );
    }

    // Update tenant with room, landlordId (if self-registered), and update room status
    await prisma.$transaction([
      prisma.tenant.update({
        where: { id: params.id },
        data: { 
          roomId,
          landlordId, // Update landlordId for self-registered tenants
        },
      }),
      prisma.room.update({
        where: { id: roomId },
        data: { status: "OCCUPIED" },
      }),
    ]);

    const updatedTenant = await prisma.tenant.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
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
    });

    return NextResponse.json(updatedTenant);
  } catch (error) {
    console.error("Assign room error:", error);
    return NextResponse.json(
      { error: "Failed to assign room" },
      { status: 500 }
    );
  }
}
