import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { analyticsService } from '@/lib/services/analytics/analytics.service'
import { insightsGeneratorService } from '@/lib/services/analytics/insights-generator.service'
import { dataAggregatorService } from '@/lib/services/analytics/data-aggregator.service'
import { handleApiError } from '@/lib/errors/api-error-handler'
import { prisma } from '@/lib/prisma'
import { PlanTier, planHasFeature } from '@/lib/constants/plans'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    // Plan gate: advanced analytics requires PRO+
    const landlord = await (prisma.landlord.findUnique as any)({
      where: { id: landlordId },
      select: { plan: true },
    })
    const plan = (landlord?.plan as PlanTier) ?? PlanTier.FREE

    if (!planHasFeature(plan, 'advancedAnalytics')) {
      return NextResponse.json(
        {
          error: 'PLAN_REQUIRED',
          message: `Tính năng phân tích nâng cao yêu cầu gói Pro trở lên. Gói hiện tại: ${plan}.`,
          requiredPlan: PlanTier.PRO,
          currentPlan: plan,
        },
        { status: 403 }
      )
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

    const result = {
      ...trendAnalysis,
      insights
    }

    return NextResponse.json(result, { status: 200 })
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
