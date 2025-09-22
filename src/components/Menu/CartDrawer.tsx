import type { MenuItem } from '@/payload-types'
import { formatToEuro } from '@/utilities/formatToEuro'
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { ScrollArea } from '../ui/scroll-area'
import { Separator } from '../ui/separator'
import { CheckoutForm } from './CheckoutForm'

interface KeuzemenuOption {
  label: string
  price?: number | null
  id?: string | null
}

interface OrderItem {
  menuItem: MenuItem
  quantity: number
  customWishes: string
  keuzemenuSelections: {
    questionId: string
    question: string
    answer: string | string[]
    price?: number | null
  }[]
}

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  cartItems: OrderItem[]
  onUpdateQuantity: (index: number, quantity: number) => void
  onRemoveItem: (index: number) => void
  onClearCart: () => void
}

export const CartDrawer = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) => {
  const [showCheckout, setShowCheckout] = useState(false)
  const [removingItem, setRemovingItem] = useState<number | null>(null)

  const calculateItemPrice = (item: OrderItem): number => {
    let total = item.menuItem.price * item.quantity

    // Add keuzemenu option prices
    item.keuzemenuSelections.forEach((selection) => {
      console.log(selection)
      if (selection.price) {
        total +=
          selection.price *
          (Array.isArray(selection.answer) ? selection.answer.length : 1) *
          item.quantity
      }
    })

    return total
  }

  const calculateTotalPrice = (): number => {
    return cartItems.reduce((total, item) => total + calculateItemPrice(item), 0)
  }

  const getTotalItems = (): number => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const handleRemoveItem = async (index: number) => {
    setRemovingItem(index)
    // Add a small delay for visual feedback
    setTimeout(() => {
      onRemoveItem(index)
      setRemovingItem(null)
    }, 150)
  }

  const getDeliveryEstimate = (): string => {
    const totalItems = getTotalItems()
    if (totalItems === 0) return ''
    if (totalItems <= 2) return '15-20 min'
    if (totalItems <= 5) return '20-25 min'
    return '25-30 min'
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md bg-background shadow-xl border-l transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="p-1.5">
                <ShoppingCart className="h-4 w-4 " />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Uw bestelling</h2>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 p-3">
            {showCheckout ? (
              <CheckoutForm cartItems={cartItems} onClose={() => setShowCheckout(false)} />
            ) : cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="p-3 bg-muted/50 rounded-full mb-3">
                  <ShoppingCart className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
                <p className="text-sm text-muted-foreground mb-4">Add items to get started</p>
                <Button onClick={onClose} variant="outline" size="sm" className="gap-1.5">
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Continue shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item, index) => (
                  <Card
                    key={index}
                    className={`relative transition-all duration-200 ${
                      removingItem === index ? 'opacity-50 scale-95' : 'hover:shadow-sm'
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base font-semibold truncate">
                            {item.menuItem.title}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-1.5 ml-2">
                          <span className="text-base font-medium ">
                            {formatToEuro(item.menuItem.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {/* Keuzemenu selections */}
                      {item.keuzemenuSelections.length > 0 && (
                        <div className="space-y-1.5 mb-2">
                          {item.keuzemenuSelections.map((selection) => {
                            if (Array.isArray(selection.answer)) {
                              // Multiple selections (checkbox)
                              return (
                                <div key={selection.questionId}>
                                  <div className="flex items-start gap-1.5">
                                    {/* <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" /> */}
                                    <div className="flex-1">
                                      <div className="space-y-0.5">
                                        {selection.answer.map((answer, answerIndex) => (
                                          <div key={answerIndex}>
                                            <span className="flex items-center justify-between gap-1 text-sm">
                                              <span>{answer}</span>
                                              <span className="text-sm">
                                                {'+ ' +
                                                  formatToEuro(
                                                    selection?.price || 0 * item.quantity,
                                                  )}
                                              </span>
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            } else {
                              // Single selection (radio) or text input
                              return (
                                <div key={selection.questionId}>
                                  <div className="flex items-start gap-1.5">
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <p className="text-sm">{selection.answer}</p>
                                        {selection.price && selection.price > 0 && (
                                          <span className="text-sm">
                                            + {formatToEuro(selection.price * item.quantity)}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            }
                          })}
                        </div>
                      )}

                      {/* Custom wishes */}
                      {item.customWishes && (
                        <div className="mb-2 px-3 py-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-md">
                          <div className="flex items-start gap-1.5">
                            {/* <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" /> */}
                            <div>
                              <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-0.5">
                                Extra wensen
                              </p>
                              <p className="text-sm text-amber-800 dark:text-amber-200">
                                {item.customWishes}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Quantity controls */}
                      <div className="flex items-center justify-between mt-2 pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (item.quantity === 1) {
                                handleRemoveItem(index)
                              } else {
                                onUpdateQuantity(index, item.quantity - 1)
                              }
                            }}
                            disabled={removingItem === index}
                            className="h-6 w-6 p-0 hover:bg-muted disabled:opacity-50"
                          >
                            <Minus className="h-2.5 w-2.5" />
                          </Button>
                          <div className="w-6 text-center">
                            <span className="text-sm font-semibold">{item.quantity}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                            className="h-6 w-6 p-0 hover:bg-muted"
                          >
                            <Plus className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <div className="text-base font-semibold ">
                            {formatToEuro(calculateItemPrice(item))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {cartItems.length > 0 && !showCheckout && (
            <div className="border-t p-3 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold">Subtotaal</span>
                  <span className="text-base font-semibold">
                    {formatToEuro(calculateTotalPrice())}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-lg font-semibold">Totaal</span>
                    <p className="text-sm text-muted-foreground">
                      {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
                      {getDeliveryEstimate() && (
                        <span className="ml-1">• {getDeliveryEstimate()}</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold ">{formatToEuro(calculateTotalPrice())}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => setShowCheckout(true)}
                  disabled={cartItems.length === 0}
                >
                  <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                  Bestelling plaatsen
                </Button>
                <Button
                  variant="outline"
                  onClick={onClearCart}
                  size="lg"
                  className="w-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Bestelling resetten
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
