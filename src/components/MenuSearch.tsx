'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMenuSearch } from '@/hooks/useMenuSearch'
import { formatToEuro } from '@/utilities'
import { Search as SearchIcon, X } from 'lucide-react'
import React, { useState } from 'react'

export const MenuSearch: React.FC = () => {
  const [value, setValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const { data, isLoading, error } = useMenuSearch(value)

  const handleClear = () => {
    setValue('')
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <form
        onSubmit={(e) => {
          e.preventDefault()
        }}
        className="relative"
      >
        <Label htmlFor="search" className="sr-only">
          Zoek menu items
        </Label>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            value={value}
            onChange={(event) => {
              setValue(event.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Zoek gerechten..."
            className="pl-10 pr-10"
          />
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && value && (
        <div className="absolute top-full z-50 mt-2 w-full max-w-md">
          <Card className="max-h-96 overflow-y-auto">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Zoekresultaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading && (
                <div className="text-center py-4 text-sm text-muted-foreground">Zoeken...</div>
              )}

              {error && (
                <div className="text-center py-4 text-sm text-destructive">
                  Er is een fout opgetreden bij het zoeken
                </div>
              )}

              {data && data.items.length === 0 && !isLoading && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  Geen gerechten gevonden voor "{value}"
                </div>
              )}

              {data && data.items.length > 0 && (
                <div className="space-y-3">
                  {/* Categories */}
                  {data.categories.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-2">
                        Categorieën
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {data.categories.map((category) => (
                          <Badge key={category.slug} variant="secondary" className="text-xs">
                            {category.title} ({category.itemCount})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Menu Items */}
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Gerechten</h4>
                    <div className="space-y-2">
                      {data.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                          onClick={() => {
                            // Navigate to menu section or scroll to item
                            const categoryElement = document.getElementById(
                              item.menuCategory?.slug || '',
                            )
                            if (categoryElement) {
                              categoryElement.scrollIntoView({ behavior: 'smooth' })
                              setIsOpen(false)
                            }
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {item.description}
                            </p>
                            {item.menuCategory && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {item.menuCategory.title}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm font-medium ml-2">{formatToEuro(item.price)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Overlay to close search */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  )
}
