import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST terminate contract
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { landlordId } = body;

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
      include: {
        room: true,
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found or unauthorized" },
        { status: 404 }
      );
    }

    if (contract.status === "TERMINATED") {
      return NextResponse.json(
        { error: "Contract is already terminated" },
        { status: 400 }
      );
    }

    // Terminate contract and release room
    await prisma.$transaction([
      prisma.contract.update({
        where: { id: params.id },
        data: { status: "TERMINATED" },
      }),
      prisma.room.update({
        where: { id: contract.roomId },
        data: { status: "AVAILABLE" },
      }),
      prisma.tenant.update({
        where: { id: contract.tenantId },
        data: { roomId: null },
      }),
    ]);

    const updatedContract = await prisma.contract.findUnique({
      where: { id: params.id },
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
    console.error("Terminate contract error:", error);
    return NextResponse.json(
      { error: "Failed to terminate contract" },
      { status: 500 }
    );
  }
}
