import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all contracts for a landlord or tenant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const landlordId = searchParams.get("landlordId");
    const tenantId = searchParams.get("tenantId");
    const status = searchParams.get("status");

    if (!landlordId && !tenantId) {
      return NextResponse.json(
        { error: "Landlord ID or Tenant ID is required" },
        { status: 400 }
      );
    }

    const where: any = {};

    if (landlordId) {
      where.room = {
        building: {
          landlordId,
        },
      };
    }

    if (tenantId) {
      where.tenantId = tenantId;
    }

    if (status) {
      where.status = status;
    }

    const contracts = await prisma.contract.findMany({
      where,
      include: {
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(contracts);
  } catch (error) {
    console.error("Get contracts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch contracts" },
      { status: 500 }
    );
  }
}

// POST create new contract
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { landlordId, tenantId, roomId, startDate, endDate, rentAmount, depositAmount, terms } = body;

    if (!landlordId || !tenantId || !roomId || !startDate || !endDate || !rentAmount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    // Verify tenant belongs to landlord
    const tenant = await prisma.tenant.findFirst({
      where: {
        id: tenantId,
        landlordId,
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant not found or unauthorized" },
        { status: 404 }
      );
    }

    // Verify room belongs to landlord
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

    const contract = await prisma.contract.create({
      data: {
        tenantId,
        roomId,
        startDate: start,
        endDate: end,
        rentAmount,
        depositAmount: depositAmount || 0,
        terms,
        status: "ACTIVE",
      },
      include: {
        tenant: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
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

    return NextResponse.json(contract, { status: 201 });
  } catch (error) {
    console.error("Create contract error:", error);
    return NextResponse.json(
      { error: "Failed to create contract" },
      { status: 500 }
    );
  }
}
