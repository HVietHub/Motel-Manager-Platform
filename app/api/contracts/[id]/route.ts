import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET contract by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
      include: {
        tenant: {
          include: {
            user: true,
          },
        },
        room: {
          include: {
            building: true,
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(contract);
  } catch (error) {
    console.error("Get contract error:", error);
    return NextResponse.json(
      { error: "Failed to fetch contract" },
      { status: 500 }
    );
  }
}

// PUT update contract
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { landlordId, startDate, endDate, rentAmount, depositAmount, terms, status } = body;

    // Verify contract belongs to landlord
    const contract = await prisma.contract.findFirst({
      where: {
        id: params.id,
        room: {
          building: {
            landlordId,
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found or unauthorized" },
        { status: 404 }
      );
    }

    const updatedContract = await prisma.contract.update({
      where: { id: params.id },
      data: {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        rentAmount,
        depositAmount,
        terms,
        status,
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

    return NextResponse.json(updatedContract);
  } catch (error) {
    console.error("Update contract error:", error);
    return NextResponse.json(
      { error: "Failed to update contract" },
      { status: 500 }
    );
  }
}
