import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { RestaurantMenuWrapper } from './RestaurantMenuWrapper'

export const RestaurantMenu = async () => {
  const payload = await getPayload({ config: configPromise })

  // Fetch categories with menu items and their keuzemenus
  const categories = await payload.find({
    collection: 'menu-categories',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    sort: 'priority',
    depth: 2,
    populate: {
      'menu-items': {
        title: true,
        description: true,
        price: true,
        slug: true,
        keuzemenus: true,
      },
    },
  })

  return <RestaurantMenuWrapper categories={categories.docs} />
}
