import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET room by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const room = await prisma.room.findUnique({
      where: { id: params.id },
      include: {
        building: true,
        tenant: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error("Get room error:", error);
    return NextResponse.json(
      { error: "Failed to fetch room" },
      { status: 500 }
    );
  }
}

// PUT update room
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { landlordId, roomNumber, floor, price, deposit, area, description, status } = body;

    // Verify room belongs to landlord
    const room = await prisma.room.findFirst({
      where: {
        id: params.id,
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

    const updatedRoom = await prisma.room.update({
      where: { id: params.id },
      data: {
        roomNumber,
        floor,
        price,
        deposit,
        area,
        description,
        status,
      },
      include: {
        building: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error("Update room error:", error);
    return NextResponse.json(
      { error: "Failed to update room" },
      { status: 500 }
    );
  }
}

// DELETE room
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { searchParams } = new URL(request.url);
    const landlordId = searchParams.get("landlordId");

    if (!landlordId) {
      return NextResponse.json(
        { error: "Landlord ID is required" },
        { status: 400 }
      );
    }

    // Verify room belongs to landlord
    const room = await prisma.room.findFirst({
      where: {
        id: params.id,
        building: {
          landlordId,
        },
      },
      include: {
        contracts: {
          where: {
            status: "ACTIVE",
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json(
        { error: "Room not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check if room has active contracts
    if (room.contracts.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete room with active contracts" },
        { status: 400 }
      );
    }

    await prisma.room.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Delete room error:", error);
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 }
    );
  }
}
