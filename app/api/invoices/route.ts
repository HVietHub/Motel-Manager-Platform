import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invoiceAutoCalculationService } from "@/lib/services/billing/invoice-auto-calculation.service";

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

// POST create new invoice with auto-calculation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      landlordId,
      tenantId,
      month,
      year,
      electricityUsage,
      waterUsage,
      serviceAmount,
      otherAmount,
      description,
      dueDate,
    } = body;

    if (!landlordId || !tenantId || !month || !year || electricityUsage === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (electricityUsage < 0) {
      return NextResponse.json(
        { error: "Số điện không hợp lệ" },
        { status: 400 }
      );
    }

    if (waterUsage !== undefined && waterUsage < 0) {
      return NextResponse.json(
        { error: "Số nước không hợp lệ" },
        { status: 400 }
      );
    }

    const warnings = [];
    if (electricityUsage > 1000) {
      warnings.push("Số điện tiêu thụ cao (>1000 kWh)");
    }

    if (month < 1 || month > 12) {
      return NextResponse.json(
        { error: "Tháng phải từ 1 đến 12" },
        { status: 400 }
      );
    }

    if (year < 2020 || year > 2100) {
      return NextResponse.json(
        { error: "Năm phải từ 2020 đến 2100" },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenant.findFirst({
      where: {
        id: tenantId,
        landlordId,
      },
      include: {
        room: {
          include: {
            building: true,
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant not found or unauthorized" },
        { status: 404 }
      );
    }

    if (!tenant.room || tenant.room.building.landlordId !== landlordId) {
      return NextResponse.json(
        { error: "Unauthorized: Landlord does not own this building" },
        { status: 403 }
      );
    }

    if (tenant.room.building.waterBillingType === "METERED" && waterUsage === undefined) {
      return NextResponse.json(
        { error: "Vui lòng nhập số khối nước" },
        { status: 400 }
      );
    }

    const invoice = await invoiceAutoCalculationService.createInvoiceWithAutoCalculation({
      tenantId,
      month,
      year,
      electricityUsage,
      waterUsage,
      serviceAmount,
      otherAmount,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });


    return NextResponse.json({
      invoice,
      warnings: warnings.length > 0 ? warnings : undefined,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Create invoice error:", error);
    
    // Handle specific error messages
    if (error.message === "Người thuê chưa được gán phòng") {
      return NextResponse.json(
        { error: "Người thuê chưa được gán phòng" },
        { status: 400 }
      );
    }
    
    if (error.message === "Hóa đơn đã tồn tại cho tháng này") {
      return NextResponse.json(
        { error: "Hóa đơn đã tồn tại cho tháng này" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create invoice" },
      { status: 500 }
    );
  }
}
