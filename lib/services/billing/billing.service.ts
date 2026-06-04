import { prisma } from '@/lib/prisma'
import {
  PlanTier,
  PLAN_LIMITS,
  DEFAULT_PLAN,
  canAddBuilding,
  canAddRoom,
} from '@/lib/constants/plans'

// Prisma client types may lag behind schema until `prisma generate` is re-run.
// Using `any` casts here as a temporary bridge — remove once client is regenerated.
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * BillingService
 * Quản lý gói dịch vụ, subscription của landlord.
 */
export class BillingService {
  /**
   * Lấy thông tin gói hiện tại của landlord.
   */
  async getPlan(landlordId: string): Promise<{ plan: PlanTier; limits: (typeof PLAN_LIMITS)[PlanTier] }> {
    const landlord = await (prisma.landlord.findUnique as any)({
      where: { id: landlordId },
      select: { plan: true },
    })

    if (!landlord) {
      throw new Error(`Landlord ${landlordId} not found`)
    }

    const plan = (landlord.plan as PlanTier) ?? DEFAULT_PLAN
    return { plan, limits: PLAN_LIMITS[plan] }
  }

  /**
   * Nâng cấp hoặc hạ cấp gói dịch vụ.
   */
  async changePlan(landlordId: string, newPlan: PlanTier): Promise<void> {
    if (!Object.values(PlanTier).includes(newPlan)) {
      throw new Error(`Invalid plan: ${newPlan}`)
    }

    await (prisma.landlord.update as any)({
      where: { id: landlordId },
      data: { plan: newPlan },
    })
  }

  /**
   * Kiểm tra landlord có đang trong giới hạn gói không.
   */
  async checkPlanLimits(
    landlordId: string
  ): Promise<{ withinLimits: boolean; reason?: string }> {
    const landlord = await (prisma.landlord.findUnique as any)({
      where: { id: landlordId },
      select: {
        plan: true,
        buildings: {
          select: {
            _count: { select: { rooms: true } },
          },
        },
      },
    })

    if (!landlord) {
      return { withinLimits: false, reason: 'Landlord not found' }
    }

    const plan = (landlord.plan as PlanTier) ?? DEFAULT_PLAN
    const limits = PLAN_LIMITS[plan]

    const buildingCount = (landlord.buildings as any[]).length
    const roomCount = (landlord.buildings as any[]).reduce(
      (sum: number, b: any) => sum + b._count.rooms,
      0
    )

    if (limits.maxBuildings !== -1 && buildingCount > limits.maxBuildings) {
      return {
        withinLimits: false,
        reason: `Gói ${plan} chỉ cho phép tối đa ${limits.maxBuildings} tòa nhà. Hiện tại: ${buildingCount}.`,
      }
    }

    if (limits.maxRooms !== -1 && roomCount > limits.maxRooms) {
      return {
        withinLimits: false,
        reason: `Gói ${plan} chỉ cho phép tối đa ${limits.maxRooms} phòng. Hiện tại: ${roomCount}.`,
      }
    }

    return { withinLimits: true }
  }

  /**
   * Kiểm tra xem landlord có thể thêm tòa nhà mới không.
   */
  async canAddBuilding(
    landlordId: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    const landlord = await (prisma.landlord.findUnique as any)({
      where: { id: landlordId },
      select: {
        plan: true,
        _count: { select: { buildings: true } },
      },
    })

    if (!landlord) {
      return { allowed: false, reason: 'Landlord not found' }
    }

    const plan = (landlord.plan as PlanTier) ?? DEFAULT_PLAN
    const currentCount = (landlord._count as any).buildings
    const limits = PLAN_LIMITS[plan]

    if (!canAddBuilding(plan, currentCount)) {
      return {
        allowed: false,
        reason: `Gói ${plan} chỉ cho phép tối đa ${limits.maxBuildings} tòa nhà. Vui lòng nâng cấp gói để thêm tòa nhà mới.`,
      }
    }

    return { allowed: true }
  }

  /**
   * Kiểm tra xem landlord có thể thêm phòng mới không.
   */
  async canAddRoom(
    landlordId: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    const landlord = await (prisma.landlord.findUnique as any)({
      where: { id: landlordId },
      select: {
        plan: true,
        buildings: {
          select: {
            _count: { select: { rooms: true } },
          },
        },
      },
    })

    if (!landlord) {
      return { allowed: false, reason: 'Landlord not found' }
    }

    const plan = (landlord.plan as PlanTier) ?? DEFAULT_PLAN
    const currentRoomCount = (landlord.buildings as any[]).reduce(
      (sum: number, b: any) => sum + b._count.rooms,
      0
    )
    const limits = PLAN_LIMITS[plan]

    if (!canAddRoom(plan, currentRoomCount)) {
      return {
        allowed: false,
        reason: `Gói ${plan} chỉ cho phép tối đa ${limits.maxRooms} phòng. Vui lòng nâng cấp gói để thêm phòng mới.`,
      }
    }

    return { allowed: true }
  }

  /**
   * Lấy lịch sử thanh toán của landlord.
   * TODO: implement khi có bảng Payment trong schema.
   */
  async getPaymentHistory(_landlordId: string) {
    return []
  }

  /**
   * Hủy gói dịch vụ — chuyển về FREE.
   */
  async cancelPlan(landlordId: string): Promise<void> {
    await (prisma.landlord.update as any)({
      where: { id: landlordId },
      data: { plan: PlanTier.FREE },
    })
  }
}

export const billingService = new BillingService()
