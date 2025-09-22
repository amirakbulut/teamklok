import { RestaurantMenu } from '@/components/Menu/RestaurantMenu'

export default async function MenuPage() {
  // const payment = await mollieClient.payments.create({
  //   amount: {
  //     value: '10.00',
  //     currency: 'EUR',
  //   },
  //   description: 'My first API payment',
  //   redirectUrl: 'https://lapizzazevenaar.nl',
  //   webhookUrl: 'https://webhook-test.com/e8d9d98d8cfef5879e1fa46701f973ab',
  // })

  // redirect(payment.getCheckoutUrl() || '/')

  return (
    <div className="container">
      <h1>Menu</h1>
      <RestaurantMenu />
    </div>
  )
}
