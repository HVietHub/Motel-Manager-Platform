import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// GET all surcharges for a building
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: buildingId } = await params;

    const surcharges = await prisma.buildingSurcharge.findMany({
      where: { buildingId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(surcharges);
  } catch (error) {
    console.error("Get surcharges error:", error);
    return NextResponse.json({ error: "Failed to fetch surcharges" }, { status: 500 });
  }
}

// POST create a new surcharge
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: buildingId } = await params;
    const body = await request.json();
    const { name, amount } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Tên phụ thu không được để trống" }, { status: 400 });
    }
    if (amount === undefined || amount < 0) {
      return NextResponse.json({ error: "Số tiền phải >= 0" }, { status: 400 });
    }

    // Verify building belongs to this landlord
    const building = await prisma.building.findUnique({
      where: { id: buildingId },
      select: { landlordId: true },
    });
    if (!building) {
      return NextResponse.json({ error: "Tòa nhà không tồn tại" }, { status: 404 });
    }
    if (building.landlordId !== session.user.landlordId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const surcharge = await prisma.buildingSurcharge.create({
      data: { buildingId, name: name.trim(), amount, isActive: true },
    });

    return NextResponse.json(surcharge, { status: 201 });
  } catch (error) {
    console.error("Create surcharge error:", error);
    return NextResponse.json({ error: "Failed to create surcharge" }, { status: 500 });
  }
}
