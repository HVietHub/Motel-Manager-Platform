import { prisma } from "@/lib/prisma";
import { invoiceCalculatorService } from "./invoice-calculator.service";

export interface CreateInvoiceWithAutoCalculationParams {
  tenantId: string;
  month: number;
  year: number;
  electricityUsage: number;
  serviceAmount?: number;
  otherAmount?: number;
  description?: string;
  dueDate?: Date;
}

export class InvoiceAutoCalculationService {
  /**
   * Create invoice with automatic calculation based on tenant's room and building prices
   * 
   * Preconditions:
   * - tenantId exists in database
   * - Tenant has assigned room
   * - Room belongs to a building
   * - Building has electricityPrice and waterPrice set
   * - No existing invoice for (tenantId, month, year)
   * - month between 1 and 12
   * - year between 2020 and 2100
   * - electricityUsage >= 0
   * 
   * Postconditions:
   * - Invoice created in database
   * - rentAmount = tenant's room price
   * - electricityAmount = electricityUsage × building's electricityPrice
   * - waterAmount = building's waterPrice
   * - totalAmount correctly calculated
   * - Invoice status = "UNPAID"
   * - Returns created invoice with all relations
   */
  async createInvoiceWithAutoCalculation(params: CreateInvoiceWithAutoCalculationParams) {
    // Validate input
    if (!params.tenantId) {
      throw new Error("Tenant ID is required");
    }
    if (params.month < 1 || params.month > 12) {
      throw new Error("Month must be between 1 and 12");
    }
    if (params.year < 2020 || params.year > 2100) {
      throw new Error("Year must be between 2020 and 2100");
    }
    if (params.electricityUsage < 0) {
      throw new Error("Số điện không hợp lệ");
    }

    // Fetch tenant with room and building in single query
    const tenant = await prisma.tenant.findUnique({
      where: { id: params.tenantId },
      include: {
        room: {
          include: {
            building: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new Error("Tenant not found");
    }

    if (!tenant.room) {
      throw new Error("Người thuê chưa được gán phòng");
    }

    if (!tenant.room.building) {
      throw new Error("Room does not belong to a building");
    }

    // Check for duplicate invoice
    const existingInvoice = await prisma.invoice.findUnique({
      where: {
        tenantId_month_year: {
          tenantId: params.tenantId,
          month: params.month,
          year: params.year,
        },
      },
    });

    if (existingInvoice) {
      throw new Error("Hóa đơn đã tồn tại cho tháng này");
    }

    // Calculate amounts using calculator service
    const calculation = invoiceCalculatorService.calculateInvoiceAmount({
      roomPrice: tenant.room.price,
      electricityUsage: params.electricityUsage,
      electricityPrice: tenant.room.building.electricityPrice,
      waterPrice: tenant.room.building.waterPrice,
      serviceAmount: params.serviceAmount,
      otherAmount: params.otherAmount,
    });

    // Default dueDate: day 10 of the month following the invoice month
    const defaultDueDate = (() => {
      const nextMonth = params.month === 12 ? 1 : params.month + 1;
      const nextYear = params.month === 12 ? params.year + 1 : params.year;
      return new Date(nextYear, nextMonth - 1, 10);
    })();

    // Create invoice with transaction
    const invoice = await prisma.invoice.create({
      data: {
        tenantId: params.tenantId,
        month: params.month,
        year: params.year,
        rentAmount: calculation.rentAmount,
        electricityUsage: params.electricityUsage,
        electricityAmount: calculation.electricityAmount,
        waterAmount: calculation.waterAmount,
        serviceAmount: calculation.serviceAmount,
        otherAmount: calculation.otherAmount,
        totalAmount: calculation.totalAmount,
        description: params.description,
        dueDate: params.dueDate ?? defaultDueDate,
        status: "UNPAID",
      },
      include: {
        tenant: {
          include: {
            user: true,
            room: {
              include: {
                building: true,
              },
            },
          },
        },
      },
    });

    return invoice;
  }
}

export const invoiceAutoCalculationService = new InvoiceAutoCalculationService();
