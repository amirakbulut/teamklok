import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    // Build query for orders
    let query: any = {}

    if (date) {
      // Parse the date and create date range for the entire day
      const targetDate = new Date(date)

      // Validate date
      if (isNaN(targetDate.getTime())) {
        return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
      }

      const startOfDay = new Date(targetDate)
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date(targetDate)
      endOfDay.setHours(23, 59, 59, 999)

      query.orderDate = {
        greater_than_equal: startOfDay.toISOString(),
        less_than_equal: endOfDay.toISOString(),
      }
    }

    // Fetch orders with the query
    const result = await payload.find({
      collection: 'orders',
      where: query,
      sort: '-orderDate', // Sort by newest first
      limit: 1000, // Adjust as needed
    })

    return NextResponse.json({
      orders: result.docs,
      totalDocs: result.totalDocs,
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
