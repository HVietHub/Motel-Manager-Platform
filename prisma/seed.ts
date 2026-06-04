import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Clear existing data
  await prisma.share.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.like.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.maintenanceRequest.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.contract.deleteMany({});
  await prisma.tenant.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.building.deleteMany({});
  await prisma.landlord.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Cleared existing data");

  // Create test accounts with specified passwords
  const landlordPassword = await bcrypt.hash("665209Az@", 10);
  const tenantPassword = await bcrypt.hash("665209Az@", 10);

  const landlordUser = await prisma.user.create({
    data: {
      email: "test@gmail.com",
      password: landlordPassword,
      name: "Chủ Nhà Test",
      role: "LANDLORD",
      landlord: {
        create: {
          userCode: "LL001",
          phone: "0901234567",
        },
      },
    },
    include: {
      landlord: true,
    },
  });

  console.log("Created landlord:", landlordUser.email);

  // Create buildings
  const building1 = await prisma.building.create({
    data: {
      landlordId: landlordUser.landlord!.id,
      name: "Nhà Trọ Sinh Viên A",
      address: "123 Đường Lê Lợi, Quận 1, TP.HCM",
      description: "Nhà trọ dành cho sinh viên, gần trường đại học",
    },
  });

  const building2 = await prisma.building.create({
    data: {
      landlordId: landlordUser.landlord!.id,
      name: "Nhà Trọ Công Nhân B",
      address: "456 Đường Nguyễn Huệ, Quận 3, TP.HCM",
      description: "Nhà trọ dành cho công nhân, gần khu công nghiệp",
    },
  });

  console.log("Created buildings");

  // Create rooms for building 1
  const rooms1 = await Promise.all([
    prisma.room.create({
      data: {
        buildingId: building1.id,
        roomNumber: "101",
        floor: 1,
        price: 2500000,
        deposit: 5000000,
        area: 20,
        status: "AVAILABLE",
        description: "Phòng đơn, có ban công",
      },
    }),
    prisma.room.create({
      data: {
        buildingId: building1.id,
        roomNumber: "102",
        floor: 1,
        price: 3000000,
        deposit: 6000000,
        area: 25,
        status: "AVAILABLE",
        description: "Phòng đôi, có WC riêng",
      },
    }),
    prisma.room.create({
      data: {
        buildingId: building1.id,
        roomNumber: "201",
        floor: 2,
        price: 2800000,
        deposit: 5600000,
        area: 22,
        status: "AVAILABLE",
        description: "Phòng đơn, view đẹp",
      },
    }),
  ]);

  // Create rooms for building 2
  const rooms2 = await Promise.all([
    prisma.room.create({
      data: {
        buildingId: building2.id,
        roomNumber: "101",
        floor: 1,
        price: 2000000,
        deposit: 4000000,
        area: 18,
        status: "AVAILABLE",
        description: "Phòng đơn giản",
      },
    }),
    prisma.room.create({
      data: {
        buildingId: building2.id,
        roomNumber: "102",
        floor: 1,
        price: 2200000,
        deposit: 4400000,
        area: 20,
        status: "AVAILABLE",
        description: "Phòng có cửa sổ lớn",
      },
    }),
  ]);

  console.log("Created rooms");

  // Create tenant user
  const tenant1User = await prisma.user.create({
    data: {
      email: "test2@gmail.com",
      password: tenantPassword,
      name: "Người Thuê Test",
      role: "TENANT",
      tenant: {
        create: {
          userCode: "TN001",
          landlordId: landlordUser.landlord!.id,
          phone: "0987654321",
          idCard: "123456789012",
          address: "789 Đường Trần Hưng Đạo, Quận 5, TP.HCM",
          roomId: rooms1[0].id,
          invitationStatus: "accepted",
        },
      },
    },
    include: {
      tenant: true,
    },
  });

  // Update room status to OCCUPIED
  await prisma.room.update({
    where: { id: rooms1[0].id },
    data: { status: "OCCUPIED" },
  });

  console.log("Created tenant:", tenant1User.email);

  // Create contract
  const startDate = new Date();
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1);

  const contract = await prisma.contract.create({
    data: {
      tenantId: tenant1User.tenant!.id,
      roomId: rooms1[0].id,
      startDate,
      endDate,
      rentAmount: 2500000,
      depositAmount: 5000000,
      status: "ACTIVE",
      terms: "Thanh toán tiền phòng trước ngày 5 hàng tháng",
    },
  });

  console.log("Created contract");

  // Create invoice
  const currentDate = new Date();
  const invoice = await prisma.invoice.create({
    data: {
      tenantId: tenant1User.tenant!.id,
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
      rentAmount: 2500000,
      electricityAmount: 200000,
      waterAmount: 100000,
      serviceAmount: 150000,
      otherAmount: 0,
      totalAmount: 2950000,
      status: "UNPAID",
      description: "Hóa đơn tháng " + (currentDate.getMonth() + 1),
    },
  });

  console.log("Created invoice");

  // Create notification
  await prisma.notification.create({
    data: {
      tenantId: tenant1User.tenant!.id,
      title: "Thông báo thanh toán",
      message: "Vui lòng thanh toán tiền phòng tháng này trước ngày 5",
      isRead: false,
    },
  });

  console.log("Created notification");

  // Create more tenants and contracts for revenue data
  const tenant2User = await prisma.user.create({
    data: {
      email: "tenant2@test.com",
      password: tenantPassword,
      name: "Nguyễn Văn B",
      role: "TENANT",
      tenant: {
        create: {
          userCode: "TN002",
          landlordId: landlordUser.landlord!.id,
          phone: "0912345678",
          idCard: "234567890123",
          address: "456 Đường Lý Thường Kiệt, Quận 10, TP.HCM",
          roomId: rooms1[1].id,
          invitationStatus: "accepted",
        },
      },
    },
    include: {
      tenant: true,
    },
  });

  await prisma.room.update({
    where: { id: rooms1[1].id },
    data: { status: "OCCUPIED" },
  });

  const tenant3User = await prisma.user.create({
    data: {
      email: "tenant3@test.com",
      password: tenantPassword,
      name: "Lê Thị C",
      role: "TENANT",
      tenant: {
        create: {
          userCode: "TN003",
          landlordId: landlordUser.landlord!.id,
          phone: "0923456789",
          idCard: "345678901234",
          address: "789 Đường Cách Mạng Tháng 8, Quận 3, TP.HCM",
          roomId: rooms2[0].id,
          invitationStatus: "accepted",
        },
      },
    },
    include: {
      tenant: true,
    },
  });

  await prisma.room.update({
    where: { id: rooms2[0].id },
    data: { status: "OCCUPIED" },
  });

  console.log("Created additional tenants");

  // Create contracts for new tenants
  await prisma.contract.create({
    data: {
      tenantId: tenant2User.tenant!.id,
      roomId: rooms1[1].id,
      startDate,
      endDate,
      rentAmount: 3000000,
      depositAmount: 6000000,
      status: "ACTIVE",
      terms: "Thanh toán tiền phòng trước ngày 5 hàng tháng",
    },
  });

  await prisma.contract.create({
    data: {
      tenantId: tenant3User.tenant!.id,
      roomId: rooms2[0].id,
      startDate,
      endDate,
      rentAmount: 2000000,
      depositAmount: 4000000,
      status: "ACTIVE",
      terms: "Thanh toán tiền phòng trước ngày 5 hàng tháng",
    },
  });

  console.log("Created additional contracts");

  // Create invoices for current month (unpaid)
  await prisma.invoice.create({
    data: {
      tenantId: tenant2User.tenant!.id,
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
      rentAmount: 3000000,
      electricityAmount: 250000,
      waterAmount: 120000,
      serviceAmount: 150000,
      otherAmount: 0,
      totalAmount: 3520000,
      status: "UNPAID",
      description: "Hóa đơn tháng " + (currentDate.getMonth() + 1),
    },
  });

  await prisma.invoice.create({
    data: {
      tenantId: tenant3User.tenant!.id,
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
      rentAmount: 2000000,
      electricityAmount: 180000,
      waterAmount: 90000,
      serviceAmount: 150000,
      otherAmount: 0,
      totalAmount: 2420000,
      status: "UNPAID",
      description: "Hóa đơn tháng " + (currentDate.getMonth() + 1),
    },
  });

  // Create paid invoices for previous months
  const lastMonth = new Date(currentDate);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  await prisma.invoice.create({
    data: {
      tenantId: tenant1User.tenant!.id,
      month: lastMonth.getMonth() + 1,
      year: lastMonth.getFullYear(),
      rentAmount: 2500000,
      electricityAmount: 200000,
      waterAmount: 100000,
      serviceAmount: 150000,
      otherAmount: 0,
      totalAmount: 2950000,
      status: "PAID",
      paidDate: lastMonth,
      description: "Hóa đơn tháng " + (lastMonth.getMonth() + 1),
    },
  });

  await prisma.invoice.create({
    data: {
      tenantId: tenant2User.tenant!.id,
      month: lastMonth.getMonth() + 1,
      year: lastMonth.getFullYear(),
      rentAmount: 3000000,
      electricityAmount: 250000,
      waterAmount: 120000,
      serviceAmount: 150000,
      otherAmount: 0,
      totalAmount: 3520000,
      status: "PAID",
      paidDate: lastMonth,
      description: "Hóa đơn tháng " + (lastMonth.getMonth() + 1),
    },
  });

  await prisma.invoice.create({
    data: {
      tenantId: tenant3User.tenant!.id,
      month: lastMonth.getMonth() + 1,
      year: lastMonth.getFullYear(),
      rentAmount: 2000000,
      electricityAmount: 180000,
      waterAmount: 90000,
      serviceAmount: 150000,
      otherAmount: 0,
      totalAmount: 2420000,
      status: "PAID",
      paidDate: lastMonth,
      description: "Hóa đơn tháng " + (lastMonth.getMonth() + 1),
    },
  });

  console.log("Created invoices with revenue data");

  // Create maintenance requests
  await prisma.maintenanceRequest.create({
    data: {
      tenantId: tenant1User.tenant!.id,
      roomId: rooms1[0].id,
      title: "Sửa điều hòa",
      description: "Điều hòa không lạnh, cần kiểm tra và sửa chữa",
      priority: "HIGH",
      status: "PENDING",
    },
  });

  await prisma.maintenanceRequest.create({
    data: {
      tenantId: tenant2User.tenant!.id,
      roomId: rooms1[1].id,
      title: "Thay bóng đèn",
      description: "Bóng đèn phòng ngủ bị hỏng",
      priority: "LOW",
      status: "IN_PROGRESS",
    },
  });

  await prisma.maintenanceRequest.create({
    data: {
      tenantId: tenant3User.tenant!.id,
      roomId: rooms2[0].id,
      title: "Sửa vòi nước",
      description: "Vòi nước bị rò rỉ",
      priority: "MEDIUM",
      status: "COMPLETED",
    },
  });

  console.log("Created maintenance requests");

  // Create more notifications
  await prisma.notification.create({
    data: {
      tenantId: tenant2User.tenant!.id,
      title: "Thông báo bảo trì",
      message: "Hệ thống nước sẽ được bảo trì vào ngày mai từ 8h-12h",
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      tenantId: tenant3User.tenant!.id,
      title: "Chúc mừng",
      message: "Chào mừng bạn đến với nhà trọ!",
      isRead: true,
    },
  });

  console.log("Created additional notifications");

  // Create community posts
  const post1 = await prisma.post.create({
    data: {
      authorId: landlordUser.id,
      authorType: "LANDLORD",
      content: "Thông báo: Hệ thống nước sẽ được bảo trì vào Chủ nhật tuần này từ 8h-12h. Mọi người chuẩn bị nước dự trữ nhé!",
    },
  });

  const post2 = await prisma.post.create({
    data: {
      authorId: tenant1User.id,
      authorType: "TENANT",
      content: "Chào mọi người! Mình mới chuyển đến đây. Rất vui được làm quen với các bạn. Có ai biết quán ăn ngon gần đây không ạ?",
    },
  });

  const post3 = await prisma.post.create({
    data: {
      authorId: tenant2User.id,
      authorType: "TENANT",
      content: "Mình có xe máy cần bán gấp, giá 8 triệu. Ai có nhu cầu inbox mình nhé! 📱",
    },
  });

  const post4 = await prisma.post.create({
    data: {
      authorId: landlordUser.id,
      authorType: "LANDLORD",
      content: "Chúc mừng năm mới! Nhà trọ sẽ tổ chức tiệc tất niên vào tối 30 Tết. Mọi người tham gia đông đủ nhé! 🎉🎊",
    },
  });

  const post5 = await prisma.post.create({
    data: {
      authorId: tenant3User.id,
      authorType: "TENANT",
      content: "Có ai muốn đi chợ cùng mình không? Mình định đi vào chiều nay. Đi chung cho vui 😊",
    },
  });

  console.log("Created community posts");

  // Create likes
  await prisma.like.create({
    data: {
      postId: post1.id,
      userId: tenant1User.id,
    },
  });

  await prisma.like.create({
    data: {
      postId: post1.id,
      userId: tenant2User.id,
    },
  });

  await prisma.like.create({
    data: {
      postId: post2.id,
      userId: landlordUser.id,
    },
  });

  await prisma.like.create({
    data: {
      postId: post2.id,
      userId: tenant3User.id,
    },
  });

  await prisma.like.create({
    data: {
      postId: post3.id,
      userId: tenant1User.id,
    },
  });

  await prisma.like.create({
    data: {
      postId: post4.id,
      userId: tenant1User.id,
    },
  });

  await prisma.like.create({
    data: {
      postId: post4.id,
      userId: tenant2User.id,
    },
  });

  await prisma.like.create({
    data: {
      postId: post4.id,
      userId: tenant3User.id,
    },
  });

  console.log("Created likes");

  // Create comments
  const comment1 = await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: tenant1User.id,
      content: "Cảm ơn chủ nhà đã thông báo trước ạ!",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: tenant2User.id,
      content: "Ok chủ nhà, mình sẽ chuẩn bị nước trước.",
    },
  });

  // Reply to comment
  await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: landlordUser.id,
      content: "Cảm ơn mọi người đã hợp tác nhé!",
      parentId: comment1.id,
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      postId: post2.id,
      authorId: tenant3User.id,
      content: "Chào bạn! Có quán cơm gần đây rất ngon, mình hay ăn đó. Để mình chỉ cho bạn nhé!",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post2.id,
      authorId: tenant1User.id,
      content: "Cảm ơn bạn nhiều! 😊",
      parentId: comment2.id,
    },
  });

  await prisma.comment.create({
    data: {
      postId: post3.id,
      authorId: tenant1User.id,
      content: "Xe còn mới không bạn? Mình quan tâm đây.",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post4.id,
      authorId: tenant1User.id,
      content: "Tuyệt vời! Mình sẽ tham gia ạ 🎉",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post5.id,
      authorId: tenant2User.id,
      content: "Mình cũng muốn đi! Khoảng mấy giờ bạn?",
    },
  });

  console.log("Created comments");

  // Create shares
  await prisma.share.create({
    data: {
      postId: post1.id,
      userId: tenant1User.id,
      sharedWith: "facebook",
    },
  });

  await prisma.share.create({
    data: {
      postId: post4.id,
      userId: tenant2User.id,
      sharedWith: "link",
    },
  });

  console.log("Created shares");

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
