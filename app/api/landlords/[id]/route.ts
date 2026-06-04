import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const landlord = await prisma.landlord.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, email: true },
        },
        buildings: {
          include: {
            rooms: {
              include: {
                tenant: { select: { id: true } },
              },
            },
          },
        },
      },
    })

    if (!landlord) {
      return NextResponse.json({ error: 'Landlord not found' }, { status: 404 })
    }

    // Compute stats
    const totalBuildings = landlord.buildings.length
    const totalRooms = landlord.buildings.reduce((sum, b) => sum + b.rooms.length, 0)
    const totalTenants = landlord.buildings.reduce(
      (sum, b) => sum + b.rooms.filter((r) => r.tenant !== null).length,
      0
    )

    return NextResponse.json({ ...landlord, stats: { totalBuildings, totalRooms, totalTenants } })
  } catch (error) {
    console.error('Get landlord error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    const { name, phone, address } = body

    // Verify ownership
    const landlord = await prisma.landlord.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!landlord) {
      return NextResponse.json({ error: 'Landlord not found' }, { status: 404 })
    }

    if (landlord.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update landlord phone/address
    const updated = await prisma.landlord.update({
      where: { id },
      data: {
        phone: phone ?? undefined,
        address: address ?? undefined,
        user: name ? { update: { name } } : undefined,
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update landlord error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
