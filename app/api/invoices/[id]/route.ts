import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET invoice by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        tenant: {
          include: {
            user: true,
            room: {
              include: {
                building: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Get invoice error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

// PUT update invoice
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const {
      landlordId,
      rentAmount,
      electricityAmount,
      waterAmount,
      serviceAmount,
      otherAmount,
      description,
      dueDate,
    } = body;

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

    // Calculate new total
    const totalAmount =
      (rentAmount || invoice.rentAmount) +
      (electricityAmount !== undefined ? electricityAmount : invoice.electricityAmount) +
      (waterAmount !== undefined ? waterAmount : invoice.waterAmount) +
      (serviceAmount !== undefined ? serviceAmount : invoice.serviceAmount) +
      (otherAmount !== undefined ? otherAmount : invoice.otherAmount);

    const updatedInvoice = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        rentAmount,
        electricityAmount,
        waterAmount,
        serviceAmount,
        otherAmount,
        totalAmount,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
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
    console.error("Update invoice error:", error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}
