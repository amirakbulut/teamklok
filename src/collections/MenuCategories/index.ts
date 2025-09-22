import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { isAdmin } from '@/access/isAdmin'
import { slugField } from '@/fields/slug'

export const MenuCategories: CollectionConfig = {
  slug: 'menu-categories',
  labels: {
    singular: 'Menu categorie',
    plural: 'Menu categorieën',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Menu',
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: anyone,
    update: isAdmin,
  },
  fields: [
    {
      name: 'priority',
      type: 'number',
      // required: true,
      admin: {
        position: 'sidebar',
        description: 'Controls the priority categories appear in',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'text',
    },
    {
      name: 'menuItems',
      type: 'join',
      collection: 'menu-items',
      on: 'menuCategory',
      hasMany: true,
      maxDepth: 2,
    },
    ...slugField(),
  ],
}
