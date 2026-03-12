'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, Users, DollarSign, Calendar, AlertCircle } from 'lucide-react'
import type { AnalyticsOverview, TrendAnalysis } from '@/lib/types/analytics'

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [trends, setTrends] = useState<TrendAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      const [overviewRes, trendsRes] = await Promise.all([
        fetch('/api/analytics/overview'),
        fetch('/api/analytics/trends'),
      ])

      if (!overviewRes.ok) {
        const errorData = await overviewRes.json()
        throw new Error(errorData.error || 'Failed to fetch analytics')
      }

      const overviewData = await overviewRes.json()
      setOverview(overviewData)

      if (trendsRes.ok) {
        const trendsData = await trendsRes.json()
        setTrends(trendsData)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu phân tích...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Lỗi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={fetchAnalytics}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Thử lại
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!overview) {
    return null
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Phân Tích & Dự Đoán</h1>
        <p className="text-gray-600 mt-2">Thông tin chi tiết về hiệu suất kinh doanh của bạn</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ lắp đầy</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.totalRooms > 0 
                ? ((overview.occupiedRooms / overview.totalRooms) * 100).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {overview.occupiedRooms}/{overview.totalRooms} phòng
            </p>
            <div className="flex items-center mt-2">
              {overview.occupancyTrend === 'increasing' ? (
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              ) : overview.occupancyTrend === 'decreasing' ? (
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              ) : null}
              <span className="text-xs">{overview.occupancyTrend}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.totalRevenue.toLocaleString('vi-VN')} đ
            </div>
            <p className="text-xs text-muted-foreground">
              Tăng trưởng: {overview.revenueGrowth > 0 ? '+' : ''}
              {overview.revenueGrowth.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giá phòng TB</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.averageRoomPrice.toLocaleString('vi-VN')} đ
            </div>
            <p className="text-xs text-muted-foreground">Trung bình/tháng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng phòng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalRooms}</div>
            <p className="text-xs text-muted-foreground">
              Đang thuê: {overview.occupiedRooms}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Xu hướng theo mùa</TabsTrigger>
          <TabsTrigger value="insights">Phân tích</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Xu hướng theo mùa</CardTitle>
              <CardDescription>Phân tích patterns theo 4 mùa trong năm</CardDescription>
            </CardHeader>
            <CardContent>
              {trends && trends.seasonalPatterns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trends.seasonalPatterns.map((pattern, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h3 className="font-semibold capitalize mb-2">{pattern.season}</h3>
                      <p className="text-sm text-gray-600">
                        Tỷ lệ lấp đầy TB: {pattern.averageOccupancy.toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-600">
                        Doanh thu TB: {pattern.averageRevenue.toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Không đủ dữ liệu để phân tích xu hướng</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Phân tích chi tiết</CardTitle>
              <CardDescription>Insights từ dữ liệu kinh doanh của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              {trends && trends.insights.length > 0 ? (
                <div className="space-y-3">
                  {trends.insights.map((insight) => (
                    <div
                      key={insight.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        insight.type === 'positive'
                          ? 'bg-green-50 border-green-500'
                          : insight.type === 'negative'
                          ? 'bg-red-50 border-red-500'
                          : insight.type === 'warning'
                          ? 'bg-yellow-50 border-yellow-500'
                          : 'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <h4 className="font-medium">{insight.title}</h4>
                      <p className="text-sm text-gray-700 mt-1">{insight.description}</p>
                      <span className="text-xs text-gray-500 mt-2 inline-block">
                        Mức độ ảnh hưởng: {insight.impact}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Chưa có phân tích nào</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
