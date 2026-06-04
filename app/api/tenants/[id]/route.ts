import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET tenant by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    console.log("Fetching tenant with ID:", params.id);
    
    const tenant = await prisma.tenant.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        room: {
          include: {
            building: {
              select: {
                name: true,
                address: true,
              },
            },
          },
        },
      },
    });

    console.log("Tenant found:", tenant ? "Yes" : "No");
    if (tenant) {
      console.log("Tenant details:", {
        id: tenant.id,
        name: tenant.user.name,
        hasRoom: !!tenant.room
      });
    }

    if (!tenant) {
      console.log("Tenant not found with ID:", params.id);
      return NextResponse.json(
        { 
          error: "Người thuê không tồn tại",
          details: `Không tìm thấy người thuê với ID: ${params.id}. Vui lòng đăng nhập lại.`
        },
        { status: 404 }
      );
    }

    return NextResponse.json(tenant);
  } catch (error) {
    console.error("Get tenant error:", error);
    return NextResponse.json(
      { 
        error: "Lỗi khi tải thông tin người thuê", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

// PUT update tenant
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { landlordId, name, phone, idCard, address } = body;

    // Get tenant first
    const tenant = await prisma.tenant.findUnique({
      where: { id: params.id },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant not found" },
        { status: 404 }
      );
    }

    // If landlordId is provided, verify tenant belongs to landlord
    if (landlordId && tenant.landlordId !== landlordId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Update tenant and user
    const updatedTenant = await prisma.tenant.update({
      where: { id: params.id },
      data: {
        phone,
        ...(idCard !== undefined && { idCard }),
        ...(address !== undefined && { address }),
        user: {
          update: {
            name,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
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
    console.error("Update tenant error:", error);
    return NextResponse.json(
      { error: "Failed to update tenant" },
      { status: 500 }
    );
  }
}
