import { prisma } from '@/lib/prisma'

/**
 * NotificationService
 * Quản lý thông báo trong app, email, và broadcast cho người thuê.
 * Microservice target: notification-service
 */
export class NotificationService {
  /**
   * Gửi thông báo trong app cho một user
   */
  async sendInApp(userId: string, title: string, message: string) {
    // TODO: implement
    throw new Error('Not implemented')
  }

  /**
   * Gửi thông báo email
   */
  async sendEmail(to: string, subject: string, body: string) {
    // TODO: implement
    throw new Error('Not implemented')
  }

  /**
   * Broadcast thông báo đến tất cả người thuê trong một tòa nhà
   */
  async broadcastToBuilding(buildingId: string, title: string, message: string) {
    // TODO: implement
    throw new Error('Not implemented')
  }

  /**
   * Broadcast thông báo đến tất cả người thuê của một landlord
   */
  async broadcastToAllTenants(landlordId: string, title: string, message: string) {
    // TODO: implement
    throw new Error('Not implemented')
  }

  /**
   * Nhắc nhở thanh toán hóa đơn sắp đến hạn
   */
  async remindPaymentDue(invoiceId: string) {
    // TODO: implement
    throw new Error('Not implemented')
  }

  /**
   * Thông báo hợp đồng sắp hết hạn
   */
  async remindContractExpiry(contractId: string) {
    // TODO: implement
    throw new Error('Not implemented')
  }

  /**
   * Lấy danh sách thông báo chưa đọc của user
   */
  async getUnread(userId: string) {
    // TODO: implement
    throw new Error('Not implemented')
  }

  /**
   * Đánh dấu thông báo đã đọc
   */
  async markAsRead(notificationId: string) {
    // TODO: implement
    throw new Error('Not implemented')
  }
}

export const notificationService = new NotificationService()
