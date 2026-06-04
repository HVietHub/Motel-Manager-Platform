import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS, PlanTier } from "@/lib/constants/plans";

const dayMs = 24 * 60 * 60 * 1000;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function growthRate(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function getPlanPrice(plan: string) {
  return PLAN_LIMITS[(plan as PlanTier) in PLAN_LIMITS ? (plan as PlanTier) : PlanTier.FREE].priceVnd;
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden. Only admins can access platform analytics." }, { status: 403 });
  }

  const now = new Date();
  const today = startOfDay(now);
  const thirtyDaysAgo = new Date(today.getTime() - 29 * dayMs);
  const previousThirtyDaysAgo = new Date(today.getTime() - 59 * dayMs);
  const sevenDaysAgo = new Date(today.getTime() - 6 * dayMs);

  const [
    users,
    landlords,
    tenants,
    buildingsCount,
    rooms,
    contracts,
    invoices,
    posts,
    comments,
    likes,
    shares,
    maintenanceRequests,
    notifications,
  ] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isValid: true,
        createdAt: true,
        landlord: { select: { id: true, userCode: true, phone: true, plan: true, buildings: { select: { id: true } } } },
        tenant: { select: { id: true, userCode: true, phone: true, landlordId: true, roomId: true, contracts: { select: { id: true, status: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.landlord.findMany({ select: { id: true, plan: true, createdAt: true, buildings: { select: { id: true, rooms: { select: { id: true } } } } } }),
    prisma.tenant.findMany({ select: { id: true, createdAt: true, roomId: true, contracts: { select: { id: true, status: true } } } }),
    prisma.building.count(),
    prisma.room.findMany({ select: { id: true, status: true, createdAt: true, updatedAt: true, price: true } }),
    prisma.contract.findMany({ select: { id: true, status: true, createdAt: true, updatedAt: true } }),
    prisma.invoice.findMany({ select: { id: true, status: true, totalAmount: true, month: true, year: true, createdAt: true, updatedAt: true, paidDate: true } }),
    prisma.post.findMany({ select: { id: true, authorId: true, authorType: true, createdAt: true } }),
    prisma.comment.findMany({ select: { id: true, authorId: true, createdAt: true } }),
    prisma.like.findMany({ select: { id: true, userId: true, createdAt: true } }),
    prisma.share.findMany({ select: { id: true, userId: true, sharedWith: true, createdAt: true } }),
    prisma.maintenanceRequest.findMany({ select: { id: true, status: true, priority: true, title: true, createdAt: true, updatedAt: true } }),
    prisma.notification.findMany({ select: { id: true, title: true, isRead: true, createdAt: true } }),
  ]);

  const totalUsers = users.length;
  const totalLandlords = users.filter((user) => user.role === "LANDLORD").length;
  const totalTenants = users.filter((user) => user.role === "TENANT").length;
  const totalAdmins = users.filter((user) => user.role === "ADMIN").length;
  const activeUsers = users.filter((user) => user.isValid).length;
  const newUsers30d = users.filter((user) => user.createdAt >= thirtyDaysAgo).length;
  const previousUsers30d = users.filter((user) => user.createdAt >= previousThirtyDaysAgo && user.createdAt < thirtyDaysAgo).length;
  const newUsers7d = users.filter((user) => user.createdAt >= sevenDaysAgo).length;

  const userGrowth = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(thirtyDaysAgo.getTime() + index * dayMs);
    const nextDate = new Date(date.getTime() + dayMs);
    const total = users.filter((user) => user.createdAt < nextDate).length;
    const signups = users.filter((user) => user.createdAt >= date && user.createdAt < nextDate).length;

    return {
      date: formatDate(date),
      total,
      signups,
    };
  });

  const revenueTrend = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 11 + index, 1);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const monthInvoices = invoices.filter((invoice) => invoice.month === month && invoice.year === year);

    return {
      period: `${month}/${year}`,
      revenue: landlords
        .filter((landlord) => landlord.createdAt <= new Date(year, month, 0, 23, 59, 59))
        .reduce((total, landlord) => total + getPlanPrice(landlord.plan), 0),
      billed: monthInvoices.reduce((total, invoice) => total + invoice.totalAmount, 0),
    };
  });

  const paidInvoices = invoices.filter((invoice) => invoice.status === "PAID");
  const unpaidInvoices = invoices.filter((invoice) => invoice.status !== "PAID");
  const planRevenue = landlords.reduce((total, landlord) => total + getPlanPrice(landlord.plan), 0);
  const paidPlanLandlords = landlords.filter((landlord) => getPlanPrice(landlord.plan) > 0);
  const freePlanLandlords = landlords.filter((landlord) => getPlanPrice(landlord.plan) === 0);
  const roomInvoiceVolume = invoices.reduce((total, invoice) => total + invoice.totalAmount, 0);
  const unpaidRoomInvoiceVolume = unpaidInvoices.reduce((total, invoice) => total + invoice.totalAmount, 0);
  const occupiedRooms = rooms.filter((room) => room.status === "OCCUPIED").length;
  const pendingMaintenance = maintenanceRequests.filter((request) => request.status === "PENDING").length;
  const landlordsWithBuilding = landlords.filter((landlord) => landlord.buildings.length > 0).length;
  const landlordsWithRooms = landlords.filter((landlord) => landlord.buildings.some((building) => building.rooms.length > 0)).length;
  const tenantsWithRoom = tenants.filter((tenant) => tenant.roomId).length;
  const tenantsWithActiveContract = tenants.filter((tenant) => tenant.contracts.some((contract) => contract.status === "ACTIVE")).length;
  const activeUserIds = new Set<string>();

  posts.filter((item) => item.createdAt >= thirtyDaysAgo).forEach((item) => activeUserIds.add(item.authorId));
  comments.filter((item) => item.createdAt >= thirtyDaysAgo).forEach((item) => activeUserIds.add(item.authorId));
  likes.filter((item) => item.createdAt >= thirtyDaysAgo).forEach((item) => activeUserIds.add(item.userId));
  shares.filter((item) => item.createdAt >= thirtyDaysAgo).forEach((item) => activeUserIds.add(item.userId));

  const featureUsage = [
    { feature: "Hóa đơn", count: invoices.length },
    { feature: "Hợp đồng", count: contracts.length },
    { feature: "Phòng trọ", count: rooms.length },
    { feature: "Bài cộng đồng", count: posts.length },
    { feature: "Bảo trì", count: maintenanceRequests.length },
    { feature: "Thông báo", count: notifications.length },
  ];

  const recentEvents = [
    ...users.map((user) => ({ id: `user-${user.id}`, type: "Đăng ký", actor: user.name, entity: user.role, description: `${user.name} đăng ký tài khoản ${user.role}`, createdAt: user.createdAt })),
    ...invoices.map((invoice) => ({ id: `invoice-${invoice.id}`, type: "Hóa đơn", actor: "Hệ thống", entity: invoice.status, description: `Hóa đơn ${invoice.month}/${invoice.year} ${invoice.status.toLowerCase()} ${invoice.totalAmount.toLocaleString("vi-VN")} đ`, createdAt: invoice.paidDate || invoice.createdAt })),
    ...contracts.map((contract) => ({ id: `contract-${contract.id}`, type: "Hợp đồng", actor: "Hệ thống", entity: contract.status, description: `Hợp đồng được ghi nhận với trạng thái ${contract.status}`, createdAt: contract.createdAt })),
    ...posts.map((post) => ({ id: `post-${post.id}`, type: "Cộng đồng", actor: post.authorType, entity: "Bài viết", description: "Bài viết cộng đồng mới", createdAt: post.createdAt })),
    ...comments.map((comment) => ({ id: `comment-${comment.id}`, type: "Cộng đồng", actor: "Người dùng", entity: "Bình luận", description: "Bình luận cộng đồng mới", createdAt: comment.createdAt })),
    ...maintenanceRequests.map((request) => ({ id: `maintenance-${request.id}`, type: "Bảo trì", actor: "Người thuê", entity: request.status, description: `Yêu cầu bảo trì: ${request.title}`, createdAt: request.createdAt })),
    ...notifications.map((notification) => ({ id: `notification-${notification.id}`, type: "Thông báo", actor: "Hệ thống", entity: notification.isRead ? "Đã đọc" : "Chưa đọc", description: `Thông báo: ${notification.title}`, createdAt: notification.createdAt })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 30)
    .map((event) => ({ ...event, createdAt: event.createdAt.toISOString() }));

  const occupancyRate = rooms.length > 0 ? (occupiedRooms / rooms.length) * 100 : 0;
  const unpaidInvoiceRatio = invoices.length > 0 ? (unpaidInvoices.length / invoices.length) * 100 : 0;
  const maintenancePendingRatio = maintenanceRequests.length > 0 ? (pendingMaintenance / maintenanceRequests.length) * 100 : 0;
  const landlordActivationRate = totalLandlords > 0 ? (landlordsWithBuilding / totalLandlords) * 100 : 0;
  const tenantConversionRate = totalTenants > 0 ? (tenantsWithActiveContract / totalTenants) * 100 : 0;
  const retentionRate = totalUsers > 0 ? (activeUserIds.size / totalUsers) * 100 : 0;
  const signupGrowthRate = growthRate(newUsers30d, previousUsers30d);

  const insights = [
    {
      title: signupGrowthRate >= 0 ? "Tăng trưởng người dùng tích cực" : "Tăng trưởng người dùng giảm",
      description: `Số lượt đăng ký trong 30 ngày thay đổi ${signupGrowthRate.toFixed(1)}% so với kỳ trước.`,
      tone: signupGrowthRate >= 0 ? "positive" : "warning",
    },
    {
      title: "Sức khỏe doanh thu",
      description: `${paidPlanLandlords.length} chủ nhà đang dùng gói trả phí, MRR ước tính ${planRevenue.toLocaleString("vi-VN")} đ.`,
      tone: paidPlanLandlords.length > 0 ? "positive" : "warning",
    },
    {
      title: "Chuyển đổi nền tảng",
      description: `${landlordActivationRate.toFixed(1)}% chủ nhà đã tạo tòa nhà và ${tenantConversionRate.toFixed(1)}% người thuê có hợp đồng hoạt động.`,
      tone: landlordActivationRate >= 50 && tenantConversionRate >= 50 ? "positive" : "neutral",
    },
    {
      title: "Vận hành và bảo trì",
      description: `${maintenancePendingRatio.toFixed(1)}% yêu cầu bảo trì đang chờ xử lý.`,
      tone: maintenancePendingRatio > 35 ? "warning" : "positive",
    },
  ];

  return NextResponse.json({
    generatedAt: now.toISOString(),
    users: {
      totalUsers,
      totalLandlords,
      totalTenants,
      totalAdmins,
      activeUsers,
      newUsers7d,
      newUsers30d,
      signupGrowthRate,
      roleDistribution: [
        { role: "Admin", value: totalAdmins },
        { role: "Chủ nhà", value: totalLandlords },
        { role: "Người thuê", value: totalTenants },
      ],
      growth: userGrowth,
    },
    platform: {
      buildings: buildingsCount,
      rooms: rooms.length,
      occupiedRooms,
      occupancyRate,
      contracts: contracts.length,
      activeContracts: contracts.filter((contract) => contract.status === "ACTIVE").length,
      maintenanceRequests: maintenanceRequests.length,
      pendingMaintenance,
      unpaidInvoiceRatio,
      maintenancePendingRatio,
    },
    revenue: {
      totalRevenue: planRevenue,
      billedRevenue: roomInvoiceVolume,
      unpaidRevenue: unpaidRoomInvoiceVolume,
      paidInvoices: paidInvoices.length,
      unpaidInvoices: unpaidInvoices.length,
      paidPlanLandlords: paidPlanLandlords.length,
      freePlanLandlords: freePlanLandlords.length,
      trend: revenueTrend,
    },
    conversion: {
      landlordsWithBuilding,
      landlordsWithRooms,
      tenantsWithRoom,
      tenantsWithActiveContract,
      landlordActivationRate,
      tenantConversionRate,
      retentionRate,
      activeUsers30d: activeUserIds.size,
    },
    usage: {
      featureUsage,
      communityEvents: posts.length + comments.length + likes.length + shares.length,
      businessEvents: invoices.length + contracts.length + maintenanceRequests.length,
    },
    recentEvents,
    insights,
  });
}
