'use client'

import type { MenuItem } from '@/payload-types'
import { useEffect, useState } from 'react'

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

interface CustomerInfo {
  name: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  deliveryMethod: 'delivery' | 'pickup'
  paymentMethod: 'online' | 'cash' | 'cash_pin'
}

const CART_STORAGE_KEY = 'lapizza-cart'
const CUSTOMER_STORAGE_KEY = 'lapizza-customer'

export const useCartStorage = () => {
  const [cartItems, setCartItems] = useState<OrderItem[]>([])
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    deliveryMethod: 'delivery',
    paymentMethod: 'online',
  })
  const [isLoaded, setIsLoaded] = useState(false)
  // watch for changes in the cart items
  useEffect(() => {
    console.log('cartItems', cartItems)
  }, [cartItems])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      // Load cart items
      const savedCart = localStorage.getItem(CART_STORAGE_KEY)
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart)
        }
      }

      // Load customer info
      const savedCustomer = localStorage.getItem(CUSTOMER_STORAGE_KEY)
      if (savedCustomer) {
        const parsedCustomer = JSON.parse(savedCustomer)
        if (parsedCustomer && typeof parsedCustomer === 'object') {
          setCustomerInfo((prev) => ({ ...prev, ...parsedCustomer }))
        }
      }
    } catch (error) {
      console.error('Failed to load cart/customer data from localStorage:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save cart items to localStorage whenever cart changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error)
      }
    }
  }, [cartItems, isLoaded])

  // Save customer info to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customerInfo))
      } catch (error) {
        console.error('Failed to save customer info to localStorage:', error)
      }
    }
  }, [customerInfo, isLoaded])

  const addToCart = (newItem: OrderItem) => {
    setCartItems((prev) => {
      // Check if an identical item already exists
      const existingItemIndex = prev.findIndex((existingItem) => {
        // Check if it's the same menu item
        if (existingItem.menuItem.id !== newItem.menuItem.id) {
          return false
        }

        // Check if custom wishes are the same
        if (existingItem.customWishes !== newItem.customWishes) {
          return false
        }

        // Check if keuzemenu selections are the same
        if (existingItem.keuzemenuSelections.length !== newItem.keuzemenuSelections.length) {
          return false
        }

        // Check each keuzemenu selection
        for (let i = 0; i < existingItem.keuzemenuSelections.length; i++) {
          const existing = existingItem.keuzemenuSelections[i]
          const newSelection = newItem.keuzemenuSelections[i]

          if (
            existing.questionId !== newSelection.questionId ||
            existing.question !== newSelection.question ||
            JSON.stringify(existing.answer) !== JSON.stringify(newSelection.answer) ||
            existing.price !== newSelection.price
          ) {
            return false
          }
        }

        return true
      })

      if (existingItemIndex !== -1) {
        // Item exists, increase quantity
        return prev.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item,
        )
      } else {
        // Item doesn't exist, add as new item
        return [...prev, newItem]
      }
    })
  }

  const updateQuantity = (index: number, quantity: number) => {
    setCartItems((prev) => prev.map((item, i) => (i === index ? { ...item, quantity } : item)))
  }

  const removeItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index))
  }

  const clearCart = () => {
    setCartItems([])
  }

  const updateCustomerInfo = (info: Partial<CustomerInfo>) => {
    setCustomerInfo((prev) => ({ ...prev, ...info }))
  }

  const clearCustomerInfo = () => {
    setCustomerInfo({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      deliveryMethod: 'delivery',
      paymentMethod: 'online',
    })
  }

  const clearAll = () => {
    clearCart()
    clearCustomerInfo()
  }

  return {
    cartItems,
    customerInfo,
    isLoaded,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    updateCustomerInfo,
    clearCustomerInfo,
    clearAll,
  }
}
