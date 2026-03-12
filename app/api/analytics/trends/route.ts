import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { analyticsService } from '@/lib/services/analytics.service'
import { insightsGeneratorService } from '@/lib/services/insights-generator.service'
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
    const year = searchParams.get('year')

    let timeRange
    if (year) {
      const yearNum = parseInt(year)
      timeRange = {
        startDate: new Date(yearNum, 0, 1),
        endDate: new Date(yearNum, 11, 31, 23, 59, 59),
      }
    } else {
      timeRange = {
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 12)),
        endDate: new Date(),
      }
    }

    // Get seasonal patterns
    const seasonalPatterns = await analyticsService.detectSeasonalPatterns(landlordId, timeRange)

    // Get revenue growth
    const monthlyRevenue = await dataAggregatorService.aggregateMonthlyRevenue(
      landlordId,
      12,
      timeRange
    )
    const revenueGrowth = await insightsGeneratorService.analyzeRevenueGrowth(monthlyRevenue)

    // Get occupancy trend
    const occupancyMetrics = await analyticsService.calculateOccupancyRate(
      landlordId,
      timeRange
    )

    // Get overview for insights
    const overview = await analyticsService.getOverview(landlordId, timeRange)
    const predictions = await analyticsService.predictFutureRevenue(landlordId, 6)

    const trendAnalysis = {
      landlordId,
      seasonalPatterns,
      revenueGrowthRate: revenueGrowth.growthRate,
      occupancyTrend: occupancyMetrics.trend,
      insights: [],
      generatedAt: new Date(),
    }

    // Generate insights
    const insights = await insightsGeneratorService.generateInsights(
      overview,
      predictions,
      trendAnalysis
    )

    trendAnalysis.insights = insights

    return NextResponse.json(trendAnalysis, { status: 200 })
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
