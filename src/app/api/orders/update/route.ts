import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

// todo: add auth validation / authorization
export async function PATCH(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { orderId, updates } = await request.json()

    if (!orderId || !updates) {
      return NextResponse.json({ error: 'Missing orderId or updates' }, { status: 400 })
    }

    // Find the order by orderId
    const orders = await payload.find({
      collection: 'orders',
      where: {
        orderId: {
          equals: orderId,
        },
      },
    })

    if (orders.docs.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = orders.docs[0]

    // Update the order with the provided updates
    const updatedOrder = await payload.update({
      collection: 'orders',
      id: order.id,
      data: updates,
    })

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    })
  } catch (error) {
    console.error('API: Error updating order:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
