import { prisma } from '@/lib/prisma'

/**
 * ContractService
 * Quản lý hợp đồng thuê phòng giữa landlord và tenant.
 * Microservice target: contract-service
 */
export class ContractService {
  /**
   * Tạo hợp đồng mới
   */
  async create(data: {
    roomId: string
    tenantId: string
    landlordId: string
    startDate: Date
    endDate: Date
    monthlyRent: number
    depositAmount: number
    terms?: string
  }) {
    // TODO: implement
    throw new Error('Not implemented')
  }

  /**
   * Lấy hợp đồng theo ID
   */
  async getById(contractId: string) {
    // TODO: implement
    throw new Error('Not implemented')
  }

  /**
   * Lấy danh sách hợp đồng theo landlord
   */
  async getByLandlord(landlordId: string) {
    // TODO: implement
    throw new Error('Not implemented')
  }

  /**
   * Lấy danh sách hợp đồng theo tenant
   */
  async getByTenant(tenantId: string) {
    // TODO: implement
    throw new Error('Not implemented')
  }

  /**
   * Lấy hợp đồng đang active của một phòng
   */
  async getActiveByRoom(roomId: string) {
    // TODO: implement
    throw new Error('Not implemented')
  }

  /**
   * Gia hạn hợp đồng
   */
  async renew(contractId: string, newEndDate: Date) {
    // TODO: implement
    throw new Error('Not implemented')
  }

  /**
   * Chấm dứt hợp đồng trước hạn
   */
  async terminate(contractId: string, reason: string, terminationDate: Date) {
    // TODO: implement
    throw new Error('Not implemented')
  }

  /**
   * Lấy danh sách hợp đồng sắp hết hạn trong N ngày tới
   */
  async getExpiringSoon(landlordId: string, withinDays: number) {
    // TODO: implement
    throw new Error('Not implemented')
  }

  /**
   * Xuất hợp đồng ra PDF
   */
  async exportPdf(contractId: string): Promise<Buffer> {
    // TODO: implement
    throw new Error('Not implemented')
  }
}

export const contractService = new ContractService()
