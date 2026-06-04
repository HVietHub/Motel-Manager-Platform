import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { getPayos } from '@/lib/payos'
import { PLAN_LIMITS, PlanTier } from '@/lib/constants/plans'

type SubscriptionPayment = {
  id: string
}

type SubscriptionPaymentClient = {
  create(args: unknown): Promise<SubscriptionPayment>
  update(args: unknown): Promise<SubscriptionPayment>
}

type PrismaWithSubscriptionPayment = typeof prisma & {
  subscriptionPayment: SubscriptionPaymentClient
}

const db = prisma as PrismaWithSubscriptionPayment
const purchasablePlans = [PlanTier.STARTER, PlanTier.PRO]

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'LANDLORD' || !session.user.landlordId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan } = await request.json()
    if (!purchasablePlans.includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const amount = PLAN_LIMITS[plan as PlanTier].priceVnd
    const origin = new URL(request.url).origin
    const orderCode = Number(`${Date.now()}`.slice(-9))
    const description = `HouseSea ${plan}`.slice(0, 25)

    const payment = await db.subscriptionPayment.create({
      data: {
        landlordId: session.user.landlordId,
        plan,
        orderCode,
        amount,
      },
    })

    const paymentLink = await getPayos().paymentRequests.create({
      orderCode,
      amount,
      description,
      returnUrl: `${origin}/landlord/payment?orderCode=${orderCode}`,
      cancelUrl: `${origin}/landlord/payment?cancelled=1`,
      items: [
        {
          name: `Gói ${plan}`,
          quantity: 1,
          price: amount,
        },
      ],
    })

    await db.subscriptionPayment.update({
      where: { id: payment.id },
      data: {
        paymentLinkId: paymentLink.paymentLinkId,
        checkoutUrl: paymentLink.checkoutUrl,
      },
    })

    return NextResponse.json({ checkoutUrl: paymentLink.checkoutUrl })
  } catch (error) {
    console.error('Create PayOS checkout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
