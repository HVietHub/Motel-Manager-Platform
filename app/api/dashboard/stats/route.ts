import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const landlordId = searchParams.get("landlordId");

    if (!landlordId) {
      return NextResponse.json(
        { error: "Landlord ID is required" },
        { status: 400 }
      );
    }

    // Get total buildings
    const totalBuildings = await prisma.building.count({
      where: { landlordId },
    });

    // Get room statistics
    const rooms = await prisma.room.findMany({
      where: {
        building: {
          landlordId,
        },
      },
      select: {
        status: true,
      },
    });

    const totalRooms = rooms.length;
    const availableRooms = rooms.filter((r) => r.status === "AVAILABLE").length;
    const occupiedRooms = rooms.filter((r) => r.status === "OCCUPIED").length;

    // Get total tenants
    const totalTenants = await prisma.tenant.count({
      where: { landlordId },
    });

    // Get current month/year
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Get monthly revenue (sum of all invoices for current month)
    const monthlyInvoices = await prisma.invoice.findMany({
      where: {
        tenant: {
          landlordId,
        },
        month: currentMonth,
        year: currentYear,
      },
      select: {
        totalAmount: true,
        status: true,
      },
    });

    const monthlyRevenue = monthlyInvoices.reduce(
      (sum, invoice) => sum + invoice.totalAmount,
      0
    );

    // Get unpaid invoices count and total debt
    const unpaidInvoices = monthlyInvoices.filter((i) => i.status === "UNPAID");
    const totalDebt = unpaidInvoices.reduce(
      (sum, invoice) => sum + invoice.totalAmount,
      0
    );

    return NextResponse.json({
      totalBuildings,
      totalRooms,
      availableRooms,
      occupiedRooms,
      totalTenants,
      monthlyRevenue,
      unpaidInvoices: unpaidInvoices.length,
      totalDebt,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
