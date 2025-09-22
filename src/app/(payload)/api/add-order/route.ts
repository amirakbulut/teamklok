import config from '@payload-config'
import { getPayload } from 'payload'

export async function GET(request: Request) {
  const payload = await getPayload({ config: config })

  const order = await payload.create({
    collection: 'orders',
    data: {
      orderId: '1234567890',
      orderDate: new Date().toISOString(),
      orderTotal: 100,
      deliveryCosts: 10,
      deliveryAddress: '1234567890',
      deliveryDuration: '10',
      deliveryMethod: 'delivery',
      paymentMethod: 'online',
      paymentStatus: 'paid',
      orderStatus: 'open',
      orderItems: [
        {
          menuItem: 1,
          answers: [{ question: 'Panne of spaghetti?', answer: 'Panne' }],
        },
      ],
    },
  })

  return new Response(JSON.stringify(order), { status: 200 })
}
