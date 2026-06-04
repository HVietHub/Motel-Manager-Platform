import { dataAggregatorService } from './data-aggregator.service'
import { predictionEngineService } from './prediction-engine.service'
import type {
  TimeRange,
  AnalyticsOverview,
  OccupancyMetrics,
  RevenueMetrics,
  RevenuePrediction,
  SeasonalPattern,
  OccupancyData,
  TrendDirection,
  PeakPeriod,
} from '@/lib/types/analytics'

export class AnalyticsService {
  /**
   * Calculate occupancy rate for a landlord
   * Returns value between 0 and 100
   */
  async calculateOccupancyRate(
    landlordId: string,
    timeRange: TimeRange
  ): Promise<OccupancyMetrics> {
    const rooms = await dataAggregatorService.getRoomStatistics(landlordId)
    const totalRooms = rooms.length

    if (totalRooms === 0) {
      return {
        currentRate: 0,
        averageRate: 0,
        trend: 'stable',
        peakPeriod: this.createEmptyPeakPeriod(),
        lowPeriod: this.createEmptyPeakPeriod(),
      }
    }

    const occupancyData = await dataAggregatorService.calculateOccupancyByPeriod(
      landlordId,
      timeRange
    )

    if (occupancyData.length === 0) {
      const occupiedRooms = rooms.filter((r) => r.tenantId !== null).length
      const currentRate = (occupiedRooms / totalRooms) * 100

      return {
        currentRate: Math.min(100, Math.max(0, currentRate)),
        averageRate: currentRate,
        trend: 'stable',
        peakPeriod: this.createEmptyPeakPeriod(),
        lowPeriod: this.createEmptyPeakPeriod(),
      }
    }

    const currentRate = occupancyData[occupancyData.length - 1].occupancyRate
    const averageRate =
      occupancyData.reduce((sum, d) => sum + d.occupancyRate, 0) / occupancyData.length

    // Find peak and low periods
    const sortedByRate = [...occupancyData].sort(
      (a, b) => b.occupancyRate - a.occupancyRate
    )
    const peakData = sortedByRate[0]
    const lowData = sortedByRate[sortedByRate.length - 1]

    const peakPeriod: PeakPeriod = {
      startDate: peakData.date,
      endDate: peakData.date,
      averageRate: peakData.occupancyRate,
      description: `Peak occupancy in ${peakData.month}/${peakData.year}`,
    }

    const lowPeriod: PeakPeriod = {
      startDate: lowData.date,
      endDate: lowData.date,
      averageRate: lowData.occupancyRate,
      description: `Low occupancy in ${lowData.month}/${lowData.year}`,
    }

    const trend = this.determineTrend(occupancyData.map((d) => d.occupancyRate))

    return {
      currentRate: Math.min(100, Math.max(0, currentRate)),
      averageRate: Math.min(100, Math.max(0, averageRate)),
      trend,
      peakPeriod,
      lowPeriod,
    }
  }

  /**
   * Calculate revenue metrics for a landlord
   */
  async calculateRevenueMetrics(
    landlordId: string,
    timeRange: TimeRange
  ): Promise<RevenueMetrics> {
    const invoices = await dataAggregatorService.getInvoiceHistory(landlordId, timeRange)

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)

    // Calculate monthly average
    const monthsDiff = this.getMonthsDifference(timeRange.startDate, timeRange.endDate)
    const averageMonthlyRevenue = monthsDiff > 0 ? totalRevenue / monthsDiff : totalRevenue

    // Calculate growth rate (compare first half vs second half)
    const growthRate = this.calculateGrowthRate(invoices)
    const trend = this.determineTrend(invoices.map((inv) => inv.totalAmount))

