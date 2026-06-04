import type {
  AnalyticsOverview,
  RevenuePrediction,
  TrendAnalysis,
  Insight,
  Recommendation,
  ActionItem,
  GrowthInsight,
  PeakPeriod,
  MonthlyRevenue,
  OccupancyData,
} from '@/lib/types/analytics'

export class InsightsGeneratorService {
  /**
   * Analyze revenue growth and generate insights
   */
  async analyzeRevenueGrowth(data: MonthlyRevenue[]): Promise<GrowthInsight> {
    if (data.length < 2) {
      return {
        growthRate: 0,
        trend: 'stable',
        description: 'Insufficient data for growth analysis',
      }
    }

    const sorted = [...data].sort((a, b) => a.date.getTime() - b.date.getTime())
    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2))
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2))

    const firstTotal = firstHalf.reduce((sum, d) => sum + d.revenue, 0)
    const secondTotal = secondHalf.reduce((sum, d) => sum + d.revenue, 0)

    const growthRate = firstTotal > 0 ? ((secondTotal - firstTotal) / firstTotal) * 100 : 0

    let trend: 'positive' | 'negative' | 'stable'
    if (growthRate > 5) trend = 'positive'
    else if (growthRate < -5) trend = 'negative'
    else trend = 'stable'

    return {
      growthRate,
      trend,
      description: `Revenue ${trend === 'positive' ? 'increased' : trend === 'negative' ? 'decreased' : 'remained stable'} by ${Math.abs(growthRate).toFixed(1)}%`,
    }
  }

  /**
   * Identify peak occupancy periods
   */
  async identifyPeakPeriods(data: OccupancyData[]): Promise<PeakPeriod[]> {
    if (data.length === 0) {
      return []
    }

    const sorted = [...data].sort((a, b) => b.occupancyRate - a.occupancyRate)
    const top3 = sorted.slice(0, Math.min(3, sorted.length))

    return top3.map((d) => ({
      startDate: d.date,
      endDate: d.date,
      averageRate: d.occupancyRate,
      description: `Peak period: ${d.month}/${d.year} with ${d.occupancyRate.toFixed(1)}% occupancy`,
    }))
  }

  /**
   * Generate insights from analytics data
   */
  async generateInsights(
    metrics: AnalyticsOverview,
    predictions: RevenuePrediction,
    trends: TrendAnalysis
  ): Promise<Insight[]> {
    const insights: Insight[] = []

    // Insight 1: Occupancy rate analysis
    if (metrics.occupancyRate < 70) {
      insights.push({
        id: `insight-${Date.now()}-1`,
        type: 'warning',
        title: 'Low Occupancy Rate',
        description: `Occupancy rate is ${metrics.occupancyRate.toFixed(1)}%, below the 70% threshold. Consider marketing campaigns or adjusting pricing.`,
        impact: 'high',
        actionable: true,
      })
    } else if (metrics.occupancyRate > 90) {
      insights.push({
        id: `insight-${Date.now()}-2`,
        type: 'positive',
        title: 'High Occupancy Rate',
        description: `Excellent occupancy rate of ${metrics.occupancyRate.toFixed(1)}%. Consider increasing prices or expanding capacity.`,
        impact: 'high',
        actionable: false,
      })
    }

    // Insight 2: Revenue growth analysis
    if (metrics.revenueGrowth < -5) {
      insights.push({
        id: `insight-${Date.now()}-3`,
        type: 'negative',
        title: 'Revenue Decline',
        description: `Revenue decreased by ${Math.abs(metrics.revenueGrowth).toFixed(1)}%. Review pricing strategy and tenant satisfaction.`,
        impact: 'high',
        actionable: true,
      })
    } else if (metrics.revenueGrowth > 10) {
      insights.push({
        id: `insight-${Date.now()}-4`,
        type: 'positive',
        title: 'Strong Revenue Growth',
        description: `Revenue increased by ${metrics.revenueGrowth.toFixed(1)}%. Maintain current strategies.`,
        impact: 'medium',
        actionable: false,
      })
    }

    // Insight 3: Prediction confidence
    if (predictions.confidenceLevel < 60) {
      insights.push({
        id: `insight-${Date.now()}-5`,
        type: 'warning',
        title: 'Low Prediction Confidence',
        description: `Predictions have ${predictions.confidenceLevel}% confidence. More historical data needed for accurate forecasting.`,
        impact: 'low',
        actionable: false,
      })
    }

    // Insight 4: Occupancy trend
    if (metrics.occupancyTrend === 'decreasing') {
      insights.push({
        id: `insight-${Date.now()}-6`,
        type: 'warning',
        title: 'Declining Occupancy Trend',
        description: 'Occupancy rate is trending downward. Take action to attract and retain tenants.',
        impact: 'high',
        actionable: true,
      })
    } else if (metrics.occupancyTrend === 'increasing') {
      insights.push({
        id: `insight-${Date.now()}-7`,
        type: 'positive',
        title: 'Growing Occupancy',
        description: 'Occupancy rate is trending upward. Continue current tenant acquisition strategies.',
        impact: 'medium',
        actionable: false,
      })
    }

    // Insight 5: Seasonal patterns
    if (trends.seasonalPatterns.length > 0) {
      const highestSeason = trends.seasonalPatterns.reduce((max, pattern) =>
        pattern.averageOccupancy > max.averageOccupancy ? pattern : max
      )
      const lowestSeason = trends.seasonalPatterns.reduce((min, pattern) =>
        pattern.averageOccupancy < min.averageOccupancy ? pattern : min
      )

      if (highestSeason.averageOccupancy - lowestSeason.averageOccupancy > 20) {
        insights.push({
          id: `insight-${Date.now()}-8`,
          type: 'neutral',
          title: 'Strong Seasonal Variation',
          description: `${highestSeason.season} has highest occupancy (${highestSeason.averageOccupancy.toFixed(1)}%) while ${lowestSeason.season} has lowest (${lowestSeason.averageOccupancy.toFixed(1)}%). Adjust pricing seasonally.`,
          impact: 'medium',
          actionable: true,
        })
      }
    }

    return insights
  }

  /**
   * Generate recommendations based on analysis
   */
  async generateRecommendations(
    landlordId: string,
    metrics: AnalyticsOverview,
    predictions: RevenuePrediction,
    trends: TrendAnalysis
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = []

    // Recommendation 1: Low occupancy
    if (metrics.occupancyRate < 70) {
      recommendations.push({
        id: `rec-${Date.now()}-1`,
        landlordId,
        type: 'occupancy',
        priority: 'high',
        title: 'Improve Occupancy Rate',
        description: 'Current occupancy is below optimal levels. Implement strategies to attract more tenants.',
        expectedImpact: `Increase occupancy by 10-15% could add ${(metrics.averageRoomPrice * (metrics.totalRooms - metrics.occupiedRooms) * 0.15).toFixed(0)} to monthly revenue`,
        actionItems: [
          {
            id: `action-${Date.now()}-1`,
            description: 'Launch targeted marketing campaign on social media',
            completed: false,
          },
          {
            id: `action-${Date.now()}-2`,
            description: 'Offer move-in specials or discounts',
            completed: false,
          },
          {
            id: `action-${Date.now()}-3`,
            description: 'Improve property photos and descriptions',
            completed: false,
          },
        ],
        basedOn: ['occupancy_rate', 'occupancy_trend'],
        createdAt: new Date(),
      })
    }

    // Recommendation 2: Revenue decline
    if (metrics.revenueGrowth < -5) {
      recommendations.push({
        id: `rec-${Date.now()}-2`,
        landlordId,
        type: 'revenue',
        priority: 'high',
        title: 'Address Revenue Decline',
        description: 'Revenue has decreased significantly. Review pricing and tenant satisfaction.',
        expectedImpact: 'Stabilize revenue and prevent further decline',
        actionItems: [
          {
            id: `action-${Date.now()}-4`,
            description: 'Conduct tenant satisfaction survey',
            completed: false,
          },
          {
            id: `action-${Date.now()}-5`,
            description: 'Review and adjust pricing strategy',
            completed: false,
          },
          {
            id: `action-${Date.now()}-6`,
            description: 'Analyze competitor pricing',
            completed: false,
          },
        ],
        basedOn: ['revenue_growth', 'revenue_trend'],
        createdAt: new Date(),
      })
    }

    // Recommendation 3: High occupancy - consider price increase
    if (metrics.occupancyRate > 90 && metrics.revenueGrowth > 0) {
      recommendations.push({
        id: `rec-${Date.now()}-3`,
        landlordId,
        type: 'pricing',
        priority: 'medium',
        title: 'Consider Price Optimization',
        description: 'High occupancy rate indicates strong demand. Consider modest price increases.',
        expectedImpact: `5% price increase could add ${(metrics.totalRevenue * 0.05).toFixed(0)} to annual revenue`,
        actionItems: [
          {
            id: `action-${Date.now()}-7`,
            description: 'Research market rates for similar properties',
            completed: false,
          },
          {
            id: `action-${Date.now()}-8`,
            description: 'Implement gradual price increase for new leases',
            completed: false,
          },
        ],
        basedOn: ['occupancy_rate', 'revenue_growth'],
        createdAt: new Date(),
      })
    }

    // Recommendation 4: Seasonal pricing
    if (trends.seasonalPatterns.length > 0) {
      const highestSeason = trends.seasonalPatterns.reduce((max, pattern) =>
        pattern.averageOccupancy > max.averageOccupancy ? pattern : max
      )

      recommendations.push({
        id: `rec-${Date.now()}-4`,
        landlordId,
        type: 'pricing',
        priority: 'medium',
        title: 'Implement Seasonal Pricing',
        description: `${highestSeason.season} shows highest demand. Adjust pricing based on seasonal patterns.`,
        expectedImpact: 'Optimize revenue throughout the year',
        actionItems: [
          {
            id: `action-${Date.now()}-9`,
            description: `Increase prices during ${highestSeason.season} peak season`,
            completed: false,
          },
          {
            id: `action-${Date.now()}-10`,
            description: 'Offer promotions during low seasons',
            completed: false,
          },
        ],
        basedOn: ['seasonal_patterns'],
        createdAt: new Date(),
      })
    }

    // Recommendation 5: Maintenance and improvements
    if (metrics.occupancyRate < 80 || metrics.revenueGrowth < 0) {
      recommendations.push({
        id: `rec-${Date.now()}-5`,
        landlordId,
        type: 'maintenance',
        priority: 'low',
        title: 'Property Improvements',
        description: 'Consider property upgrades to attract and retain tenants.',
        expectedImpact: 'Improve tenant satisfaction and occupancy rates',
        actionItems: [
          {
            id: `action-${Date.now()}-11`,
            description: 'Assess property condition and identify needed repairs',
            completed: false,
          },
          {
            id: `action-${Date.now()}-12`,
            description: 'Upgrade amenities based on tenant feedback',
            completed: false,
          },
        ],
        basedOn: ['occupancy_rate', 'revenue_growth'],
        createdAt: new Date(),
      })
    }

    // Sort by priority
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }
}

export const insightsGeneratorService = new InsightsGeneratorService()
