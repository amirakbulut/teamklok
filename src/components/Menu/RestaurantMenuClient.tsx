'use client'

import { useScrollToSection } from '@/hooks'
import { MenuCategory } from '@/payload-types'
import { ScrollArea, ScrollBar } from '../ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'

interface RestaurantMenuClientProps {
  categories: MenuCategory[]
}

export const RestaurantMenuClient = ({ categories }: RestaurantMenuClientProps) => {
  const { activeSection, scrollToSection, scrollAreaRef } = useScrollToSection(
    categories.map((category) => ({ slug: category.slug ?? '', title: category.title ?? '' })),
    {
      offset: 70,
    },
  )

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <ScrollArea ref={scrollAreaRef}>
        <Tabs value={activeSection} onValueChange={scrollToSection}>
          <TabsList className="w-full justify-start">
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
