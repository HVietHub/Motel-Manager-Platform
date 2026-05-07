import { prisma } from '@/lib/prisma'

/**
 * MaintenanceService
 * Quản lý yêu cầu bảo trì, sửa chữa phòng và tòa nhà.
 * Microservice target: maintenance-service
 */
export class MaintenanceService {
  /**
   * Tạo yêu cầu bảo trì mới
   */
  async createRequest(data: {
    roomId: string
    landlordId: string
    tenantId?: string
    title: string
    description: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  }) {
    // TODO: implement
    throw new Error('Not implemented')
  }

  /**
   * Lấy danh sách yêu cầu bảo trì theo landlord
   */
  async getRequestsByLandlord(landlordId: string) {
    // TODO: implement
    throw new Error('Not implemented')
  }

  /**
   * Lấy danh sách yêu cầu bảo trì theo phòng
   */
  async getRequestsByRoom(roomId: string) {
    // TODO: implement
    throw new Error('Not implemented')
  }

  /**
   * Cập nhật trạng thái yêu cầu bảo trì
   */
  async updateStatus(
    requestId: string,
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  ) {
    // TODO: implement
    throw new Error('Not implemented')
  }

  /**
   * Gán nhân viên kỹ thuật cho yêu cầu bảo trì
   */
  async assignTechnician(requestId: string, technicianId: string) {
    // TODO: implement
    throw new Error('Not implemented')
  }

  /**
   * Ghi nhận chi phí bảo trì
   */
  async recordCost(requestId: string, cost: number, note?: string) {
    // TODO: implement
    throw new Error('Not implemented')
  }

  /**
   * Lấy lịch sử bảo trì của một phòng
   */
  async getHistory(roomId: string) {
    // TODO: implement
    throw new Error('Not implemented')
  }

  /**
   * Thống kê chi phí bảo trì theo tháng
   */
  async getCostSummary(landlordId: string, month: number, year: number) {
    // TODO: implement
    throw new Error('Not implemented')
  }
}

export const maintenanceService = new MaintenanceService()
