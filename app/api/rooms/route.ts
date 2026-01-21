import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all rooms for a landlord
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const landlordId = searchParams.get("landlordId");
    const buildingId = searchParams.get("buildingId");
    const status = searchParams.get("status");

    if (!landlordId) {
      return NextResponse.json(
        { error: "Landlord ID is required" },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = {
      building: {
        landlordId,
      },
    };

    if (buildingId) {
      where.buildingId = buildingId;
    }

    if (status) {
      where.status = status;
    }

    const rooms = await prisma.room.findMany({
      where,
      include: {
        building: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        tenant: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { roomNumber: "asc" },
    });

    return NextResponse.json(rooms);
  } catch (error) {
    console.error("Get rooms error:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

// POST create new room
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { landlordId, buildingId, roomNumber, floor, price, deposit, area, description } = body;

    if (!landlordId || !buildingId || !roomNumber || !price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify building belongs to landlord
    const building = await prisma.building.findFirst({
      where: {
        id: buildingId,
        landlordId,
      },
    });

    if (!building) {
      return NextResponse.json(
        { error: "Building not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check if room number already exists in building
    const existingRoom = await prisma.room.findFirst({
      where: {
        buildingId,
        roomNumber,
      },
    });

    if (existingRoom) {
      return NextResponse.json(
        { error: "Room number already exists in this building" },
        { status: 400 }
      );
    }

    const room = await prisma.room.create({
      data: {
        buildingId,
        roomNumber,
        floor: floor || 1,
        price,
        deposit: deposit || 0,
        area: area || 0,
        description,
        status: "AVAILABLE",
      },
      include: {
        building: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error("Create room error:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}
