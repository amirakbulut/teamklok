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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { MenuItem, Order } from '@/payload-types'
import { cn, formatToEuro } from '@/utilities'
import { DragEndEvent } from '@dnd-kit/core'
import { Gutter } from '@payloadcms/ui'
import { Ban, Clock, CreditCard, Mail, MapPin, Phone, Plus, Receipt, User } from 'lucide-react'
import * as React from 'react'
import { PrintReceiptButton } from './PrintReceiptButton'

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

  const getFormattedDeliveryDuration = () => {
    const duration = order.deliveryDuration
    const orderDate = new Date(order.orderDate)
    const deliveryDate = new Date(orderDate.getTime() + duration * 60 * 1000)

    return deliveryDate.toLocaleString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleCancelOrder = () => {
    const result = confirm(
      'Weet je zeker dat je deze order wilt annuleren? Indien er een betaling is gedaan, dan wordt deze terugbetaald.',
    )

    if (result) {
      if (onUpdateOrder && order.orderId) {
        onUpdateOrder(order.orderId, {
          orderStatus: 'cancelled',
        })
      }
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose} direction="right">
      <DrawerContent className="h-full w-[900px] ml-auto border-border shadow-2xl data-[vaul-drawer-direction=right]:sm:max-w-lg">
        <DrawerHeader className="pb-4 border-b border-border bg-linear-to-r from-background to-muted/20">
          <DrawerTitle>
            <p className="text-xl font-semibold">Order #{order.orderId}</p>
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Delivery Date */}
            <div className="flex flex-col gap-2 items-center">
              <h3 className=" font-semibold ">Bezorgingstijd</h3>
              <div className="flex gap-2 items-center justify-between">
                <div></div>
                <span className="text-6xl font-bold leading-tight">
                  {getFormattedDeliveryDuration()}
                </span>
              </div>
            </div>

            {/* Action buttons: extra time, print receipt, cancel order */}
            <div className="flex flex gap-2 ">
              <Button
                variant="outline"
                size="lg"
                className="text-base h-16 flex-1"
                onClick={handleIncreaseTime}
                disabled={order.orderStatus === 'cancelled'}
              >
                <Plus className="h-4 w-4" />
                10 minuten
              </Button>
              <PrintReceiptButton
                order={order}
                variant="outline"
                size="lg"
                className="text-base h-16 flex-1"
              >
                <Receipt className="h-4 w-4" />
                Print bon
              </PrintReceiptButton>
              <Button
                variant="outline"
                size="lg"
                className="text-base h-16 bg-error flex-1"
                onClick={handleCancelOrder}
                disabled={order.orderStatus === 'cancelled'}
              >
                <Ban className="h-4 w-4" />
                Annuleer
              </Button>
            </div>

            {/* Status */}

            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-semibold ">Status</h3>
              <div className="space-y-2">
                <Select
                  value={order.orderStatus || 'open'}
                  onValueChange={(newStatus) => {
                    if (onUpdateOrder && order.orderId) {
                      onUpdateOrder(order.orderId, {
                        orderStatus: newStatus as 'open' | 'kitchen' | 'delivered' | 'cancelled',
                      })
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="kitchen">Keuken</SelectItem>
                    <SelectItem value="delivered">Afgerond</SelectItem>
                    <SelectItem value="cancelled">Geannuleerd</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Customer */}
            <div className="bg-elevation-50 border border-border/50 rounded-xl p-4 hover:shadow-sm transition-shadow">
              <h3 className="text-xl font-semibold mb-3">Klant Informatie</h3>
              <div className="space-y-2">
                <div className="text-lg ">{order.customerName || 'Onbekende klant'}</div>
                {order.customerPhone && (
                  <div className="flex items-center gap-2  ">
                    <Phone className="h-3 w-3" />
                    <span>{order.customerPhone}</span>
                  </div>
                )}
                {order.customerEmail && (
                  <div className="flex items-center gap-2  ">
                    <Mail className="h-3 w-3" />
                    <span>{order.customerEmail}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery */}
            <div className="bg-elevation-50 border border-border/50 rounded-xl p-4 hover:shadow-sm transition-shadow">
              <h3 className="text-xl font-semibold mb-3">Bezorging</h3>
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
            <div className="bg-elevation-50 border border-border/50 rounded-xl p-4 hover:shadow-sm transition-shadow">
              <h3 className="text-xl font-semibold mb-3">Betaling</h3>
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
            <div className="bg-elevation-50 border border-border/50 rounded-xl p-4 hover:shadow-sm transition-shadow">
              <h3 className="text-xl font-semibold mb-3">Bestelde Items</h3>
              <div className="flex flex-col gap-2">
                {order.orderItems?.map((item, index) => (
                  <div
                    key={index}
                    className="bg-card dark:bg-background/50 border border-border/30 rounded-lg px-3 py-2 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <div className="text-lg ">{getMenuItemName(item.menuItem)}</div>
                        {item.answers && item.answers.length > 0 && (
                          <ul>
                            {item.answers.map((answer, answerIndex) => (
                              <li key={answerIndex} className="px-2 py-1 rounded text-foreground ">
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
            <div className="bg-linear-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4">
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
  function determineStatusColor() {
    const orderDate = new Date(order.orderDate)
    const deliveryDate = new Date(orderDate.getTime() + Number(order.deliveryDuration) * 60 * 1000)

    const currentDate = new Date()
    const oldOrder = orderDate.getDate() < currentDate.getDate()

    if (oldOrder || order.orderStatus === 'delivered') {
      return 'bg-order-status-delivered'
    }

    // to do: allow set deliverytime on new orders
    const hurryOrder =
      deliveryDate.getTime() - currentDate.getTime() <= 15 * 60 * 1000 &&
      deliveryDate.getTime() > currentDate.getTime()

    if (hurryOrder) {
      return 'bg-order-status-hurry'
    }

    const lateOrder = deliveryDate.getTime() < currentDate.getTime()

    if (lateOrder) {
      return 'bg-order-status-late'
    }

    if (order.orderStatus === 'cancelled') {
      return 'bg-order-status-cancelled'
    }

    return 'bg-order-status-open'
  }

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

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onOrderClick) {
      onOrderClick(order)
    }
  }

  const cardContent = (
    <div
      className="bg-background rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer"
      style={{
        borderColor: 'var(--theme-elevation-200)',
      }}
      onClick={handleCardClick}
    >
      {/* Header with Time and Order ID */}
      <div
        className={cn(
          'px-4 py-3 border-b border-elevation-50 text-background',
          determineStatusColor(),
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-lg font-bold text-foreground">{formatTime(order.orderDate)}</span>
          </div>
          <span className="text-xs font-medium text-foreground bg-background px-2 py-1 rounded-full">
            {order.orderId}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Customer */}
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-foreground" />
          <span className=" font-medium text-foreground truncate">
            {order.customerName || 'Unknown Customer'}
          </span>
        </div>

        {/* Delivery Method */}
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-foreground" />
          <span className="text-foreground">
            {order.deliveryMethod === 'delivery' ? 'Bezorging' : 'Afhalen'}
          </span>
        </div>

        {/* Payment Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-foreground" />
            <span className=" text-foreground">
              {order.paymentMethod === 'online'
                ? 'Online'
                : order.paymentMethod === 'cash'
                  ? 'Contant'
                  : 'Contant + PIN'}
            </span>
          </div>
          <Badge
            className="text-md"
            variant={
              order.paymentStatus === 'paid'
                ? 'default'
                : order.paymentStatus === 'processing'
                  ? 'secondary'
                  : 'destructive'
            }
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
          <span className="text-foreground">{getTotalItems(order)} items</span>
          <span className="font-semibold  text-foreground">{formatToEuro(order.orderTotal)}</span>
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
      className="border border-border rounded-xl p-4 shadow-sm"
    >
      <div
        className="flex items-center justify-between mb-4 pb-3 border-b border-border"
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
          <div className="flex flex-col items-center justify-center py-8 text-center text-foreground">
            <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center mb-3">
              <Clock className="h-6 w-6 text-foreground" />
            </div>
            <p className="text-foreground font-medium">Geen orders</p>
            <p className="text-foreground mt-1">{COLUMN_TITLES[value]} is leeg</p>
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
    // Delay clearing selectedOrder to allow animation to complete
    setTimeout(() => {
      setSelectedOrder(null)
    }, 300) // Match animation duration
  }, [])

  // Handle drag operations with state updates and status detection
  const handleValueChange = React.useCallback(
    (newColumns: Record<string, Order[]>) => {
      // Update local state immediately for smooth drag experience
      setOrders((prevOrders) => {
        const updatedOrders = [...prevOrders]

        // Update order statuses locally
        Object.entries(newColumns).forEach(([status, orders]) => {
          orders.forEach((draggedOrder) => {
            const orderIndex = updatedOrders.findIndex((o) => o.id === draggedOrder.id)
            if (orderIndex !== -1) {
              updatedOrders[orderIndex] = {
                ...updatedOrders[orderIndex],
                orderStatus: status as any,
              }
            }
          })
        })

        return updatedOrders
      })
    },
    [columns],
  )

  // Handle drag end - update database when drag is complete
  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      if (!over) {
        return
      }

      // Find the order that was moved
      const orderId = active.id
      const order = orders.find((o) => o.id.toString() === orderId)

      if (!order) {
        console.log('Order not found for ID:', orderId)
        return
      }

      // Find target container from over element
      const overContainer =
        Object.keys(columns).find((status) =>
          columns[status].some((o) => o.id.toString() === over.id.toString()),
        ) || over.id.toString() // If over.id is a column ID

      updateOrderStatus(order.orderId, overContainer)
        .then(() => {
          // Refresh orders to get the latest data
          fetchOrdersForDate(selectedDate)
        })
        .catch((error) => {
          console.error('Failed to update order status:', error)
          // Revert the order status on error
          setOrders((prevOrders) =>
            prevOrders.map((o) =>
              o.id === order.id ? { ...o, orderStatus: order.orderStatus as any } : o,
            ),
          )
        })
    },
    [orders, columns, selectedDate],
  )

  const getItemValue = React.useCallback((item: Order) => item.id.toString(), [])

  // Function to fetch orders for a specific date
  const fetchOrdersForDate = async (date: Date) => {
    setIsLoading(true)
    try {
      // Use local date formatting to avoid timezone issues
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateString = `${year}-${month}-${day}`

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

      if (!response.ok) {
        throw new Error(`Failed to update order status: ${responseData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      // You might want to show a toast notification here
    }
  }

  const handleUpdateOrder = async (orderId: string, updates: Partial<Order>) => {
    try {
      // Update the database using the general update endpoint
      const response = await fetch('/api/orders/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
          updates: updates,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update order in database')
      }

      const result = await response.json()

      // Close dialog
      handleDialogClose()

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.orderId === orderId ? { ...order, ...updates } : order)),
      )

      // Update selected order if it's the same one
      if (selectedOrder?.orderId === orderId) {
        setSelectedOrder({ ...selectedOrder, ...updates })
      }
    } catch (error) {
      console.error('Failed to update order:', error)
    }
  }

  return (
    <Gutter>
      <div className="w-full">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--theme-text)' }}>
                Bestellingen
              </h1>
              <p style={{ color: 'var(--theme-text-50)' }} className="mb-2">
                Selecteer een datum:
              </p>
              <DatePicker date={selectedDate} setDate={handleDateChange} />
            </div>
          </div>
        </div>

        <div
          style={{
            borderColor: 'var(--theme-elevation-200)',
          }}
        >
          <Kanban
            value={columns}
            onValueChange={handleValueChange}
            onDragEnd={handleDragEnd}
            getItemValue={getItemValue}
          >
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
        onUpdateOrder={handleUpdateOrder}
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
