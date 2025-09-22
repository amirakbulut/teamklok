'use client'

import { MenuCategory } from '@/payload-types'
import { useEffect, useRef, useState } from 'react'
import { ScrollArea, ScrollBar } from '../ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'

interface RestaurantMenuClientProps {
  categories: MenuCategory[]
}

export const RestaurantMenuClient = ({ categories }: RestaurantMenuClientProps) => {
  const [activeTab, setActiveTab] = useState(categories?.[0]?.slug ?? '')
  const tabsListRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 70 // Match the scroll offset
      const documentHeight = document.documentElement.scrollHeight
      const windowHeight = window.innerHeight
      const isAtBottom = scrollPosition + windowHeight >= documentHeight - 10 // 10px tolerance

      // If at bottom of page, set the last category as active
      if (isAtBottom && categories && categories.length > 0) {
        const lastCategory = categories[categories.length - 1]
        setActiveTab(lastCategory.slug ?? '')

        // Auto-scroll the active tab into view
        const activeTabElement = document.querySelector(`[data-state="active"]`) as HTMLElement
        if (activeTabElement && scrollAreaRef.current) {
          const scrollArea = scrollAreaRef.current
          const scrollContainer = scrollArea.querySelector(
            '[data-radix-scroll-area-viewport]',
          ) as HTMLElement

          if (scrollContainer) {
            const tabRect = activeTabElement.getBoundingClientRect()
            const containerRect = scrollContainer.getBoundingClientRect()

            // Check if tab is out of view
            if (tabRect.left < containerRect.left || tabRect.right > containerRect.right) {
              const tabOffsetLeft = activeTabElement.offsetLeft
              const containerWidth = scrollContainer.clientWidth
              const tabWidth = activeTabElement.offsetWidth

              // Calculate the position to center the tab
              const targetScrollLeft = tabOffsetLeft - containerWidth / 2 + tabWidth / 2

              scrollContainer.scrollTo({
                left: targetScrollLeft,
                behavior: 'smooth',
              })
            }
          }
        }
        return
      }

      // Find which section is currently in view
      for (const category of categories || []) {
        const section = document.getElementById(category.slug ?? '')
        if (section) {
          const { offsetTop, offsetHeight } = section
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveTab(category.slug ?? '')

            // Auto-scroll the active tab into view
            const activeTabElement = document.querySelector(`[data-state="active"]`) as HTMLElement
            if (activeTabElement && scrollAreaRef.current) {
              const scrollArea = scrollAreaRef.current
              const scrollContainer = scrollArea.querySelector(
                '[data-radix-scroll-area-viewport]',
              ) as HTMLElement

              if (scrollContainer) {
                const tabRect = activeTabElement.getBoundingClientRect()
                const containerRect = scrollContainer.getBoundingClientRect()

                // Check if tab is out of view
                if (tabRect.left < containerRect.left || tabRect.right > containerRect.right) {
                  const tabOffsetLeft = activeTabElement.offsetLeft
                  const containerWidth = scrollContainer.clientWidth
                  const tabWidth = activeTabElement.offsetWidth

                  // Calculate the position to center the tab
                  const targetScrollLeft = tabOffsetLeft - containerWidth / 2 + tabWidth / 2

                  scrollContainer.scrollTo({
                    left: targetScrollLeft,
                    behavior: 'smooth',
                  })
                }
              }
            }
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [categories])

  const scrollToSection = (categorySlug: string) => {
    const section = document.getElementById(categorySlug)
    if (section) {
      // Scroll with offset to account for sticky navigation height
      const elementPosition = section.offsetTop
      const offsetPosition = elementPosition - 70 // Match the scroll detection offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <ScrollArea ref={scrollAreaRef}>
        <Tabs value={activeTab} onValueChange={scrollToSection}>
          <TabsList ref={tabsListRef} className="w-full justify-start">
            {categories?.map((category) => (
              <TabsTrigger key={category.slug} value={category.slug ?? ''} className="py-4">
                {category.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
