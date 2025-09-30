'use client'

import { Button } from '@/components/ui/button'
import { Order } from '@/payload-types'
import { formatToEuro } from '@/utilities/formatToEuro'
import { Printer } from 'lucide-react'
import React from 'react'

interface PrintReceiptButtonProps {
  order: Order
  className?: string
  children?: React.ReactNode
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function PrintReceiptButton({
  order,
  className,
  children,
  variant = 'outline',
  size = 'default',
}: PrintReceiptButtonProps) {
  const getMenuItemName = (menuItem: any) => {
    if (typeof menuItem === 'object' && menuItem.title) {
      return menuItem.title
    }
    return `Menu Item #${menuItem}`
  }

  // todo: dynamic vat rate per product
  const calculateVAT = (amount: number, vatRate: number = 0.21) => {
    return amount * vatRate
  }

  // todo: dynamic vat rate per product
  const calculateNetAmount = (amount: number, vatRate: number = 0.21) => {
    return amount / (1 + vatRate)
  }

  const handlePrint = () => {
    // Calculate totals
    const itemsTotal =
      order.orderItems?.reduce((total, item) => {
        const price =
          typeof item.menuItem === 'object' && item.menuItem.price ? item.menuItem.price : 0
        return total + price
      }, 0) || 0

    const deliveryCosts = order.deliveryCosts || 0
    const totalAmount = itemsTotal + deliveryCosts
    const vatAmount = calculateVAT(totalAmount)
    const netAmount = calculateNetAmount(totalAmount)

    // Create receipt HTML
    const receiptHTML = `
      <!-- Order Header -->
      <div style="text-align: center; font-weight: bold; font-size: 18px; margin-bottom: 10px; padding: 5px; background: #f0f0f0;">
        ${order.deliveryMethod === 'delivery' ? 'Bezorging' : 'Afhaal'} om ${new Date(order.orderDate).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
      </div>

      <!-- Order Details -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 14px;">
        <span>Klant:</span>
        <span>${order.customerName || 'Onbekend'}</span>
      </div>
      ${
        order.customerPhone
          ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 14px;">
          <span>Telefoon:</span>
          <span>${order.customerPhone}</span>
        </div>
      `
          : ''
      }
      ${
        order.deliveryMethod === 'delivery' && order.deliveryAddress
          ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 14px;">
          <span>Adres:</span>
          <span style="max-width: 140px; text-align: right;">${order.deliveryAddress}</span>
        </div>
      `
          : ''
      }
      <div style="display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 14px;">
        <span>Betaling:</span>
        <span>${order.paymentMethod === 'online' ? 'Online' : order.paymentMethod === 'cash' ? 'Contant' : 'Contant + PIN'}</span>
      </div>
      
      <br />

      <!-- Items -->
      ${order.orderItems
        ?.map((item) => {
          const itemPrice =
            typeof item.menuItem === 'object' && item.menuItem.price ? item.menuItem.price : 0
          return `
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding-bottom: 5px; border-bottom: 1px dotted #ccc;">
            <div style="flex: 1; font-weight: bold; font-size: 13px;">
              ${getMenuItemName(item.menuItem)}
              ${
                item.answers && item.answers.length > 0
                  ? `
                <div style="font-size: 13px; font-weight: normal; color: #666; margin-top: 2px; font-style: italic;">
                  ${item.answers.map((answer) => `<div>• ${answer.answer}</div>`).join('')}
                </div>
              `
                  : ''
              }
            </div>
            <div style="font-weight: bold;">${formatToEuro(itemPrice)}</div>
          </div>
        `
        })
        .join('')}

      <!-- Totals -->
      <div style="margin-top: 15px; padding-top: 10px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 14px;">
          <span>Subtotaal:</span>
          <span>${formatToEuro(itemsTotal)}</span>
        </div>
        ${
          order.deliveryMethod === 'delivery' && deliveryCosts > 0
            ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 14px;">
            <span>Bezorgkosten:</span>
            <span>${formatToEuro(deliveryCosts)}</span>
          </div>
        `
            : ''
        }
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 14px;">
          <span>BTW (21%):</span>
          <span>${formatToEuro(vatAmount)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 14px; font-weight: bold; padding-top: 5px; margin-top: 5px;">
          <span>${order.paymentMethod === 'online' ? 'Betaald' : order.paymentMethod === 'cash' ? 'Te betalen' : 'Te betalen met PIN'}:</span>
          <span>${formatToEuro(totalAmount)}</span>
        </div>
      </div>
    `

    // Open print window
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Bon - ${order.orderId}</title>
            <style>
              body {
                font-family: 'Arial', sans-serif;
                font-size: 14px;
                line-height: 1.5;
                margin: 0;
                padding: 10px;
                max-width: 300px;
                margin: 0 auto;
                background: white;
              }
              @media print {
                body { margin: 0; padding: 10px; }
              }
            </style>
          </head>
          <body>
            ${receiptHTML}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()

      printWindow.onload = () => {
        printWindow.print()
        printWindow.close()
      }
    }
  }

  return (
    <Button onClick={handlePrint} variant={variant} size={size} className={className}>
      {children || (
        <>
          <Printer className="h-4 w-4" />
          Print Bon
        </>
      )}
    </Button>
  )
}
