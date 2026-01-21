import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Create a test landlord
  const hashedPassword = await bcrypt.hash("123456", 10);

  const landlordUser = await prisma.user.upsert({
    where: { email: "landlord@test.com" },
    update: {},
    create: {
      email: "landlord@test.com",
      password: hashedPassword,
      name: "Chủ Nhà Test",
      role: "LANDLORD",
      landlord: {
        create: {
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
  const tenant1User = await prisma.user.upsert({
    where: { email: "tenant1@test.com" },
    update: {},
    create: {
      email: "tenant1@test.com",
      password: hashedPassword,
      name: "Trần Thị B",
      role: "TENANT",
      tenant: {
        create: {
          landlordId: landlordUser.landlord!.id,
          phone: "0987654321",
          idCard: "123456789012",
          address: "789 Đường Trần Hưng Đạo, Quận 5, TP.HCM",
          roomId: rooms1[0].id,
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

  // Create independent tenant (not yet invited by any landlord)
  const independentTenantUser = await prisma.user.upsert({
    where: { email: "tenant2@test.com" },
    update: {},
    create: {
      email: "tenant2@test.com",
      password: hashedPassword,
      name: "Nguyễn Văn C",
      role: "TENANT",
      tenant: {
        create: {
          landlordId: "", // Empty - not yet invited
          phone: "0912345678",
          idCard: "987654321098",
          address: "321 Đường Võ Văn Tần, Quận 3, TP.HCM",
        },
      },
    },
  });

  console.log("Created independent tenant:", independentTenantUser.email);

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
