import { mollieClient } from '@/services/mollie'

export default async function OrderPage({ params }: { params: { orderId: string } }) {
  const payment = await mollieClient.payments.get(params.orderId)

  console.log(payment)

  return <div>Order</div>
}
