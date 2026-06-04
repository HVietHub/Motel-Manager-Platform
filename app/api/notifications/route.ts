import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json(
        { error: "Tenant ID is required" },
        { status: 400 }
      );
    }

    const notifications = await prisma.notification.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST create notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { landlordId, tenantId, title, message } = body;

    if (!landlordId || !tenantId || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    const notification = await prisma.notification.create({
      data: {
        tenantId,
        title,
        message,
        isRead: false,
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("Create notification error:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
