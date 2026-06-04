import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET single building
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const building = await prisma.building.findUnique({
      where: { id },
      include: {
        rooms: true,
      },
    });

    if (!building) {
      return NextResponse.json(
        { error: "Building not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(building);
  } catch (error) {
    console.error("Get building error:", error);
    return NextResponse.json(
      { error: "Failed to fetch building" },
      { status: 500 }
    );
  }
}

// PUT update building
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { name, address, description, electricityPrice, waterPrice } = body;

    // Validate electricityPrice and waterPrice if provided
    if (electricityPrice !== undefined && electricityPrice < 0) {
      return NextResponse.json(
        { error: "Giá điện phải >= 0" },
        { status: 400 }
      );
    }

    if (waterPrice !== undefined && waterPrice < 0) {
      return NextResponse.json(
        { error: "Giá nước phải >= 0" },
        { status: 400 }
      );
    }

    // Warning for high prices (not blocking)
    const warnings = [];
    if (electricityPrice !== undefined && electricityPrice > 10000) {
      warnings.push("Giá điện quá cao (>10000 VNĐ/kWh)");
    }
    if (waterPrice !== undefined && waterPrice > 200000) {
      warnings.push("Giá nước quá cao (>200000 VNĐ/tháng)");
    }

    const building = await prisma.building.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(address !== undefined && { address }),
        ...(description !== undefined && { description }),
        ...(electricityPrice !== undefined && { electricityPrice }),
        ...(waterPrice !== undefined && { waterPrice }),
      },
    });

    return NextResponse.json({
      building,
      warnings: warnings.length > 0 ? warnings : undefined,
    });
  } catch (error) {
    console.error("Update building error:", error);
    return NextResponse.json(
      { error: "Failed to update building" },
      { status: 500 }
    );
  }
}

// DELETE building
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.building.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Building deleted successfully" });
  } catch (error) {
    console.error("Delete building error:", error);
    return NextResponse.json(
      { error: "Failed to delete building" },
      { status: 500 }
    );
  }
}
