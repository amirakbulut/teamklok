import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

export async function PATCH(request: NextRequest) {
  try {
    console.log('API: Received request to update order status')

    const payload = await getPayload({ config })
    const { orderId, orderStatus } = await request.json()

    console.log('API: Request data:', { orderId, orderStatus })

    if (!orderId || !orderStatus) {
      console.log('API: Missing required fields')
      return NextResponse.json({ error: 'Missing orderId or orderStatus' }, { status: 400 })
    }

    // Find the order by orderId
    console.log('API: Searching for order with orderId:', orderId)
    const orders = await payload.find({
      collection: 'orders',
      where: {
        orderId: {
          equals: orderId,
        },
      },
    })

    console.log('API: Found orders:', orders.docs.length)

    if (orders.docs.length === 0) {
      console.log('API: Order not found')
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = orders.docs[0]
    console.log('API: Found order:', order.id, 'Current status:', order.orderStatus)

    // Update the order status
    console.log('API: Updating order status to:', orderStatus)
    const updatedOrder = await payload.update({
      collection: 'orders',
      id: order.id,
      data: {
        orderStatus,
      },
    })

    console.log('API: Order updated successfully')
    return NextResponse.json({
      success: true,
      order: updatedOrder,
    })
  } catch (error) {
    console.error('API: Error updating order status:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
