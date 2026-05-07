import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string; surchargeId: string }> };

// PUT update surcharge (name, amount, isActive)
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: buildingId, surchargeId } = await params;
    const body = await request.json();
    const { name, amount, isActive } = body;

    // Verify ownership
    const surcharge = await prisma.buildingSurcharge.findUnique({
      where: { id: surchargeId },
      include: { building: { select: { landlordId: true } } },
    });
    if (!surcharge || surcharge.buildingId !== buildingId) {
      return NextResponse.json({ error: "Không tìm thấy phụ thu" }, { status: 404 });
    }
    if (surcharge.building.landlordId !== session.user.landlordId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (name !== undefined && !name.trim()) {
      return NextResponse.json({ error: "Tên phụ thu không được để trống" }, { status: 400 });
    }
    if (amount !== undefined && amount < 0) {
      return NextResponse.json({ error: "Số tiền phải >= 0" }, { status: 400 });
    }

    const updated = await prisma.buildingSurcharge.update({
      where: { id: surchargeId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(amount !== undefined && { amount }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update surcharge error:", error);
    return NextResponse.json({ error: "Failed to update surcharge" }, { status: 500 });
  }
}

// DELETE surcharge
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: buildingId, surchargeId } = await params;

    const surcharge = await prisma.buildingSurcharge.findUnique({
      where: { id: surchargeId },
      include: { building: { select: { landlordId: true } } },
    });
    if (!surcharge || surcharge.buildingId !== buildingId) {
      return NextResponse.json({ error: "Không tìm thấy phụ thu" }, { status: 404 });
    }
    if (surcharge.building.landlordId !== session.user.landlordId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.buildingSurcharge.delete({ where: { id: surchargeId } });

    return NextResponse.json({ message: "Đã xóa phụ thu" });
  } catch (error) {
    console.error("Delete surcharge error:", error);
    return NextResponse.json({ error: "Failed to delete surcharge" }, { status: 500 });
  }
}
