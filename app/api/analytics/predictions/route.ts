import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { analyticsService } from '@/lib/services/analytics.service'
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
    const monthsParam = searchParams.get('months')

    if (!monthsParam) {
      return NextResponse.json(
        { error: 'Missing required parameter: months' },
        { status: 400 }
      )
    }

    const months = parseInt(monthsParam, 10)

    // Validate months parameter
    if (isNaN(months) || months < 1 || months > 24) {
      return NextResponse.json(
        { error: 'Invalid months parameter. Must be between 1 and 24.' },
        { status: 400 }
      )
    }

    // Get revenue predictions
    const predictions = await analyticsService.predictFutureRevenue(landlordId, months)

    return NextResponse.json(predictions, { status: 200 })
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
