import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

type ChatContext = {
  landlordId?: string;
  tenantId?: string;
};

export class ChatbotService {
  private getModel() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  }

  private formatDueDate(dueDate: Date | null) {
    if (!dueDate) {
      return {
        text: 'Chưa đặt hạn thanh toán',
        isOverdue: false,
      };
    }

    const parsedDueDate = new Date(dueDate);
    return {
      text: parsedDueDate.toLocaleDateString('vi-VN'),
      isOverdue: parsedDueDate < new Date(),
    };
  }

  private async handleSpecialQuestions(message: string, landlordId?: string, tenantId?: string) {
    const lowerMessage = message.toLowerCase().trim();

    // Check thông báo mới nhất (Tenant)
    if ((lowerMessage.includes('thông báo') || lowerMessage.includes('notification')) && 
        (lowerMessage.includes('mới') || lowerMessage.includes('check') || lowerMessage.includes('xem') || lowerMessage.includes('kiểm tra'))) {
      if (!tenantId) {
        return 'Bạn cần đăng nhập với tài khoản người thuê để xem thông báo.';
      }

      const notifications = await prisma.notification.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      if (notifications.length === 0) {
        return 'Bạn chưa có thông báo nào.';
      }

      let response = `📬 ${notifications.length} thông báo mới nhất:\n\n`;
      notifications.forEach((notif) => {
        const date = new Date(notif.createdAt).toLocaleDateString('vi-VN');
        const icon = notif.isRead ? '✓' : '🔔';
        response += `${icon} ${notif.title}\n`;
        response += `   ${notif.message}\n`;
        response += `   ${date}\n\n`;
      });

      return response;
    }

    // Kiểm tra các khoản cần đóng (Tenant)
    if ((lowerMessage.includes('khoản') || lowerMessage.includes('hóa đơn') || lowerMessage.includes('invoice') || lowerMessage.includes('cần đóng')) && 
        (lowerMessage.includes('đóng') || lowerMessage.includes('thanh toán') || lowerMessage.includes('pay') || lowerMessage.includes('cần'))) {
      if (!tenantId) {
        return 'Bạn cần đăng nhập với tài khoản người thuê để xem hóa đơn.';
      }

      const unpaidInvoices = await prisma.invoice.findMany({
        where: {
          tenantId,
          status: 'UNPAID',
        },
        orderBy: { dueDate: 'asc' },
      });

      if (unpaidInvoices.length === 0) {
        return 'Bạn không có hóa đơn nào cần thanh toán! 🎉';
      }

      let response = `💰 Bạn có ${unpaidInvoices.length} hóa đơn cần thanh toán:\n\n`;
      let totalAmount = 0;

      unpaidInvoices.forEach((invoice) => {
        const dueDateInfo = this.formatDueDate(invoice.dueDate);
        totalAmount += invoice.totalAmount;

        response += `${dueDateInfo.isOverdue ? '⚠️' : '📋'} Hóa đơn tháng ${invoice.month}/${invoice.year}\n`;
        response += `   Số tiền: ${invoice.totalAmount.toLocaleString('vi-VN')}đ\n`;
        response += `   Hạn: ${dueDateInfo.text}${dueDateInfo.isOverdue ? ' (Quá hạn!)' : ''}\n\n`;
      });

      response += `💵 Tổng cộng: ${totalAmount.toLocaleString('vi-VN')}đ`;

      return response;
    }

    // Thông tin hợp đồng (Tenant)
    if (lowerMessage.includes('hợp đồng') || lowerMessage.includes('contract')) {
      if (!tenantId) {
        return 'Bạn cần đăng nhập với tài khoản người thuê để xem hợp đồng.';
      }

      try {
        const contracts = await prisma.contract.findMany({
          where: { tenantId },
          include: {
            room: {
              include: {
                building: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        if (contracts.length === 0) {
          return 'Bạn chưa có hợp đồng nào.';
        }

        const activeContract = contracts.find(c => c.status === 'ACTIVE');
        
        if (!activeContract) {
          const allStatuses = contracts.map(c => c.status).join(', ');
          return `Bạn không có hợp đồng đang hoạt động.\nTrạng thái hợp đồng hiện tại: ${allStatuses}`;
        }

        const startDate = new Date(activeContract.startDate);
        const endDate = new Date(activeContract.endDate);
        const today = new Date();
        const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        const rentAmount = activeContract.rentAmount || 0;
        const depositAmount = activeContract.depositAmount || 0;

        let response = `📄 Thông tin hợp đồng của bạn:\n\n`;
        response += `🏠 Phòng: ${activeContract.room?.roomNumber || activeContract.room?.name || 'N/A'}\n`;
        response += `🏢 Tòa nhà: ${activeContract.room?.building?.name || 'N/A'}\n`;
        response += `💰 Giá thuê: ${rentAmount.toLocaleString('vi-VN')}đ/tháng\n`;
        response += `💵 Tiền cọc: ${depositAmount.toLocaleString('vi-VN')}đ\n`;
        response += `📅 Bắt đầu: ${startDate.toLocaleDateString('vi-VN')}\n`;
        response += `📅 Kết thúc: ${endDate.toLocaleDateString('vi-VN')}\n`;
        response += `⏰ Còn lại: ${daysLeft} ngày\n`;
        response += `✅ Trạng thái: Đang hoạt động\n`;

        if (daysLeft < 30 && daysLeft > 0) {
          response += `\n⚠️ Hợp đồng sắp hết hạn! Vui lòng liên hệ chủ nhà để gia hạn.`;
        }

        return response;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching contract:', error);
        return `Xin lỗi, không thể lấy thông tin hợp đồng. Lỗi: ${errorMessage}`;
      }
    }

    // Về chúng tôi
    if (lowerMessage.includes('về chúng tôi') || lowerMessage.includes('giới thiệu')) {
      return `🏠 HouseSea - Nền tảng quản lý nhà trọ thông minh

Chúng tôi là giải pháp toàn diện giúp chủ nhà và người thuê quản lý nhà trọ hiệu quả:

✨ Tính năng nổi bật:
• Quản lý phòng trọ, hợp đồng, hóa đơn tự động
• Theo dõi thanh toán và nhắc nhở thông minh
• Cộng đồng kết nối người thuê
• Phân tích dữ liệu và dự đoán AI
• Chatbot hỗ trợ 24/7

🎯 Sứ mệnh: Đơn giản hóa việc quản lý nhà trọ, mang lại trải nghiệm tốt nhất cho cả chủ nhà và người thuê.`;
    }

    // Thông tin về các gói
    if (lowerMessage.includes('gói') || lowerMessage.includes('giá') || lowerMessage.includes('pricing')) {
      return `💎 Các gói dịch vụ HouseSea

📦 GÓI MIỄN PHÍ
• 1 tòa nhà
• 2-3 phòng
• Tính năng cơ bản: hợp đồng, hóa đơn
• Hỗ trợ email

🚀 GÓI CƠ BẢN - 100.000đ/tháng
• 3-5 tòa nhà
• 2-3 phòng mỗi tòa
• Tất cả tính năng cơ bản
• Cộng đồng người thuê
• Hỗ trợ ưu tiên

⭐ GÓI SIÊU CẤP - 200.000đ/tháng
• Không giới hạn tòa nhà
• Không giới hạn phòng
• AI phân tích & dự đoán
• Chatbot thông minh
• Hỗ trợ 24/7
• Tất cả tính năng cao cấp

📞 Liên hệ: support@housesea.vn để được tư vấn!`;
    }

    // Tổng số phòng còn trống
    if (lowerMessage.includes('phòng') && lowerMessage.includes('trống')) {
      if (!landlordId) {
        return 'Bạn cần đăng nhập với tài khoản chủ nhà để xem thông tin này.';
      }

      const availableRooms = await prisma.room.findMany({
        where: {
          building: { landlordId },
          status: 'AVAILABLE',
        },
        include: { building: true },
      });

      if (availableRooms.length === 0) {
        return 'Hiện tại không có phòng trống nào.';
      }

      const roomsByBuilding = availableRooms.reduce<Record<string, typeof availableRooms>>((acc, room) => {
        const buildingName = room.building.name;
        if (!acc[buildingName]) acc[buildingName] = [];
        acc[buildingName].push(room);
        return acc;
      }, {});

      let response = `Tổng số phòng còn trống: ${availableRooms.length} phòng\n\n`;
      for (const [building, rooms] of Object.entries(roomsByBuilding)) {
        response += `📍 ${building}: ${rooms.length} phòng\n`;
        rooms.forEach((room) => {
          response += `  • ${room.roomNumber} - ${room.price.toLocaleString('vi-VN')}đ/tháng\n`;
        });
      }

      return response;
    }

    // Còn ai chưa đóng tiền
    if (lowerMessage.includes('chưa đóng') || lowerMessage.includes('chưa thanh toán')) {
      if (!landlordId) {
        return 'Bạn cần đăng nhập với tài khoản chủ nhà để xem thông tin này.';
      }

      const unpaidInvoices = await prisma.invoice.findMany({
        where: {
          tenant: {
            room: {
              building: { landlordId },
            },
          },
          status: 'UNPAID',
        },
        include: {
          tenant: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
              room: {
                select: {
                  roomNumber: true,
                },
              },
            },
          },
        },
        orderBy: [{ year: 'asc' }, { month: 'asc' }],
      });

      if (unpaidInvoices.length === 0) {
        return 'Tất cả người thuê đã đóng tiền đầy đủ! 🎉';
      }

      // Group invoices by tenant
      type TenantDebtGroup = {
        name: string;
        roomNumber: string;
        invoices: typeof unpaidInvoices;
        totalAmount: number;
        hasOverdue: boolean;
      };

      const grouped = new Map<string, TenantDebtGroup>();

      unpaidInvoices.forEach((invoice) => {
        const key = invoice.tenantId;
        const existing = grouped.get(key);
        const dueDateInfo = this.formatDueDate(invoice.dueDate);

        if (existing) {
          existing.invoices.push(invoice);
          existing.totalAmount += invoice.totalAmount;
          if (dueDateInfo.isOverdue) existing.hasOverdue = true;
        } else {
          grouped.set(key, {
            name: invoice.tenant.user.name,
            roomNumber: invoice.tenant.room?.roomNumber || 'N/A',
            invoices: [invoice],
            totalAmount: invoice.totalAmount,
            hasOverdue: dueDateInfo.isOverdue,
          });
        }
      });

      const uniqueTenantCount = grouped.size;
      let response = `Có ${uniqueTenantCount} người thuê chưa đóng tiền (${unpaidInvoices.length} hóa đơn):\n\n`;

      grouped.forEach((group) => {
        response += `${group.hasOverdue ? '⚠️' : '📋'} ${group.name} — Phòng ${group.roomNumber}\n`;

        const monthNames = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                            'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];

        group.invoices.forEach((invoice) => {
          const dueDateInfo = this.formatDueDate(invoice.dueDate);
          const label = `${monthNames[invoice.month - 1]}/${invoice.year}`;
          const overdueTag = dueDateInfo.isOverdue ? ' 🔴 Quá hạn' : '';
          response += `  • ${label}: ${invoice.totalAmount.toLocaleString('vi-VN')}đ — Hạn: ${dueDateInfo.text}${overdueTag}\n`;
        });

        response += `  💰 Tổng nợ: ${group.totalAmount.toLocaleString('vi-VN')}đ\n\n`;
      });

      // Total debt summary at the end
      const grandTotal = unpaidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      response += `📊 Tổng công nợ toàn bộ: ${grandTotal.toLocaleString('vi-VN')}đ`;

      return response;
    }

    // Gửi thông báo đóng tiền
    if (lowerMessage.includes('gửi thông báo') || lowerMessage.includes('nhắc nhở')) {
      if (!landlordId) {
        return 'Bạn cần đăng nhập với tài khoản chủ nhà để thực hiện chức năng này.';
      }

      const unpaidInvoices = await prisma.invoice.findMany({
        where: {
          tenant: {
            room: {
              building: { landlordId },
            },
          },
          status: 'UNPAID',
        },
        include: {
          tenant: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      if (unpaidInvoices.length === 0) {
        return 'Không có hóa đơn nào cần nhắc nhở.';
      }

      // Gộp theo tenant để tránh spam nhiều thông báo cho cùng một người thuê.
      const groupedByTenant = unpaidInvoices.reduce<Record<string, typeof unpaidInvoices>>((acc, invoice) => {
        if (!acc[invoice.tenantId]) {
          acc[invoice.tenantId] = [];
        }
        acc[invoice.tenantId].push(invoice);
        return acc;
      }, {});

      const notifications = await Promise.all(
        Object.entries(groupedByTenant).map(([tenantId, invoices]) => {
          const totalDebt = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
          const nearestDueInvoice = invoices
            .filter((inv) => Boolean(inv.dueDate))
            .sort((a, b) => (a.dueDate!.getTime() - b.dueDate!.getTime()))[0];

          const dueText = nearestDueInvoice
            ? this.formatDueDate(nearestDueInvoice.dueDate).text
            : 'Chưa đặt hạn thanh toán';

          return prisma.notification.create({
            data: {
              tenantId,
              title: 'Nhắc nhở thanh toán',
              message: `Bạn có ${invoices.length} hóa đơn chưa thanh toán với tổng số tiền ${totalDebt.toLocaleString('vi-VN')}đ. Hạn gần nhất: ${dueText}. Vui lòng thanh toán sớm để tránh phát sinh phí.`,
            },
          });
        })
      );

      return `Đã gửi ${notifications.length} thông báo nhắc nhở thanh toán thành công! ✅`;
    }

    return null;
  }

  async chat(message: string, context?: ChatContext) {
    try {
      // Kiểm tra câu hỏi đặc biệt
      const specialResponse = await this.handleSpecialQuestions(
        message,
        context?.landlordId,
        context?.tenantId
      );
      if (specialResponse) {
        return specialResponse;
      }

      // Nếu không phải câu hỏi đặc biệt, dùng AI
      const model = this.getModel();
      const systemPrompt = `Bạn là trợ lý AI hỗ trợ quản lý nhà trọ. Nhiệm vụ của bạn:
- Trả lời câu hỏi về hóa đơn, hợp đồng, bảo trì
- Hướng dẫn sử dụng hệ thống
- Giải đáp thắc mắc về quy định nhà trọ
- Luôn lịch sự, thân thiện và hữu ích

${context ? `Thông tin người dùng:\n${JSON.stringify(context, null, 2)}` : ''}

Câu hỏi: ${message}`;

      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      return response.text();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      console.error('Chatbot error:', error);
      console.error('Error details:', {
        message: errorMessage,
        stack: errorStack,
        context: context
      });
      throw new Error(`Chatbot service error: ${errorMessage}`);
    }
  }
}

export const chatbotService = new ChatbotService();
