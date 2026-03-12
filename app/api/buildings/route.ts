import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all buildings for a landlord
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

    const buildings = await prisma.building.findMany({
      where: { landlordId },
      include: {
        rooms: {
          select: {
            id: true,
            status: true,
          },
        },
        _count: {
          select: {
            rooms: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate available rooms for each building
    const buildingsWithStats = buildings.map((building) => ({
      id: building.id,
      name: building.name,
      address: building.address,
      description: building.description,
      totalRooms: building._count.rooms,
      availableRooms: building.rooms.filter((r) => r.status === "AVAILABLE")
        .length,
      createdAt: building.createdAt,
    }));

    return NextResponse.json(buildingsWithStats);
  } catch (error) {
    console.error("Get buildings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch buildings" },
      { status: 500 }
    );
  }
}

// POST create new building
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { landlordId, name, address, description, electricityPrice, waterPrice } = body;

    if (!landlordId || !name || !address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate electricityPrice and waterPrice
    const finalElectricityPrice = electricityPrice !== undefined ? electricityPrice : 3000;
    const finalWaterPrice = waterPrice !== undefined ? waterPrice : 50000;

    if (finalElectricityPrice < 0) {
      return NextResponse.json(
        { error: "Giá điện phải >= 0" },
        { status: 400 }
      );
    }

    if (finalWaterPrice < 0) {
      return NextResponse.json(
        { error: "Giá nước phải >= 0" },
        { status: 400 }
      );
    }

    // Warning for high prices (not blocking)
    const warnings = [];
    if (finalElectricityPrice > 10000) {
      warnings.push("Giá điện quá cao (>10000 VNĐ/kWh)");
    }
    if (finalWaterPrice > 200000) {
      warnings.push("Giá nước quá cao (>200000 VNĐ/tháng)");
    }

    const building = await prisma.building.create({
      data: {
        landlordId,
        name,
        address,
        description,
        electricityPrice: finalElectricityPrice,
        waterPrice: finalWaterPrice,
      },
    });

    return NextResponse.json({ 
      building, 
      warnings: warnings.length > 0 ? warnings : undefined 
    }, { status: 201 });
  } catch (error) {
    console.error("Create building error:", error);
    return NextResponse.json(
      { error: "Failed to create building" },
      { status: 500 }
    );
  }
}
