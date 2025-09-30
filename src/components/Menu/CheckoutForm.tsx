'use client'

import { useCartStorage } from '@/hooks/useCartStorage'
import { useOrderForm } from '@/hooks/useOrderForm'
import { calculateDeliveryCosts, calculateFinalTotal, calculateSubtotal } from '@/utilities'
import { useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FormField,
  GooglePlacesAutocomplete,
  Input,
  Label,
  PriceDisplay,
  RadioGroup,
  RadioGroupItem,
  Separator,
} from '..'
import { OrderItem } from './MenuItemModal'

interface CheckoutFormProps {
  cartItems: OrderItem[]
  onClose: () => void
}

export const CheckoutForm = ({ cartItems, onClose }: CheckoutFormProps) => {
  const { customerInfo, updateCustomerInfo, clearAll } = useCartStorage()
  const { submitOrder, isSubmitting, error, isSuccess, reset } = useOrderForm()

  const [formData, setFormData] = useState({
    name: customerInfo.name,
    email: customerInfo.email,
    phone: customerInfo.phone,
    address: customerInfo.address,
    houseNumber: customerInfo.houseNumber,
    city: customerInfo.city,
    postalCode: customerInfo.postalCode,
    deliveryMethod: customerInfo.deliveryMethod,
    paymentMethod: customerInfo.paymentMethod,
  })

  // Update form data and localStorage in one function
  const updateFormData = (updates: Partial<typeof formData>) => {
    const newFormData = { ...formData, ...updates }
    setFormData(newFormData)
    updateCustomerInfo(newFormData)
  }

  const subtotal = calculateSubtotal(cartItems)
  const deliveryCosts = calculateDeliveryCosts(formData.deliveryMethod)
  const total = calculateFinalTotal(cartItems, formData.deliveryMethod)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await submitOrder(
        cartItems,
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          houseNumber: formData.houseNumber,
          city: formData.city,
          postalCode: formData.postalCode,
        },
        formData.deliveryMethod,
        formData.paymentMethod,
      )

      // Clear cart and customer info after successful order
      clearAll()
    } catch (error) {
      console.error('Order submission failed:', error)
      alert('Er is een fout opgetreden. Neem telefonisch contact met ons op.')
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
            <FormField label="Naam" htmlFor="name" required>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
                required
              />
            </FormField>
            <FormField label="E-mail" htmlFor="email" required>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value })}
                required
              />
            </FormField>
          </div>
          <FormField label="Telefoonnummer" htmlFor="phone" required>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: e.target.value })}
              required
            />
          </FormField>
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
              <GooglePlacesAutocomplete
                value={formData.address}
                onChange={(value) => {
                  updateFormData({
                    address: value.address,
                    houseNumber: value.houseNumber,
                    postalCode: value.postalCode,
                    city: value.city,
                  })
                }}
                placeholder="Voer je adres in..."
                required
              />
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
                <PriceDisplay price={item.menuItem.price * item.quantity} />
              </div>
              <div className="flex flex-col justify-between text-sm text-muted-foreground ml-3 italic">
                {item.customWishes && <span>• {item.customWishes}</span>}
                {item.keuzemenuSelections.map((selection) => (
                  <div key={selection.questionId}>
                    <span>• {selection.answer}</span>
                    {selection.price && selection.price > 0 && (
                      <PriceDisplay price={selection.price || 0} size="sm" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between">
            <span>Subtotaal</span>
            <PriceDisplay price={subtotal} />
          </div>
          <div className="flex justify-between">
            <span>Bezorgkosten</span>
            <PriceDisplay price={deliveryCosts} />
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Totaal</span>
            <PriceDisplay price={total} size="lg" />
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
