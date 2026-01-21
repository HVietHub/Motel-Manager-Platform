import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET maintenance requests for landlord or tenant
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
      where.tenant = {
        landlordId,
      };
    }

    if (tenantId) {
      where.tenantId = tenantId;
    }

    if (status) {
      where.status = status;
    }

    const requests = await prisma.maintenanceRequest.findMany({
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Get maintenance requests error:", error);
    return NextResponse.json(
      { error: "Failed to fetch maintenance requests" },
      { status: 500 }
    );
  }
}

// POST create maintenance request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, roomId, title, description, priority } = body;

    if (!tenantId || !roomId || !title || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const maintenanceRequest = await prisma.maintenanceRequest.create({
      data: {
        tenantId,
        roomId,
        title,
        description,
        priority: priority || "MEDIUM",
        status: "PENDING",
      },
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

    return NextResponse.json(maintenanceRequest, { status: 201 });
  } catch (error) {
    console.error("Create maintenance request error:", error);
    return NextResponse.json(
      { error: "Failed to create maintenance request" },
      { status: 500 }
    );
  }
}