    return {
      totalRevenue: Math.max(0, totalRevenue),
      averageMonthlyRevenue: Math.max(0, averageMonthlyRevenue),
      growthRate,
      trend,
    }
  }

  /**
   * Predict future revenue for a landlord
   */
  async predictFutureRevenue(
    landlordId: string,
    months: number
  ): Promise<RevenuePrediction> {
    const monthlyRevenue = await dataAggregatorService.aggregateMonthlyRevenue(
      landlordId,
      12 // Use last 12 months for prediction
    )

    if (monthlyRevenue.length < 3) {
      throw new Error('Insufficient data for prediction. Minimum 3 months required.')
    }

    const prediction = await predictionEngineService.predictRevenue(
      monthlyRevenue,
      months
    )

    return {
      ...prediction,
      landlordId,
    }
  }

  /**
   * Detect seasonal patterns in occupancy and revenue
   */
  async detectSeasonalPatterns(landlordId: string, timeRange?: TimeRange): Promise<SeasonalPattern[]> {
    const defaultTimeRange = timeRange || {
      startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
      endDate: new Date(),
    }

    const occupancyData = await dataAggregatorService.calculateOccupancyByPeriod(
      landlordId,
      defaultTimeRange
    )

    if (occupancyData.length === 0) {
      return []
    }

    const monthlyRevenue = await dataAggregatorService.aggregateMonthlyRevenue(
      landlordId,
      12,
      defaultTimeRange
    )

    // Group by season
    const seasons: {
      [key: string]: { months: number[]; occupancy: number[]; revenue: number[] }
    } = {
      spring: { months: [3, 4, 5], occupancy: [], revenue: [] },
      summer: { months: [6, 7, 8], occupancy: [], revenue: [] },
      fall: { months: [9, 10, 11], occupancy: [], revenue: [] },
      winter: { months: [12, 1, 2], occupancy: [], revenue: [] },
    }

    occupancyData.forEach((data) => {
      const season = this.getSeasonForMonth(data.month)
      if (season) {
        seasons[season].occupancy.push(data.occupancyRate)
      }
    })

    monthlyRevenue.forEach((data) => {
      const season = this.getSeasonForMonth(data.month)
      if (season) {
        seasons[season].revenue.push(data.revenue)
      }
    })

    // Create patterns
    const patterns: SeasonalPattern[] = []

    Object.entries(seasons).forEach(([seasonName, data]) => {
      if (data.occupancy.length > 0) {
        const avgOccupancy =
          data.occupancy.reduce((sum, v) => sum + v, 0) / data.occupancy.length
        const avgRevenue =
          data.revenue.length > 0
            ? data.revenue.reduce((sum, v) => sum + v, 0) / data.revenue.length
            : 0

        patterns.push({
          season: seasonName as 'spring' | 'summer' | 'fall' | 'winter',
          months: data.months,
          averageOccupancy: Math.max(0, avgOccupancy),
          averageRevenue: Math.max(0, avgRevenue),
          description: `${seasonName.charAt(0).toUpperCase() + seasonName.slice(1)} season`,
        })
      }
    })

    return patterns
  }

  /**
   * Get analytics overview for a landlord
   */
  async getOverview(
    landlordId: string,
    timeRange?: TimeRange
  ): Promise<AnalyticsOverview> {
    const defaultTimeRange: TimeRange = timeRange || {
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 12)),
      endDate: new Date(),
    }

    const rooms = await dataAggregatorService.getRoomStatistics(landlordId)
    const totalRooms = rooms.length
    const occupiedRooms = rooms.filter((r) => r.tenantId !== null).length

    const occupancyMetrics = await this.calculateOccupancyRate(
      landlordId,
      defaultTimeRange
    )
    const revenueMetrics = await this.calculateRevenueMetrics(
      landlordId,
      defaultTimeRange
    )

    const averageRoomPrice =
      totalRooms > 0
        ? rooms.reduce((sum, r) => sum + r.price, 0) / totalRooms
        : 0

    return {
      landlordId,
      timeRange: defaultTimeRange,
      occupancyRate: occupancyMetrics.currentRate,
      totalRevenue: revenueMetrics.totalRevenue,
      averageRoomPrice: Math.max(0, averageRoomPrice),
      totalRooms,
      occupiedRooms,
      revenueGrowth: revenueMetrics.growthRate,
      occupancyTrend: occupancyMetrics.trend,
      generatedAt: new Date(),
    }
  }

  // Helper methods

  private createEmptyPeakPeriod(): PeakPeriod {
    return {
      startDate: new Date(),
      endDate: new Date(),
      averageRate: 0,
      description: 'No data available',
    }
  }

  private determineTrend(values: number[]): TrendDirection {
    if (values.length < 2) {
      return 'stable'
    }

    // Calculate trend using linear regression slope
    const n = values.length
    let sumX = 0
    let sumY = 0
    let sumXY = 0
    let sumX2 = 0

    values.forEach((value, index) => {
      sumX += index
      sumY += value
      sumXY += index * value
      sumX2 += index * index
    })

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)

    // Calculate volatility (standard deviation)
    const mean = sumY / n
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n
    const stdDev = Math.sqrt(variance)
    const coefficientOfVariation = mean !== 0 ? stdDev / mean : 0

    if (coefficientOfVariation > 0.3) {
      return 'volatile'
    }

    if (Math.abs(slope) < 0.01) {
      return 'stable'
    }

    return slope > 0 ? 'increasing' : 'decreasing'
  }

  private calculateGrowthRate(invoices: any[]): number {
    if (invoices.length < 2) {
      return 0
    }

    // Sort by date
    const sorted = [...invoices].sort((a, b) => {
      const dateA = new Date(a.year, a.month - 1)
      const dateB = new Date(b.year, b.month - 1)
      return dateA.getTime() - dateB.getTime()
    })

    // Compare first half vs second half
    const midPoint = Math.floor(sorted.length / 2)
    const firstHalf = sorted.slice(0, midPoint)
    const secondHalf = sorted.slice(midPoint)

    const firstHalfTotal = firstHalf.reduce((sum, inv) => sum + inv.totalAmount, 0)
    const secondHalfTotal = secondHalf.reduce((sum, inv) => sum + inv.totalAmount, 0)

    if (firstHalfTotal === 0) {
      return secondHalfTotal > 0 ? 100 : 0
    }

    return ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100
  }

  private getMonthsDifference(startDate: Date, endDate: Date): number {
    const months =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth())
    return Math.max(1, months)
  }

  private getSeasonForMonth(
    month: number
  ): 'spring' | 'summer' | 'fall' | 'winter' | null {
    if (month >= 3 && month <= 5) return 'spring'
    if (month >= 6 && month <= 8) return 'summer'
    if (month >= 9 && month <= 11) return 'fall'
    if (month === 12 || month === 1 || month === 2) return 'winter'
    return null
  }
}

export const analyticsService = new AnalyticsService()
