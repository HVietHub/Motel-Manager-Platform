import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all invoices for a landlord or tenant
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

    const invoices = await prisma.invoice.findMany({
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
      orderBy: [
        { year: "desc" },
        { month: "desc" },
      ],
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Get invoices error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

// POST create new invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      landlordId,
      tenantId,
      month,
      year,
      rentAmount,
      electricityAmount,
      waterAmount,
      serviceAmount,
      otherAmount,
      description,
      dueDate,
    } = body;

    if (!landlordId || !tenantId || !month || !year || !rentAmount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate month and year
    if (month < 1 || month > 12) {
      return NextResponse.json(
        { error: "Invalid month" },
        { status: 400 }
      );
    }

    if (year < 2000 || year > 2100) {
      return NextResponse.json(
        { error: "Invalid year" },
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

    // Check for duplicate invoice
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        tenantId,
        month,
        year,
      },
    });

    if (existingInvoice) {
      return NextResponse.json(
        { error: "Invoice already exists for this month and year" },
        { status: 400 }
      );
    }

    // Calculate total
    const totalAmount =
      rentAmount +
      (electricityAmount || 0) +
      (waterAmount || 0) +
      (serviceAmount || 0) +
      (otherAmount || 0);

    const invoice = await prisma.invoice.create({
      data: {
        tenantId,
        month,
        year,
        rentAmount,
        electricityAmount: electricityAmount || 0,
        waterAmount: waterAmount || 0,
        serviceAmount: serviceAmount || 0,
        otherAmount: otherAmount || 0,
        totalAmount,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status: "UNPAID",
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

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("Create invoice error:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
