import type { OrderItem } from '@/components/Menu/MenuItemModal'

/**
 * Calculate the total price for a single order item including keuzemenu selections
 */
export const calculateItemPrice = (item: OrderItem): number => {
  let total = item.menuItem.price * item.quantity

  // Add keuzemenu option prices
  item.keuzemenuSelections.forEach((selection) => {
    if (selection.price) {
      total +=
        selection.price *
        (Array.isArray(selection.answer) ? selection.answer.length : 1) *
        item.quantity
    }
  })

  return total
}

/**
 * Calculate the total price for multiple order items
 */
export const calculateTotalPrice = (cartItems: OrderItem[]): number => {
  return cartItems.reduce((total, item) => total + calculateItemPrice(item), 0)
}

/**
 * Calculate subtotal for checkout (same as total price but with different naming for clarity)
 */
export const calculateSubtotal = (cartItems: OrderItem[]): number => {
  return calculateTotalPrice(cartItems)
}

/**
 * Calculate delivery costs based on delivery method
 */
export const calculateDeliveryCosts = (deliveryMethod: 'delivery' | 'pickup'): number => {
  return deliveryMethod === 'delivery' ? 2.5 : 0
}

/**
 * Calculate final total including delivery costs
 */
export const calculateFinalTotal = (
  cartItems: OrderItem[],
  deliveryMethod: 'delivery' | 'pickup',
): number => {
  const subtotal = calculateSubtotal(cartItems)
  const deliveryCosts = calculateDeliveryCosts(deliveryMethod)
  return subtotal + deliveryCosts
}

/**
 * Get total number of items in cart
 */
export const getTotalItems = (cartItems: OrderItem[]): number => {
  return cartItems.reduce((total, item) => total + item.quantity, 0)
}

/**
 * Get delivery time estimate based on total items
 */
export const getDeliveryEstimate = (cartItems: OrderItem[]): string => {
  const totalItems = getTotalItems(cartItems)
  if (totalItems === 0) return ''
  if (totalItems <= 2) return '15-20 min'
  if (totalItems <= 5) return '20-25 min'
  return '25-30 min'
}
