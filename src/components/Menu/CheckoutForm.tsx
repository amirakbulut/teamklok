'use client'

import { createOrder, type CreateOrderData } from '@/actions/order-actions'
import { useCartStorage } from '@/hooks/useCartStorage'
import { formatToEuro } from '@/utilities/formatToEuro'
import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Separator } from '../ui/separator'
import { OrderItem } from './MenuItemModal'

interface CheckoutFormProps {
  cartItems: OrderItem[]
  onClose: () => void
}

export const CheckoutForm = ({ cartItems, onClose }: CheckoutFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { customerInfo, updateCustomerInfo, clearAll } = useCartStorage()

  const [formData, setFormData] = useState({
    name: customerInfo.name,
    email: customerInfo.email,
    phone: customerInfo.phone,
    address: customerInfo.address,
    city: customerInfo.city,
    postalCode: customerInfo.postalCode,
    deliveryMethod: customerInfo.deliveryMethod,
    paymentMethod: customerInfo.paymentMethod,
  })

  // Update form data when customer info changes
  useEffect(() => {
    setFormData({
      name: customerInfo.name,
      email: customerInfo.email,
      phone: customerInfo.phone,
      address: customerInfo.address,
      city: customerInfo.city,
      postalCode: customerInfo.postalCode,
      deliveryMethod: customerInfo.deliveryMethod,
      paymentMethod: customerInfo.paymentMethod,
    })
  }, [customerInfo])

  // Update localStorage when form data changes
  const updateFormData = (updates: Partial<typeof formData>) => {
    const newFormData = { ...formData, ...updates }
    setFormData(newFormData)
    updateCustomerInfo(newFormData)
  }

  const calculateSubtotal = (): number => {
    return cartItems.reduce((total, item) => {
      let itemTotal = item.menuItem.price * item.quantity

      Object.values(item.keuzemenuSelections).forEach((selectedOption) => {
        if (Array.isArray(selectedOption)) {
          selectedOption.forEach((option: any) => {
            itemTotal += (option.price || 0) * item.quantity
          })
        } else {
          itemTotal += (selectedOption.price || 0) * item.quantity
        }
      })

      return total + itemTotal
    }, 0)
  }

  const deliveryCosts = formData.deliveryMethod === 'delivery' ? 2.5 : 0
  const subtotal = calculateSubtotal()
  const total = subtotal + deliveryCosts

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const orderData: CreateOrderData = {
        cartItems,
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
        },
        deliveryMethod: formData.deliveryMethod,
        paymentMethod: formData.paymentMethod,
      }

      await createOrder(orderData)

      // Clear cart and customer info after successful order
      clearAll()
    } catch (error) {
      console.error('Order submission failed:', error)
      alert('Er is een fout opgetreden. Neem telefonisch contact met ons op.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contactgegevens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Naam *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefoonnummer *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: e.target.value })}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Delivery Information */}
      <Card>
        <CardHeader>
          <CardTitle>Bezorging</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Bezorgmethode</Label>
            <RadioGroup
              value={formData.deliveryMethod}
              onValueChange={(value: 'delivery' | 'pickup') =>
                setFormData((prev) => ({ ...prev, deliveryMethod: value }))
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="delivery" id="delivery" />
                <Label htmlFor="delivery">Bezorging (+€2,50)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pickup" id="pickup" />
                <Label htmlFor="pickup">Afhalen (gratis)</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.deliveryMethod === 'delivery' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Adres *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postcode *</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, postalCode: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Plaats *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Betalingsmethode</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={formData.paymentMethod}
            onValueChange={(value: 'online' | 'cash' | 'cash_pin') =>
              setFormData((prev) => ({ ...prev, paymentMethod: value }))
            }
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="online" id="online" />
              <Label htmlFor="online">Online betaling (iDEAL/Creditcard)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash">Contant betaling</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cash_pin" id="cash_pin" />
              <Label htmlFor="cash_pin">Contant met pin</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Bestellingsoverzicht</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {cartItems.map((item, index) => (
            <div key={index}>
              <div key={index} className="flex justify-between text-sm">
                <span>
                  {item.quantity}x {item.menuItem.title}
                </span>
                <span>{formatToEuro(item.menuItem.price * item.quantity)}</span>
              </div>
              <div className="flex flex-col justify-between text-sm text-muted-foreground ml-3 italic">
                {item.customWishes && <span>• {item.customWishes}</span>}
                {item.keuzemenuSelections.map((selection) => (
                  <div key={selection.questionId}>
                    <span>• {selection.answer}</span>
                    {selection.price && selection.price > 0 && (
                      <span>{formatToEuro(selection.price || 0)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between">
            <span>Subtotaal</span>
            <span>{formatToEuro(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Bezorgkosten</span>
            <span>{formatToEuro(deliveryCosts)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Totaal</span>
            <span>{formatToEuro(total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Annuleren
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Bezig...' : 'Bestelling plaatsen'}
        </Button>
      </div>
    </form>
  )
}
