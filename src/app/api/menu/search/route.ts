import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ items: [], categories: [] })
    }

    const payload = await getPayload({ config: configPromise })

    // Search menu items
    const { docs: menuItems } = await payload.find({
      collection: 'menu-items',
      where: {
        or: [
          {
            title: {
              contains: query,
            },
          },
          {
            description: {
              contains: query,
            },
          },
        ],
      },
      depth: 2,
      limit: 50,
      sort: 'title',
    })

    // Get unique categories from search results
    const categoryMap = new Map()
    menuItems.forEach((item) => {
      if (item.menuCategory && typeof item.menuCategory === 'object') {
        const category = item.menuCategory
        if (!categoryMap.has(category.slug)) {
          categoryMap.set(category.slug, {
            title: category.title,
            slug: category.slug,
            itemCount: 1,
          })
        } else {
          categoryMap.get(category.slug).itemCount++
        }
      }
    })

    const categories = Array.from(categoryMap.values())

    // Format menu items for response
    const formattedItems = menuItems.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price,
      image:
        item.image && typeof item.image === 'object'
          ? {
              url: item.image.url,
              alt: item.image.alt || item.title,
            }
          : undefined,
      menuCategory:
        item.menuCategory && typeof item.menuCategory === 'object'
          ? {
              title: item.menuCategory.title,
              slug: item.menuCategory.slug,
            }
          : undefined,
      slug: item.slug,
    }))

    return NextResponse.json({
      items: formattedItems,
      categories,
    })
  } catch (error) {
    console.error('Menu search error:', error)
    return NextResponse.json({ error: 'Failed to search menu' }, { status: 500 })
  }
}
