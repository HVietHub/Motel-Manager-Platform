import type {
  MonthlyRevenue,
  RevenuePrediction,
  MonthlyPrediction,
  OccupancyData,
  OccupancyPrediction,
  TimeSeriesData,
  Anomaly,
  ConfidenceInterval,
} from '@/lib/types/analytics'

export class PredictionEngineService {
  /**
   * Predict future revenue using linear regression
   * Requires at least 3 months of historical data
   */
  async predictRevenue(
    historicalData: MonthlyRevenue[],
    months: number
  ): Promise<RevenuePrediction> {
    if (historicalData.length < 3) {
      throw new Error('Insufficient data for prediction. Minimum 3 months required.')
    }

    if (months < 1 || months > 24) {
      throw new Error('Prediction months must be between 1 and 24')
    }

    // Sort data by date
    const sortedData = [...historicalData].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    )

    // Calculate linear regression
    const n = sortedData.length
    let sumX = 0
    let sumY = 0
    let sumXY = 0
    let sumX2 = 0

    sortedData.forEach((data, index) => {
      const x = index
      const y = data.revenue
      sumX += x
      sumY += y
      sumXY += x * y
      sumX2 += x * x
    })

    // Calculate slope and intercept
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    // Calculate standard error for confidence intervals
    const standardError = this.calculateStandardError(sortedData, slope, intercept)

    // Generate predictions
    const predictions: MonthlyPrediction[] = []
    const lastDate = sortedData[sortedData.length - 1].date

    for (let i = 1; i <= months; i++) {
      const x = n + i - 1
      const predictedValue = slope * x + intercept

      // Calculate confidence interval (95% confidence = 1.96 * SE)
      const margin = 1.96 * standardError
      const confidence = this.calculateConfidence(standardError, predictedValue)

      const futureDate = new Date(lastDate)
      futureDate.setMonth(futureDate.getMonth() + i)

      predictions.push({
        month: futureDate.getMonth() + 1,
        year: futureDate.getFullYear(),
        predictedRevenue: Math.max(0, predictedValue),
        lowerBound: Math.max(0, predictedValue - margin),
        upperBound: predictedValue + margin,
        confidence: Math.min(1, Math.max(0, confidence)),
      })
    }

    const totalPredicted = predictions.reduce(
      (sum, p) => sum + p.predictedRevenue,
      0
    )

    // Calculate overall confidence level (0-100)
    const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length
    const confidenceLevel = Math.round(avgConfidence * 100)

    return {
      landlordId: '', // Will be set by caller
      predictions,
      totalPredicted,
      confidenceLevel,
      methodology: 'linear_regression',
      generatedAt: new Date(),
    }
  }

  /**
   * Predict future occupancy rates
   */
  async predictOccupancy(
    historicalData: OccupancyData[],
    months: number
  ): Promise<OccupancyPrediction> {
    if (historicalData.length < 3) {
      throw new Error('Insufficient data for prediction. Minimum 3 months required.')
    }

    // Convert to time series data
    const timeSeriesData: MonthlyRevenue[] = historicalData.map((data) => ({
      month: data.month,
      year: data.year,
      revenue: data.occupancyRate,
      date: data.date,
    }))

    // Use revenue prediction logic for occupancy
    const revenuePrediction = await this.predictRevenue(timeSeriesData, months)

    const predictions = revenuePrediction.predictions.map((pred) => ({
      month: pred.month,
      year: pred.year,
      predictedOccupancy: Math.min(100, Math.max(0, pred.predictedRevenue)),
      lowerBound: Math.min(100, Math.max(0, pred.lowerBound)),
      upperBound: Math.min(100, Math.max(0, pred.upperBound)),
      confidence: pred.confidence,
    }))

    const averagePredicted =
      predictions.reduce((sum, p) => sum + p.predictedOccupancy, 0) / predictions.length

    return {
      predictions,
      averagePredicted,
      confidenceLevel: revenuePrediction.confidenceLevel,
    }
  }

  /**
   * Detect anomalies in time series data
   */
  async detectAnomalies(data: TimeSeriesData[]): Promise<Anomaly[]> {
    if (data.length < 3) {
      return []
    }

    const anomalies: Anomaly[] = []

    // Calculate mean and standard deviation
    const values = data.map((d) => d.value)
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length
    const variance =
      values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)

    // Detect anomalies (values more than 2 standard deviations from mean)
    data.forEach((point) => {
      const deviation = Math.abs(point.value - mean)
      if (deviation > 2 * stdDev) {
        anomalies.push({
          date: point.date,
          value: point.value,
          expectedValue: mean,
          deviation,
        })
      }
    })

    return anomalies
  }

  /**
   * Calculate confidence interval for a prediction
   */
  calculateConfidenceInterval(
    prediction: number,
    historicalData: number[]
  ): ConfidenceInterval {
    if (historicalData.length === 0) {
      return {
        lowerBound: prediction,
        upperBound: prediction,
        confidence: 0,
      }
    }

    const mean = historicalData.reduce((sum, v) => sum + v, 0) / historicalData.length
    const variance =
      historicalData.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
      historicalData.length
    const stdDev = Math.sqrt(variance)

    // 95% confidence interval
    const margin = 1.96 * stdDev

    return {
      lowerBound: Math.max(0, prediction - margin),
      upperBound: prediction + margin,
      confidence: this.calculateConfidence(stdDev, prediction),
    }
  }

  /**
   * Calculate standard error for linear regression
   */
  private calculateStandardError(
    data: MonthlyRevenue[],
    slope: number,
    intercept: number
  ): number {
    const n = data.length
    let sumSquaredErrors = 0

    data.forEach((point, index) => {
      const predicted = slope * index + intercept
      const error = point.revenue - predicted
      sumSquaredErrors += error * error
    })

    return Math.sqrt(sumSquaredErrors / (n - 2))
  }

  /**
   * Calculate confidence score (0-1) based on standard error
   */
  private calculateConfidence(standardError: number, predictedValue: number): number {
    if (predictedValue === 0) {
      return 0
    }

    // Confidence decreases as relative error increases
    const relativeError = standardError / Math.abs(predictedValue)
    const confidence = Math.exp(-relativeError)

    return Math.min(1, Math.max(0, confidence))
  }
}

export const predictionEngineService = new PredictionEngineService()
