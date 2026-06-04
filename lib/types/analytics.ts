// Analytics Types for AI Phân Tích và Dự Đoán

export interface TimeRange {
  startDate: Date
  endDate: Date
}

export interface AnalyticsOverview {
  landlordId: string
  timeRange: TimeRange
  occupancyRate: number
  totalRevenue: number
  averageRoomPrice: number
  totalRooms: number
  occupiedRooms: number
  revenueGrowth: number
  occupancyTrend: TrendDirection
  generatedAt: Date
}

export interface MonthlyPrediction {
  month: number
  year: number
  predictedRevenue: number
  lowerBound: number
  upperBound: number
  confidence: number
}

export interface RevenuePrediction {
  landlordId: string
  predictions: MonthlyPrediction[]
  totalPredicted: number
  confidenceLevel: number
  methodology: 'linear_regression' | 'moving_average' | 'exponential_smoothing'
  generatedAt: Date
}

export interface OccupancyDataPoint {
  date: Date
  occupancyRate: number
  occupiedRooms: number
  totalRooms: number
}

export interface PeakPeriod {
  startDate: Date
  endDate: Date
  averageRate: number
  description: string
}

export interface TrendData {
  direction: 'increasing' | 'decreasing' | 'stable' | 'volatile'
  rate: number
}

export interface OccupancyAnalysis {
  landlordId: string
  timeRange: TimeRange
  currentOccupancyRate: number
  historicalData: OccupancyDataPoint[]
  averageOccupancy: number
  peakOccupancyPeriod: PeakPeriod
  lowOccupancyPeriod: PeakPeriod
  trend: TrendData
}

export interface SeasonalPattern {
  season: 'spring' | 'summer' | 'fall' | 'winter'
  months: number[]
  averageOccupancy: number
  averageRevenue: number
  description: string
}

export interface Insight {
  id: string
  type: 'positive' | 'negative' | 'neutral' | 'warning'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  actionable: boolean
}

export type TrendDirection = 'increasing' | 'decreasing' | 'stable' | 'volatile'

export interface TrendAnalysis {
  landlordId: string
  seasonalPatterns: SeasonalPattern[]
  revenueGrowthRate: number
  occupancyTrend: TrendDirection
  insights: Insight[]
  generatedAt: Date
}

export interface ActionItem {
  id: string
  description: string
  completed: boolean
  dueDate?: Date
}

export interface Recommendation {
  id: string
  landlordId: string
  type: 'pricing' | 'marketing' | 'maintenance' | 'occupancy' | 'revenue'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  expectedImpact: string
  actionItems: ActionItem[]
  basedOn: string[]
  createdAt: Date
}

// Data Aggregator Types
export interface ContractData {
  id: string
  roomId: string
  tenantId: string
  startDate: Date
  endDate: Date
  rentAmount: number
  status: string
}

export interface InvoiceData {
  id: string
  tenantId: string
  month: number
  year: number
  totalAmount: number
  status: string
  paidDate: Date | null
}

export interface RoomStats {
  id: string
  buildingId: string
  status: string
  price: number
  tenantId: string | null
}

export interface MonthlyRevenue {
  month: number
  year: number
  revenue: number
  date: Date
}

export interface OccupancyData {
  date: Date
  occupancyRate: number
  occupiedRooms: number
  totalRooms: number
  month: number
  year: number
}

// Prediction Engine Types
export interface TimeSeriesData {
  date: Date
  value: number
}

export interface Anomaly {
  date: Date
  value: number
  expectedValue: number
  deviation: number
}

export interface ConfidenceInterval {
  lowerBound: number
  upperBound: number
  confidence: number
}

export interface PredictionResult {
  predictions: MonthlyPrediction[]
  totalPredicted: number
  confidenceLevel: number
  methodology: string
}

export interface OccupancyPrediction {
  predictions: Array<{
    month: number
    year: number
    predictedOccupancy: number
    lowerBound: number
    upperBound: number
    confidence: number
  }>
  averagePredicted: number
  confidenceLevel: number
}

// Insights Generator Types
export interface GrowthInsight {
  growthRate: number
  trend: 'positive' | 'negative' | 'stable'
  description: string
}

export interface BenchmarkComparison {
  metric: string
  value: number
  benchmark: number
  percentageDifference: number
  status: 'above' | 'below' | 'at'
}

export interface AnalysisResult {
  metrics: AnalyticsOverview
  predictions: RevenuePrediction
  trends: TrendAnalysis
}

// Metrics Types
export interface OccupancyMetrics {
  currentRate: number
  averageRate: number
  trend: TrendDirection
  peakPeriod: PeakPeriod
  lowPeriod: PeakPeriod
}

export interface RevenueMetrics {
  totalRevenue: number
  averageMonthlyRevenue: number
  growthRate: number
  trend: TrendDirection
}
