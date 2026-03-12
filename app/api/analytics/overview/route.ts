import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { analyticsService } from '@/lib/services/analytics.service'
import { getOverviewRequestSchema } from '@/lib/validation/analytics'
import { handleApiError } from '@/lib/api-error-handler'

export async function GET(request: NextRequest) {
  try {
    // Authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Authorization - only landlords can access analytics
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
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const year = searchParams.get('year')

    let timeRange
    if (year) {
      // Filter by year
      const yearNum = parseInt(year)
      timeRange = {
        startDate: new Date(yearNum, 0, 1), // Jan 1
        endDate: new Date(yearNum, 11, 31, 23, 59, 59), // Dec 31
      }
    } else if (startDate && endDate) {
      timeRange = {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      }

      // Validate time range
      if (timeRange.startDate > timeRange.endDate) {
        return NextResponse.json(
          { error: 'Invalid time range: startDate must be before endDate' },
          { status: 400 }
        )
      }
    }

    // Get analytics overview
    const overview = await analyticsService.getOverview(landlordId, timeRange)

    return NextResponse.json(overview, { status: 200 })
  } catch (error: any) {
    return handleApiError(error)
  }
}
