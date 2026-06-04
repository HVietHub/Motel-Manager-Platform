import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST mark invoice as paid
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { landlordId } = body;

    // Verify invoice belongs to landlord
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        tenant: {
          landlordId,
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found or unauthorized" },
        { status: 404 }
      );
    }

    if (invoice.status === "PAID") {
      return NextResponse.json(
        { error: "Invoice is already paid" },
        { status: 400 }
      );
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        status: "PAID",
        paidDate: new Date(),
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

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error("Mark invoice paid error:", error);
    return NextResponse.json(
      { error: "Failed to mark invoice as paid" },
      { status: 500 }
    );
  }
}
