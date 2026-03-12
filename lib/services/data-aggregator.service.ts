import { prisma } from '@/lib/prisma'
import type {
  TimeRange,
  ContractData,
  InvoiceData,
  RoomStats,
  MonthlyRevenue,
  OccupancyData,
} from '@/lib/types/analytics'

export class DataAggregatorService {
  /**
   * Get contract history for a landlord within a time range
   * Filters contracts where the contract period overlaps with the specified time range
   */
  async getContractHistory(
    landlordId: string,
    timeRange: TimeRange
  ): Promise<ContractData[]> {
    try {
      const contracts = await prisma.contract.findMany({
        where: {
          room: {
            building: {
              landlordId,
            },
          },
          OR: [
            {
              AND: [
                { startDate: { lte: timeRange.endDate } },
                { endDate: { gte: timeRange.startDate } },
              ],
            },
          ],
        },
        select: {
          id: true,
          roomId: true,
          tenantId: true,
          startDate: true,
          endDate: true,
          rentAmount: true,
          status: true,
        },
        orderBy: {
          startDate: 'asc',
        },
      })

      return contracts
    } catch (error) {
      console.error('Error fetching contract history:', error)
      return []
    }
  }

  /**
   * Get invoice history for a landlord within a time range
   * Filters invoices where the invoice date falls within the specified time range
   */
  async getInvoiceHistory(
    landlordId: string,
    timeRange: TimeRange
  ): Promise<InvoiceData[]> {
    try {
      const startYear = timeRange.startDate.getFullYear()
      const startMonth = timeRange.startDate.getMonth() + 1
      const endYear = timeRange.endDate.getFullYear()
      const endMonth = timeRange.endDate.getMonth() + 1

      const invoices = await prisma.invoice.findMany({
        where: {
          tenant: {
            landlordId,
          },
          OR: [
            { year: { gt: startYear, lt: endYear } },
            {
              AND: [
                { year: startYear },
                { month: { gte: startMonth } },
              ],
            },
            {
              AND: [
                { year: endYear },
                { month: { lte: endMonth } },
              ],
            },
          ],
        },
        select: {
          id: true,
          tenantId: true,
          month: true,
          year: true,
          totalAmount: true,
          status: true,
          paidDate: true,
        },
        orderBy: [
          { year: 'asc' },
          { month: 'asc' },
        ],
      })

      return invoices
    } catch (error) {
      console.error('Error fetching invoice history:', error)
      return []
    }
  }

  /**
   * Get room statistics for a landlord
   * Returns current status of all rooms
   */
  async getRoomStatistics(landlordId: string): Promise<RoomStats[]> {
    try {
      const rooms = await prisma.room.findMany({
        where: {
          building: {
            landlordId,
          },
        },
        select: {
          id: true,
          buildingId: true,
          status: true,
          price: true,
          tenant: {
            select: {
              id: true,
            },
          },
        },
      })

      return rooms.map((room) => ({
        id: room.id,
        buildingId: room.buildingId,
        status: room.status,
        price: room.price,
        tenantId: room.tenant?.id || null,
      }))
    } catch (error) {
      console.error('Error fetching room statistics:', error)
      return []
    }
  }

  /**
   * Aggregate monthly revenue for a landlord
   * Groups invoices by month and sums the amounts
   */
  async aggregateMonthlyRevenue(
    landlordId: string,
    months: number,
    timeRange?: TimeRange
  ): Promise<MonthlyRevenue[]> {
    try {
      let startDate: Date
      let endDate: Date

      if (timeRange) {
        startDate = timeRange.startDate
        endDate = timeRange.endDate
      } else {
        endDate = new Date()
        startDate = new Date()
        startDate.setMonth(startDate.getMonth() - months)
      }

      const invoices = await this.getInvoiceHistory(landlordId, {
        startDate,
        endDate,
      })

      // Group by month and year
      const revenueMap = new Map<string, number>()

      invoices.forEach((invoice) => {
        const key = `${invoice.year}-${invoice.month}`
        const current = revenueMap.get(key) || 0
        revenueMap.set(key, current + invoice.totalAmount)
      })

      // Convert to array and sort
      const monthlyRevenue: MonthlyRevenue[] = []
      revenueMap.forEach((revenue, key) => {
        const [year, month] = key.split('-').map(Number)
        monthlyRevenue.push({
          month,
          year,
          revenue,
          date: new Date(year, month - 1, 1),
        })
      })

      return monthlyRevenue.sort((a, b) => a.date.getTime() - b.date.getTime())
    } catch (error) {
      console.error('Error aggregating monthly revenue:', error)
      return []
    }
  }

  /**
   * Calculate occupancy by period for a landlord
   * Returns occupancy data points for each month in the time range
   */
  async calculateOccupancyByPeriod(
    landlordId: string,
    timeRange: TimeRange
  ): Promise<OccupancyData[]> {
    try {
      const rooms = await this.getRoomStatistics(landlordId)
      const totalRooms = rooms.length

      if (totalRooms === 0) {
        return []
      }

      // For current period, use room status directly
      const currentOccupiedRooms = rooms.filter((r) => r.status === 'OCCUPIED').length
      const currentOccupancyRate = (currentOccupiedRooms / totalRooms) * 100

      const contracts = await this.getContractHistory(landlordId, timeRange)

      // Generate monthly data points
      const occupancyData: OccupancyData[] = []
      const currentDate = new Date(timeRange.startDate)
      const endDate = new Date(timeRange.endDate)
      const now = new Date()

      while (currentDate <= endDate) {
        const month = currentDate.getMonth() + 1
        const year = currentDate.getFullYear()
        const monthStart = new Date(year, month - 1, 1)
        const monthEnd = new Date(year, month, 0)

        let occupiedRooms: number
        let occupancyRate: number

        // For current month, use actual room status
        if (year === now.getFullYear() && month === now.getMonth() + 1) {
          occupiedRooms = currentOccupiedRooms
          occupancyRate = currentOccupancyRate
        } else {
          // For historical months, use contract data
          occupiedRooms = contracts.filter((contract) => {
            const contractActive = contract.startDate <= monthEnd && contract.endDate >= monthStart;
            const statusActive = contract.status === 'ACTIVE' || contract.status === 'active';
            return contractActive && statusActive;
          }).length
          occupancyRate = (occupiedRooms / totalRooms) * 100
        }

        occupancyData.push({
          date: new Date(monthStart),
          occupancyRate,
          occupiedRooms,
          totalRooms,
          month,
          year,
        })

        currentDate.setMonth(currentDate.getMonth() + 1)
      }

      return occupancyData
    } catch (error) {
      console.error('Error calculating occupancy by period:', error)
      return []
    }
  }
}

export const dataAggregatorService = new DataAggregatorService()
