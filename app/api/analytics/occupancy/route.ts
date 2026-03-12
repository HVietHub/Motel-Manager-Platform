import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { analyticsService } from '@/lib/services/analytics.service'
import { dataAggregatorService } from '@/lib/services/data-aggregator.service'
import { handleApiError } from '@/lib/api-error-handler'

export async function GET(request: NextRequest) {
  try {
    // Authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Authorization
    if (session.user.role !== 'LANDLORD') {
      return NextResponse.json(
        { error: 'Forbidden. Only landlords can access analytics.' },
        { status: 403 }
      )
    }

    const landlordId = session.user.landlordId
    if (!landlordId) {
      return NextResponse.json({ error: 'Landlord ID not found' }, { status: 404 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Default to last 12 months if not provided
    const timeRange = {
      startDate: startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 12)),
      endDate: endDate ? new Date(endDate) : new Date(),
    }

    // Validate time range
    if (timeRange.startDate > timeRange.endDate) {
      return NextResponse.json(
        { error: 'Invalid time range: startDate must be before endDate' },
        { status: 400 }
      )
    }

    // Get occupancy metrics and historical data
    const occupancyMetrics = await analyticsService.calculateOccupancyRate(
      landlordId,
      timeRange
    )

    const historicalData = await dataAggregatorService.calculateOccupancyByPeriod(
      landlordId,
      timeRange
    )

    if (historicalData.length < 3) {
      return NextResponse.json(
        { error: 'Insufficient data for occupancy analysis. Minimum 3 months required.' },
        { status: 400 }
      )
    }

    const averageOccupancy =
      historicalData.reduce((sum, d) => sum + d.occupancyRate, 0) / historicalData.length

    const analysis = {
      landlordId,
      timeRange,
      currentOccupancyRate: occupancyMetrics.currentRate,
      historicalData,
      averageOccupancy,
      peakOccupancyPeriod: occupancyMetrics.peakPeriod,
      lowOccupancyPeriod: occupancyMetrics.lowPeriod,
      trend: {
        direction: occupancyMetrics.trend,
        rate: occupancyMetrics.currentRate - averageOccupancy,
      },
    }

    return NextResponse.json(analysis, { status: 200 })
  } catch (error: any) {
    return handleApiError(error)
  }
}
