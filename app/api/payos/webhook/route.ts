import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { payos } from '@/lib/payos'

type SubscriptionPayment = {
  id: string
  landlordId: string
  plan: string
  status: string
}

type SubscriptionPaymentClient = {
  findUnique(args: unknown): Promise<SubscriptionPayment | null>
  update(args: unknown): Promise<SubscriptionPayment>
}

type PrismaWithSubscriptionPayment = typeof prisma & {
  subscriptionPayment: SubscriptionPaymentClient
}

const db = prisma as PrismaWithSubscriptionPayment

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = await payos.webhooks.verify(body)

    if (data.code !== '00') {
      return NextResponse.json({ ok: true })
    }

    const payment = await db.subscriptionPayment.findUnique({
      where: { orderCode: data.orderCode },
    })

    if (!payment || payment.status === 'PAID') {
      return NextResponse.json({ ok: true })
    }

    await prisma.$transaction([
      db.subscriptionPayment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          paymentLinkId: data.paymentLinkId,
        },
      }),
      prisma.landlord.update({
        where: { id: payment.landlordId },
        data: { plan: payment.plan },
      }),
    ])

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('PayOS webhook error:', error)
    return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 })
  }
}
