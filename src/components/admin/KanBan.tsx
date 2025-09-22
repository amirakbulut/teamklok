'use client'

import { DatePicker } from '@/components/date-picker'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
} from '@/components/ui/kanban'
import { Label } from '@/components/ui/label'
import type { MenuItem, Order } from '@/payload-types'
import { Gutter } from '@payloadcms/ui'
import { Calendar, Clock, CreditCard, Mail, MapPin, Phone, Plus, User } from 'lucide-react'
import * as React from 'react'

// Client-only component to avoid SSR hydration issues with drag-and-drop
const ClientOnlyKanban = React.lazy(() => Promise.resolve({ default: KanbanComponent }))

interface KanBanProps {
  initialOrders?: Order[]
}

const COLUMN_TITLES: Record<string, string> = {
  open: 'Open',
  kitchen: 'Keuken',
  delivered: 'Afgehaald',
  cancelled: 'Geannuleerd',
}

interface OrderDetailsDialogProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onUpdateOrder?: (orderId: string, updates: Partial<Order>) => void
}

function OrderDetailsDialog({ order, isOpen, onClose, onUpdateOrder }: OrderDetailsDialogProps) {
  if (!order) return null

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatToEuro = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const getMenuItemName = (menuItem: number | MenuItem) => {
    if (typeof menuItem === 'object' && menuItem.title) {
      return menuItem.title
    }
    return `Menu Item #${menuItem}`
  }

  const getMenuItemPrice = (menuItem: number | MenuItem) => {
    if (typeof menuItem === 'object' && menuItem.price) {
      return menuItem.price
    }
    return 0
  }

  const handleIncreaseTime = () => {
    if (onUpdateOrder && order.orderId) {
      const currentTime = new Date(order.orderDate)
      const newTime = new Date(currentTime.getTime() + 10 * 60 * 1000) // Add 10 minutes

      onUpdateOrder(order.orderId, {
        orderDate: newTime.toISOString(),
      })
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose} direction="right">
      <DrawerContent className="h-full w-[420px] ml-auto border-l shadow-2xl">
        <DrawerHeader className="pb-4 border-b bg-gradient-to-r from-background to-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <DrawerTitle className="text-xl font-bold ">Order #{order.orderId}</DrawerTitle>
                <p className="  font-medium">{formatTime(order.orderDate)}</p>
              </div>
            </div>
            {onUpdateOrder && (
              <Button
                onClick={handleIncreaseTime}
                size="sm"
                variant="outline"
                className="flex items-center gap-2 text-xs"
              >
                <Plus className="h-3 w-3" />
                +10 min
              </Button>
            )}
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Status */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className=" font-semibold ">Status</span>
                </div>
                <Badge
                  variant={
                    order.orderStatus === 'delivered'
                      ? 'default'
                      : order.orderStatus === 'cancelled'
                        ? 'destructive'
                        : order.orderStatus === 'kitchen'
                          ? 'secondary'
                          : 'outline'
                  }
                  className="text-xs font-medium px-2 py-1"
                >
                  {COLUMN_TITLES[order.orderStatus || 'open']}
                </Badge>
              </div>
            </div>

            {/* Customer */}
            <div className="bg-card border border-border/50 rounded-xl p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-blue-500" />
                <h3 className="text-xl font-semibold ">Klant Informatie</h3>
              </div>
              <div className="space-y-2">
                <div className="text-lg ">{(order as any).customer?.name || 'Onbekende klant'}</div>
                {(order as any).customer?.phone && (
                  <div className="flex items-center gap-2  ">
                    <Phone className="h-3 w-3" />
                    <span>{(order as any).customer.phone}</span>
                  </div>
                )}
                {(order as any).customer?.email && (
                  <div className="flex items-center gap-2  ">
                    <Mail className="h-3 w-3" />
                    <span>{(order as any).customer.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery */}
            <div className="bg-card border border-border/50 rounded-xl p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-green-500" />
                <h3 className="text-xl font-semibold ">Bezorging</h3>
              </div>
              <div className="space-y-2">
                {order.deliveryMethod === 'delivery' && (
                  <>
                    <div className="text-lg ">{order.deliveryAddress}</div>
                    {/* <div className="text-lg ">{order.deliveryDuration}</div> */}
                    {/* <div className="text-lg font-medium text-primary">
                      {formatToEuro(order.deliveryCosts)}
                    </div> */}
                  </>
                )}
              </div>
            </div>

            {/* Payment */}
            <div className="bg-card border border-border/50 rounded-xl p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="h-4 w-4 text-purple-500" />
                <h3 className="text-xl font-semibold ">Betaling</h3>
              </div>
              <div className="space-y-2">
                <div className="text-lg ">
                  {order.paymentMethod === 'online'
                    ? 'Online'
                    : order.paymentMethod === 'cash'
                      ? 'Contant'
                      : 'Contant + PIN'}
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-card border border-border/50 rounded-xl p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="dark:bg-orange-900/30">
                  <Clock className="h-4 w-4 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold ">Bestelde Items</h3>
              </div>
              <div>
                {order.orderItems?.map((item, index) => (
                  <div
                    key={index}
                    className="bg-muted/30 border border-border/30 rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <div className="text-lg ">{getMenuItemName(item.menuItem)}</div>
                        {item.answers && item.answers.length > 0 && (
                          <ul>
                            {item.answers.map((answer, answerIndex) => (
                              <li
                                key={answerIndex}
                                className="px-2 py-1 rounded text-muted-foreground "
                              >
                                {answer.answer}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="text-primary">
                        {formatToEuro(getMenuItemPrice(item.menuItem))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Totaal</h3>
                  <div className="text-xl font-bold text-primary">
                    {formatToEuro(order.orderTotal)}
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-lg">Items subtotaal</span>
                    <span className="text-lg">
                      {formatToEuro(order.orderTotal - (order.deliveryCosts || 0))}
                    </span>
                  </div>
                  {order.deliveryMethod === 'delivery' && order.deliveryCosts && (
                    <div className="flex justify-between">
                      <span className="text-lg">Bezorgkosten</span>
                      <span className="text-lg">{formatToEuro(order.deliveryCosts)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

interface OrderCardProps
  extends Omit<React.ComponentProps<typeof KanbanItem>, 'value' | 'children'> {
  order: Order
  asHandle?: boolean
  onOrderClick?: (order: Order) => void
}

function OrderCard({ order, asHandle, onOrderClick, ...props }: OrderCardProps) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTotalItems = (order: Order) => {
    if (!order.orderItems || !Array.isArray(order.orderItems)) return 0
    return order.orderItems.reduce((total, item) => {
      // Handle the case where quantity might not exist or be a different type
      const quantity = (item as any).quantity || 1
      return total + (typeof quantity === 'number' ? quantity : 1)
    }, 0)
  }

  const formatToEuro = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onOrderClick) {
      onOrderClick(order)
    }
  }

  const cardContent = (
    <div
      className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer"
      style={{
        backgroundColor: 'white',
        borderColor: 'var(--theme-elevation-200)',
      }}
      onClick={handleCardClick}
    >
      {/* Header with Time and Order ID */}
      <div className="bg-gradient-to-r from-green-200 to-white-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-lg font-bold text-gray-900">{formatTime(order.orderDate)}</span>
          </div>
          <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-full">
            {order.orderId}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Customer */}
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className=" font-medium text-gray-800 truncate">
            {(order as any).customer && typeof (order as any).customer === 'object'
              ? (order as any).customer.name
              : 'Unknown Customer'}
          </span>
        </div>

        {/* Delivery Method */}
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className=" text-gray-700">
            {order.deliveryMethod === 'delivery' ? 'Bezorging' : 'Afhalen'}
          </span>
        </div>

        {/* Payment Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-gray-400" />
            <span className=" text-gray-700">
              {order.paymentMethod === 'online'
                ? 'Online'
                : order.paymentMethod === 'cash'
                  ? 'Contant'
                  : 'Contant + PIN'}
            </span>
          </div>
          <Badge
            variant={
              order.paymentStatus === 'paid'
                ? 'default'
                : order.paymentStatus === 'processing'
                  ? 'secondary'
                  : 'destructive'
            }
            className="text-xs"
          >
            {order.paymentStatus === 'paid'
              ? 'Betaald'
              : order.paymentStatus === 'processing'
                ? 'Bezig'
                : 'Niet betaald'}
          </Badge>
        </div>

        {/* Footer with Items and Total */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500">{getTotalItems(order)} items</span>
          <span className="font-semibold  text-gray-900">{formatToEuro(order.orderTotal)}</span>
        </div>
      </div>
    </div>
  )

  return (
    <KanbanItem value={order.id.toString()} {...props}>
      {asHandle ? <KanbanItemHandle>{cardContent}</KanbanItemHandle> : cardContent}
    </KanbanItem>
  )
}

interface OrderColumnProps extends Omit<React.ComponentProps<typeof KanbanColumn>, 'children'> {
  orders: Order[]
  isOverlay?: boolean
  onOrderClick?: (order: Order) => void
}

function OrderColumn({ value, orders, isOverlay, onOrderClick, ...props }: OrderColumnProps) {
  // Ensure orders is always an array
  const safeOrders = orders || []

  return (
    <KanbanColumn
      value={value}
      {...props}
      className="border border-gray-200 rounded-xl p-4 shadow-sm"
    >
      <div
        className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200"
        style={{ borderColor: 'var(--theme-elevation-200)' }}
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold " style={{ color: 'var(--theme-text)' }}>
            {COLUMN_TITLES[value]}
          </span>
          <Badge variant="secondary" className="text-xs">
            {safeOrders.length}
          </Badge>
        </div>
      </div>
      <KanbanColumnContent value={value} className="space-y-3">
        {safeOrders.length > 0 ? (
          safeOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              asHandle={!isOverlay}
              onOrderClick={onOrderClick}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Clock className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium">Geen orders</p>
            <p className="text-xs text-gray-400 mt-1">{COLUMN_TITLES[value]} is leeg</p>
          </div>
        )}
      </KanbanColumnContent>
    </KanbanColumn>
  )
}

function KanbanComponent({ initialOrders = [] }: KanBanProps) {
  // Dialog state
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  // Date state
  const [selectedDate, setSelectedDate] = React.useState<Date>(() => {
    return new Date() // Default to today
  })

  // Orders state
  const [orders, setOrders] = React.useState<Order[]>(initialOrders)
  const [isLoading, setIsLoading] = React.useState(false)

  // Create columns from orders - memoized to prevent infinite loops
  const columns = React.useMemo(() => {
    const groupedOrders: Record<string, Order[]> = {
      open: [],
      kitchen: [],
      delivered: [],
      cancelled: [],
    }

    orders.forEach((order) => {
      const status = order.orderStatus || 'open'
      groupedOrders[status] = groupedOrders[status] || []
      groupedOrders[status].push(order)
    })

    return groupedOrders
  }, [orders])

  // Handle order click
  const handleOrderClick = React.useCallback((order: Order) => {
    setSelectedOrder(order)
    setIsDialogOpen(true)
  }, [])

  // Handle dialog close
  const handleDialogClose = React.useCallback(() => {
    setIsDialogOpen(false)
    setSelectedOrder(null)
  }, [])

  // Handle drag operations with state updates and status detection
  const handleValueChange = React.useCallback((newColumns: Record<string, Order[]>) => {
    console.log('Drag operation:', newColumns)

    // Check for status changes and update database
    Object.entries(newColumns).forEach(([status, orders]) => {
      orders.forEach((order) => {
        const currentStatus = order.orderStatus || 'open'
        if (currentStatus !== status) {
          // Add a small delay to preserve drag effect, then update database
          setTimeout(() => {
            updateOrderStatus(order.orderId, status)
              .then(() => {
                // Update the order object locally after successful API call
                order.orderStatus = status as any
                // Update the orders state to reflect the change
                setOrders((prevOrders) =>
                  prevOrders.map((o) =>
                    o.id === order.id ? { ...o, orderStatus: status as any } : o,
                  ),
                )
              })
              .catch((error) => {
                console.error('Failed to update order status:', error)
                // Revert the order status on error
                order.orderStatus = currentStatus as any
              })
          }, 100) // Small delay to preserve drag effect
        }
      })
    })
  }, [])

  const getItemValue = React.useCallback((item: Order) => item.id.toString(), [])

  // Function to fetch orders for a specific date
  const fetchOrdersForDate = async (date: Date) => {
    setIsLoading(true)
    try {
      const dateString = date.toISOString().split('T')[0] // Convert to YYYY-MM-DD format
      const response = await fetch(`/api/orders?date=${dateString}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      } else {
        console.error('Failed to fetch orders for date:', dateString)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle date change
  const handleDateChange = React.useCallback((newDate: Date | undefined) => {
    if (newDate) {
      setSelectedDate(newDate)
      fetchOrdersForDate(newDate)
    }
  }, [])

  // Fetch orders for the initial date on component mount
  React.useEffect(() => {
    if (selectedDate) {
      fetchOrdersForDate(selectedDate)
    }
  }, []) // Only run on mount

  // Function to update order status in the database
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      console.log('Updating order status:', { orderId, newStatus })

      const response = await fetch('/api/orders/update-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
          orderStatus: newStatus,
        }),
      })

      const responseData = await response.json()
      console.log('API Response:', responseData)

      if (!response.ok) {
        throw new Error(`Failed to update order status: ${responseData.error || 'Unknown error'}`)
      }

      console.log('Order status updated successfully')
    } catch (error) {
      console.error('Error updating order status:', error)
      // You might want to show a toast notification here
    }
  }

  return (
    <Gutter>
      <div className="w-full">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--theme-text)' }}>
                Orders Kanban
              </h1>
              <p style={{ color: 'var(--theme-text-50)' }}>
                Beheer orders voor {selectedDate.toLocaleDateString('nl-NL')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Label className="text-sm font-medium">Datum:</Label>
              </div>
              <DatePicker date={selectedDate} setDate={handleDateChange} />
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Laden...
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className="border border-gray-200 rounded-lg w-full"
          style={{
            borderColor: 'var(--theme-elevation-200)',
          }}
        >
          <Kanban value={columns} onValueChange={handleValueChange} getItemValue={getItemValue}>
            <KanbanBoard className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[500px] w-full">
              {Object.entries(columns).map(([columnValue, orders]) => (
                <OrderColumn
                  key={columnValue}
                  value={columnValue}
                  orders={orders}
                  onOrderClick={handleOrderClick}
                />
              ))}
            </KanbanBoard>
            <KanbanOverlay>
              {({ value, variant }) => {
                if (variant === 'column') {
                  const orders = columns[value] ?? []
                  return <OrderColumn value={String(value)} orders={orders} isOverlay />
                }

                const order = Object.values(columns)
                  .flat()
                  .find((order) => order.id === value)

                if (!order) return null

                return <OrderCard order={order} />
              }}
            </KanbanOverlay>
          </Kanban>
        </div>
      </div>

      {/* Order Details Dialog */}
      <OrderDetailsDialog
        order={selectedOrder}
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onUpdateOrder={(orderId, updates) => {
          // TODO: Implement order update logic
          console.log('Update order:', orderId, updates)
        }}
      />
    </Gutter>
  )
}

// Export with Suspense wrapper to avoid SSR hydration issues
export default function Component(props: KanBanProps) {
  return (
    <React.Suspense
      fallback={<div className="flex items-center justify-center h-64">Loading Kanban...</div>}
    >
      <ClientOnlyKanban {...props} />
    </React.Suspense>
  )
}
