import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { getPayos } from '@/lib/payos'

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
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'LANDLORD' || !session.user.landlordId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderCode } = await request.json()
    const numericOrderCode = Number(orderCode)
    if (!Number.isInteger(numericOrderCode)) {
      return NextResponse.json({ error: 'Invalid order code' }, { status: 400 })
    }

    const payment = await db.subscriptionPayment.findUnique({
      where: { orderCode: numericOrderCode },
    })

    if (!payment || payment.landlordId !== session.user.landlordId) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (payment.status === 'PAID') {
      return NextResponse.json({ plan: payment.plan, status: payment.status })
    }

    const paymentLink = await getPayos().paymentRequests.get(numericOrderCode)
    if (paymentLink.status !== 'PAID') {
      return NextResponse.json({ status: paymentLink.status })
    }

    await prisma.$transaction([
      db.subscriptionPayment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      }),
      prisma.landlord.update({
        where: { id: payment.landlordId },
        data: { plan: payment.plan },
      }),
    ])

    return NextResponse.json({ plan: payment.plan, status: 'PAID' })
  } catch (error) {
    console.error('Confirm PayOS payment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
