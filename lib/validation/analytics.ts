import { z } from 'zod'

// Time Range Schema
export const timeRangeSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine(
  (data) => data.startDate <= data.endDate,
  { message: 'startDate must be less than or equal to endDate' }
)

// Analytics Overview Schema
export const analyticsOverviewSchema = z.object({
  landlordId: z.string().min(1, 'landlordId is required'),
  timeRange: timeRangeSchema,
  occupancyRate: z.number().min(0).max(100),
  totalRevenue: z.number().min(0),
  averageRoomPrice: z.number().min(0),
  totalRooms: z.number().int().positive(),
  occupiedRooms: z.number().int().min(0),
  revenueGrowth: z.number(),
  occupancyTrend: z.enum(['increasing', 'decreasing', 'stable']),
  generatedAt: z.date(),
}).refine(
  (data) => data.occupiedRooms <= data.totalRooms,
  { message: 'occupiedRooms cannot exceed totalRooms' }
)

// Revenue Prediction Schema
export const monthlyPredictionSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(new Date().getFullYear()),
  predictedRevenue: z.number().min(0),
  lowerBound: z.number().min(0),
  upperBound: z.number().min(0),
  confidence: z.number().min(0).max(1),
}).refine(
  (data) => data.lowerBound <= data.predictedRevenue && data.predictedRevenue <= data.upperBound,
  { message: 'lowerBound <= predictedRevenue <= upperBound must hold' }
)

export const revenuePredictionSchema = z.object({
  landlordId: z.string().min(1),
  predictions: z.array(monthlyPredictionSchema).min(1),
  totalPredicted: z.number().min(0),
  confidenceLevel: z.number().min(0).max(100),
  methodology: z.enum(['linear_regression', 'moving_average', 'exponential_smoothing']),
  generatedAt: z.date(),
})

// Occupancy Analysis Schema
export const occupancyDataPointSchema = z.object({
  date: z.date(),
  occupancyRate: z.number().min(0).max(100),
  occupiedRooms: z.number().int().min(0),
  totalRooms: z.number().int().positive(),
}).refine(
  (data) => data.occupiedRooms <= data.totalRooms,
  { message: 'occupiedRooms cannot exceed totalRooms' }
)

export const peakPeriodSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  averageRate: z.number().min(0).max(100),
  description: z.string(),
})

export const occupancyAnalysisSchema = z.object({
  landlordId: z.string().min(1),
  timeRange: timeRangeSchema,
  currentOccupancyRate: z.number().min(0).max(100),
  historicalData: z.array(occupancyDataPointSchema).min(3),
  averageOccupancy: z.number().min(0).max(100),
  peakOccupancyPeriod: peakPeriodSchema,
  lowOccupancyPeriod: peakPeriodSchema,
  trend: z.object({
    direction: z.enum(['increasing', 'decreasing', 'stable', 'volatile']),
    rate: z.number(),
  }),
}).refine(
  (data) => data.peakOccupancyPeriod.averageRate >= data.lowOccupancyPeriod.averageRate,
  { message: 'peakOccupancyPeriod.averageRate must be >= lowOccupancyPeriod.averageRate' }
)

// Seasonal Pattern Schema
export const seasonalPatternSchema = z.object({
  season: z.enum(['spring', 'summer', 'fall', 'winter']),
  months: z.array(z.number().int().min(1).max(12)),
  averageOccupancy: z.number().min(0).max(100),
  averageRevenue: z.number().min(0),
  description: z.string(),
})

// Insight Schema
export const insightSchema = z.object({
  id: z.string(),
  type: z.enum(['positive', 'negative', 'neutral', 'warning']),
  title: z.string().min(1),
  description: z.string().min(1),
  impact: z.enum(['high', 'medium', 'low']),
  actionable: z.boolean(),
})

// Trend Analysis Schema
export const trendAnalysisSchema = z.object({
  landlordId: z.string().min(1),
  seasonalPatterns: z.array(seasonalPatternSchema).max(4),
  revenueGrowthRate: z.number(),
  occupancyTrend: z.enum(['increasing', 'decreasing', 'stable', 'volatile']),
  insights: z.array(insightSchema),
  generatedAt: z.date(),
})

// Recommendation Schema
export const actionItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1),
  completed: z.boolean(),
  dueDate: z.date().optional(),
})

export const recommendationSchema = z.object({
  id: z.string(),
  landlordId: z.string().min(1),
  type: z.enum(['pricing', 'marketing', 'maintenance', 'occupancy', 'revenue']),
  priority: z.enum(['high', 'medium', 'low']),
  title: z.string().min(1),
  description: z.string().min(1),
  expectedImpact: z.string(),
  actionItems: z.array(actionItemSchema),
  basedOn: z.array(z.string()),
  createdAt: z.date(),
})

// API Request Schemas
export const getOverviewRequestSchema = z.object({
  landlordId: z.string().min(1, 'landlordId is required'),
  timeRange: timeRangeSchema.optional(),
})

export const getPredictionRequestSchema = z.object({
  landlordId: z.string().min(1, 'landlordId is required'),
  months: z.number().int().min(1).max(24, 'months must be between 1 and 24'),
})

export const getOccupancyRequestSchema = z.object({
  landlordId: z.string().min(1, 'landlordId is required'),
  timeRange: timeRangeSchema,
})

export const getTrendsRequestSchema = z.object({
  landlordId: z.string().min(1, 'landlordId is required'),
})

export const getRecommendationsRequestSchema = z.object({
  landlordId: z.string().min(1, 'landlordId is required'),
})
