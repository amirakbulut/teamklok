import { getOrder } from '@/actions/order-actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatToEuro } from '@/utilities/formatToEuro'
import { CheckCircle, Clock } from 'lucide-react'

interface OrderSuccessPageProps {
  searchParams: {
    orderId?: string
  }
}

export default async function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const resolvedSearchParams = await searchParams
  const orderId = resolvedSearchParams.orderId

  if (!orderId) {
    return (
      <div className="container max-w-2xl mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Bestelling niet gevonden</h1>
              <p className="text-muted-foreground">
                Er is een fout opgetreden bij het verwerken van je bestelling.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const order = await getOrder(orderId)

  if (!order) {
    return (
      <div className="container max-w-2xl mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Bestelling niet gevonden</h1>
              <p className="text-muted-foreground">
                De bestelling met ID {orderId} kon niet worden gevonden.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-3xl text-green-600">Bestelling geplaatst!</CardTitle>
          <p className="text-muted-foreground">
            Je bestelling is succesvol geplaatst en wordt verwerkt.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Order Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Bestelgegevens</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Bestelnummer:</span>
                <br />
                {order.orderId}
              </div>
              <div>
                <span className="font-medium">Datum:</span>
                <br />
                {new Date(order.orderDate).toLocaleDateString('nl-NL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <br />
                <span className="capitalize">{order.orderStatus}</span>
              </div>
              <div>
                <span className="font-medium">Betalingsstatus:</span>
                <br />
                <span className="capitalize">{order.paymentStatus}</span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Bestelde items</h2>
            <div className="space-y-2">
              {order.orderItems?.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-start p-3 bg-muted rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">
                      {typeof item.menuItem === 'object' ? item.menuItem.title : 'Menu item'}
                    </div>
                    {item.answers && item.answers.length > 0 && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {item.answers.map((answer, answerIndex) => (
                          <div key={answerIndex}>
                            • {answer.question}: {answer.answer}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Samenvatting</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotaal</span>
                <span>{formatToEuro(order.orderTotal - order.deliveryCosts)}</span>
              </div>
              <div className="flex justify-between">
                <span>Bezorgkosten</span>
                <span>{formatToEuro(order.deliveryCosts)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Totaal</span>
                <span>{formatToEuro(order.orderTotal)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Bezorging</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Methode:</span>{' '}
                {order.deliveryMethod === 'delivery' ? 'Bezorging' : 'Afhalen'}
              </div>
              <div>
                <span className="font-medium">Adres:</span> {order.deliveryAddress}
              </div>
              <div>
                <span className="font-medium">Verwachte tijd:</span> {order.deliveryDuration}
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900">Wat gebeurt er nu?</h3>
                <p className="text-sm text-blue-800 mt-1">
                  Je bestelling wordt verwerkt door onze keuken. Je ontvangt een bevestiging per
                  e-mail en we nemen contact met je op voor de bezorging.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <a
              href="/menu"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Terug naar menu
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
