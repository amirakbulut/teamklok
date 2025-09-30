import { createOrder, type CreateOrderData } from '@/actions/order-actions'
import type { OrderItem } from '@/components/Menu/MenuItemModal'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useOrderForm() {
  const queryClient = useQueryClient()

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: CreateOrderData) => {
      return await createOrder(orderData)
    },
    onSuccess: () => {
      // Invalidate and refetch orders
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })

  const submitOrder = async (
    cartItems: OrderItem[],
    customerInfo: {
      name: string
      email: string
      phone: string
      address: string
      houseNumber: string
      city: string
      postalCode: string
    },
    deliveryMethod: 'delivery' | 'pickup',
    paymentMethod: 'online' | 'cash' | 'cash_pin',
  ) => {
    const orderData: CreateOrderData = {
      cartItems,
      customerInfo,
      deliveryMethod,
      paymentMethod,
    }

    return createOrderMutation.mutateAsync(orderData)
  }

  return {
    submitOrder,
    isSubmitting: createOrderMutation.isPending,
    error: createOrderMutation.error,
    isSuccess: createOrderMutation.isSuccess,
    reset: createOrderMutation.reset,
  }
}
