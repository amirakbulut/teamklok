'use server'

import { OrderItem } from '@/components/Menu/MenuItemModal'
import { mollieClient } from '@/services/mollie'
import config from '@payload-config'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

export interface CreateOrderData {
  cartItems: OrderItem[]
  customerInfo: {
    name: string
    email: string
    phone: string
    address: string
    houseNumber: string
    city: string
    postalCode: string
  }
  deliveryMethod: 'delivery' | 'pickup'
  paymentMethod: 'online' | 'cash' | 'cash_pin'
}

async function getDeliveryDuration(postalCode: string): Promise<number> {
  try {
    const payload = await getPayload({ config })

    const bezorggebieden = await payload.find({
      collection: 'bezorg-gebieden',
      where: {
        zipCode: {
          equals: postalCode,
        },
        active: {
          equals: true,
        },
      },
      limit: 1,
    })

    if (bezorggebieden.docs.length > 0) {
      const deliveryTime = bezorggebieden.docs[0].deliveryTime
      if (deliveryTime) {
        return deliveryTime
      }
    }

    // Fallback to default delivery duration (37.5 minutes = 30-45 min range)
    return 45
  } catch (error) {
    console.error('Failed to fetch delivery duration:', error)
    return 45
  }
}

export async function createOrder(data: CreateOrderData) {
  try {
    const payload = await getPayload({ config })

    // Generate unique order ID (6 digits)
    const orderNumber = Math.floor(Math.random() * 900000) + 100000 // 100000-999999
    const orderId = `ORD-${orderNumber}`

    // Calculate totals
    const subtotal = data.cartItems.reduce((total, item) => {
      let itemTotal = item.menuItem.price * item.quantity

      // Add keuzemenu option prices
      item.keuzemenuSelections.forEach((selection) => {
        if (selection.price) {
          itemTotal += selection.price * item.quantity
        }
      })

      return total + itemTotal
    }, 0)

    const deliveryCosts = data.deliveryMethod === 'delivery' ? 2.5 : 0
    const orderTotal = subtotal + deliveryCosts

    // Get delivery duration based on postal code
    const deliveryDuration =
      data.deliveryMethod === 'delivery'
        ? await getDeliveryDuration(data.customerInfo.postalCode)
        : 45

    // Transform cart items to order items format
    const orderItems = data.cartItems.map((item) => ({
      menuItem: item.menuItem.id,
      answers: [
        ...item.keuzemenuSelections.map((selection) => ({
          question: selection.question,
          answer: Array.isArray(selection.answer) ? selection.answer.join(', ') : selection.answer,
        })),
        ...(item.customWishes
          ? [
              {
                question: 'Speciale wensen',
                answer: item.customWishes,
              },
            ]
          : []),
      ],
    }))

    const deliveryAddress =
      data.deliveryMethod === 'delivery'
        ? `${data.customerInfo.address} ${data.customerInfo.houseNumber}, ${data.customerInfo.postalCode} ${data.customerInfo.city}`
        : 'Afhalen'

    // Create order in database
    const order = await payload.create({
      collection: 'orders',
      data: {
        orderId,
        orderDate: new Date().toISOString(),
        customerName: data.customerInfo.name,
        customerEmail: data.customerInfo.email,
        customerPhone: data.customerInfo.phone,
        orderItems,
        orderStatus: 'open',
        orderTotal,
        deliveryAddress,
        deliveryDuration,
        deliveryCosts,
        deliveryMethod: data.deliveryMethod,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentMethod === 'online' ? 'processing' : 'not_paid',
      },
    })

    // Handle payment based on method
    if (data.paymentMethod === 'online') {
      // Get base URL - use localhost for development, or environment variable
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL

      if (!baseUrl) {
        throw new Error('NEXT_PUBLIC_APP_URL is not set')
      }

      // Create Mollie payment
      const payment = await mollieClient.payments.create({
        amount: {
          value: orderTotal.toFixed(2),
          currency: 'EUR',
        },
        description: `Bestelling ${orderId} - La Pizza Zevenaar`,
        redirectUrl: `${baseUrl}/order/success?orderId=${orderId}`,
        webhookUrl: `${baseUrl}/api/webhook`,
        metadata: {
          orderId: orderId,
          orderDbId: order.id.toString(),
        },
      })

      // Redirect to Mollie checkout
      redirect(payment.getCheckoutUrl() || '/order/error')
    } else {
      // Cash payment - redirect to confirmation page
      redirect(`/order/confirmation?orderId=${orderId}`)
    }
  } catch (error) {
    // Check if this is a redirect error (which is expected)
    if (error && typeof error === 'object' && 'digest' in error) {
      const digest = (error as { digest: string }).digest
      if (typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT')) {
        // This is a redirect, re-throw it
        throw error
      }
    }

    console.error('Order creation failed:', error)
    throw new Error(
      'Er is een fout opgetreden bij het plaatsen van je bestelling. Probeer het opnieuw.',
    )
  }
}

export async function getOrder(orderId: string) {
  try {
    const payload = await getPayload({ config })

    const orders = await payload.find({
      collection: 'orders',
      where: {
        orderId: {
          equals: orderId,
        },
      },
      limit: 1,
    })

    return orders.docs[0] || null
  } catch (error) {
    console.error('Failed to fetch order:', error)
    return null
  }
}
