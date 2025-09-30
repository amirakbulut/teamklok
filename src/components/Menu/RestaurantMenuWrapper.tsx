'use client'

import { useCartStorage } from '@/hooks/useCartStorage'
import type { MenuCategory, MenuItem } from '@/payload-types'
import { formatToEuro } from '@/utilities'
import { ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { MenuSearch } from '../MenuSearch'
import { Button } from '../ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { CartDrawer } from './CartDrawer'
import { MenuItemModal, OrderItem } from './MenuItemModal'
import { RestaurantMenuClient } from './RestaurantMenuClient'

interface RestaurantMenuWrapperProps {
  categories: MenuCategory[]
}

export const RestaurantMenuWrapper = ({ categories }: RestaurantMenuWrapperProps) => {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  const { cartItems, isLoaded, addToCart, updateQuantity, removeItem, clearCart } = useCartStorage()

  const handleCardClick = (item: MenuItem) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedItem(null)
  }

  const handleAddToCart = (orderItem: OrderItem) => {
    addToCart(orderItem)
    setIsCartOpen(true) // Open cart drawer when item is added
  }

  const handleUpdateQuantity = (index: number, quantity: number) => {
    updateQuantity(index, quantity)
  }

  const handleRemoveItem = (index: number) => {
    removeItem(index)
  }

  const handleClearCart = () => {
    clearCart()
  }

  const getTotalItems = (): number => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <>
      <div className="space-y-8">
        <MenuSearch />

        {/* Sticky tabs */}
        <RestaurantMenuClient categories={categories} />

        {/* All categories and items */}
        <div className="space-y-12">
          {categories?.map((category) => (
            <div key={category.slug} id={category.slug ?? ''} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">{category.title}</h2>
                {category.description && (
                  <p className="text-muted-foreground mt-2">{category.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.menuItems?.docs
                  ?.filter((item): item is MenuItem => typeof item === 'object' && item !== null)
                  ?.map((item) => (
                    <Card
                      key={item.slug}
                      className="w-full cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleCardClick(item)}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <CardDescription>{item.description}</CardDescription>
                      </CardHeader>
                      <CardFooter>
                        <p className="text-lg font-semibold">{formatToEuro(item.price)}</p>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Button - Fixed position */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setIsCartOpen(true)}
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          Bestelling
          {getTotalItems() > 0 && (
            <span className="ml-2 bg-background text-primary text-xs px-2 py-1 rounded-full">
              {getTotalItems()}
            </span>
          )}
        </Button>
      </div>

      {/* Modal */}
      <MenuItemModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />
    </>
  )
}
