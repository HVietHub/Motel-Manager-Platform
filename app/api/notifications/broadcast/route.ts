import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST broadcast notification to all tenants
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { landlordId, title, message } = body;

    if (!landlordId || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get all tenants for this landlord
    const tenants = await prisma.tenant.findMany({
      where: { landlordId },
      select: { id: true },
    });

    if (tenants.length === 0) {
      return NextResponse.json(
        { error: "No tenants found" },
        { status: 404 }
      );
    }

    // Create notifications for all tenants
    const notifications = await prisma.notification.createMany({
      data: tenants.map((tenant) => ({
        tenantId: tenant.id,
        title,
        message,
        isRead: false,
      })),
    });

    return NextResponse.json({
      message: `Broadcast sent to ${notifications.count} tenants`,
      count: notifications.count,
    }, { status: 201 });
  } catch (error) {
    console.error("Broadcast notification error:", error);
    return NextResponse.json(
      { error: "Failed to broadcast notification" },
      { status: 500 }
    );
  }
}
