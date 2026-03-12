import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { chatbotService } from '@/lib/services/chatbot.service';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    
    // Get user context if logged in
    let context: any = {};

    if (session?.user) {
      context.role = session.user.role;

      if (session.user.role === 'TENANT' && session.user.tenantId) {
        const tenant = await prisma.tenant.findUnique({
          where: { id: session.user.tenantId },
          include: {
            room: { include: { building: true } },
            contracts: { where: { status: 'ACTIVE' }, take: 1 },
            invoices: { orderBy: { createdAt: 'desc' }, take: 3 },
          },
        });
        context.tenant = tenant;
        context.tenantId = session.user.tenantId;
      } else if (session.user.role === 'LANDLORD' && session.user.landlordId) {
        context.landlordId = session.user.landlordId;
      }
    }

    const response = await chatbotService.chat(message, context);
    return NextResponse.json({ response }, { status: 200 });
  } catch (error: any) {
    console.error('Chatbot API error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      error: 'Đã xảy ra lỗi khi xử lý yêu cầu',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
