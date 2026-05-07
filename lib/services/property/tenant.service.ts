import { prisma } from '@/lib/prisma'

/**
 * TenantService
 * Quản lý thông tin người thuê, hồ sơ, và lịch sử thuê phòng.
 * Microservice target: tenant-service
 */
export class TenantService {
  /**
   * Tạo hồ sơ người thuê mới
   */
  async create(data: {
    userId: string
    fullName: string
    phone: string
    idCardNumber: string
    idCardFront?: string
    idCardBack?: string
    permanentAddress?: string
    emergencyContact?: string
  }) {
    // TODO: implement
    throw new Error('Not implemented')
  }

  /**
   * Lấy thông tin người thuê theo ID
   */
  async getById(tenantId: string) {
    // TODO: implement
    throw new Error('Not implemented')
  }

  /**
   * Lấy danh sách người thuê theo landlord
   */
  async getByLandlord(landlordId: string) {
    // TODO: implement
    throw new Error('Not implemented')
  }

  /**
   * Lấy danh sách người thuê theo tòa nhà
   */
  async getByBuilding(buildingId: string) {
    // TODO: implement
    throw new Error('Not implemented')
  }

  /**
   * Cập nhật thông tin người thuê
   */
  async update(tenantId: string, data: Partial<{
    fullName: string
    phone: string
    permanentAddress: string
    emergencyContact: string
  }>) {
    // TODO: implement
    throw new Error('Not implemented')
  }

  /**
   * Lấy lịch sử thuê phòng của người thuê
   */
  async getRentalHistory(tenantId: string) {
    // TODO: implement
    throw new Error('Not implemented')
  }

  /**
   * Lấy lịch sử thanh toán của người thuê
   */
  async getPaymentHistory(tenantId: string) {
    // TODO: implement
    throw new Error('Not implemented')
  }

  /**
   * Kiểm tra người thuê có nợ hóa đơn không
   */
  async hasOutstandingDebt(tenantId: string): Promise<boolean> {
    // TODO: implement
    throw new Error('Not implemented')
  }

  /**
   * Tìm kiếm người thuê theo tên, số điện thoại, hoặc CCCD
   */
  async search(landlordId: string, query: string) {
    // TODO: implement
    throw new Error('Not implemented')
  }

  /**
   * Xóa hồ sơ người thuê (chỉ khi không còn hợp đồng active)
   */
  async delete(tenantId: string) {
    // TODO: implement
    throw new Error('Not implemented')
  }
}

export const tenantService = new TenantService()
