import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { analyticsService } from '@/lib/services/analytics.service'
import { insightsGeneratorService } from '@/lib/services/insights-generator.service'
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

    // Get analytics data
    const timeRange = {
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 12)),
      endDate: new Date(),
    }

    const overview = await analyticsService.getOverview(landlordId, timeRange)
    const predictions = await analyticsService.predictFutureRevenue(landlordId, 6)
    const seasonalPatterns = await analyticsService.detectSeasonalPatterns(landlordId)

    const trends = {
      landlordId,
      seasonalPatterns,
      revenueGrowthRate: overview.revenueGrowth,
      occupancyTrend: overview.occupancyTrend,
      insights: [],
      generatedAt: new Date(),
    }

    // Generate recommendations
    const recommendations = await insightsGeneratorService.generateRecommendations(
      landlordId,
      overview,
      predictions,
      trends
    )

    return NextResponse.json(recommendations, { status: 200 })
  } catch (error: any) {
    if (error.message.includes('Insufficient data')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    return handleApiError(error)
  }
}
