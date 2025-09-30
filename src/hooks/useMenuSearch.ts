import { useDebounce } from '@/utilities/useDebounce'
import { useQuery } from '@tanstack/react-query'

interface MenuItem {
  id: string
  title: string
  description: string
  price: number
  image?: {
    url: string
    alt?: string
  }
  menuCategory: {
    title: string
    slug: string
  }
  slug: string
}

interface MenuSearchResult {
  items: MenuItem[]
  categories: Array<{
    title: string
    slug: string
    itemCount: number
  }>
}

export function useMenuSearch(query: string) {
  const debouncedQuery = useDebounce(query, 300)

  return useQuery({
    queryKey: ['menu-search', debouncedQuery],
    queryFn: async (): Promise<MenuSearchResult> => {
      if (!debouncedQuery.trim()) {
        return { items: [], categories: [] }
      }

      const response = await fetch(`/api/menu/search?q=${encodeURIComponent(debouncedQuery)}`)
      if (!response.ok) {
        throw new Error('Failed to search menu')
      }
      return response.json()
    },
    enabled: debouncedQuery.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
