import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { chatbotService } from '@/lib/services/communication/chatbot.service';
import { prisma } from '@/lib/prisma';
import { PlanTier, planHasFeature } from '@/lib/constants/plans';

export async function POST(request: NextRequest) {
  try {
    const { message, forceGuest } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    let context: any = {};
    const shouldUseGuestMode = Boolean(forceGuest);
    const session = shouldUseGuestMode ? null : await getServerSession(authOptions);

    if (session?.user) {
      context.role = session.user.role;

      if (session.user.role === 'LANDLORD' && session.user.landlordId) {
        const landlord = await (prisma.landlord.findUnique as any)({
          where: { id: session.user.landlordId },
          select: { plan: true },
        });
        const plan = (landlord?.plan as PlanTier) ?? PlanTier.FREE;

        if (!planHasFeature(plan, 'aiChatbot')) {
          return NextResponse.json(
            {
              error: 'PLAN_REQUIRED',
              message: `Tính năng AI Chatbot yêu cầu gói Pro trở lên. Gói hiện tại của bạn: ${plan}.`,
              requiredPlan: PlanTier.PRO,
              currentPlan: plan,
            },
            { status: 403 }
          );
        }

        context.landlordId = session.user.landlordId;
      } else if (session.user.role === 'TENANT' && session.user.tenantId) {
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
      }
    }

    const response = await chatbotService.chat(message, context);
    return NextResponse.json({ response }, { status: 200 });
  } catch (error: any) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      {
        error: 'Đã xảy ra lỗi khi xử lý yêu cầu',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
