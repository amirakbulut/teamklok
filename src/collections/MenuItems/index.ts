import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { isAdmin } from '@/access/isAdmin'
import { slugField } from '@/fields/slug'

export const MenuItems: CollectionConfig = {
  slug: 'menu-items',
  admin: {
    useAsTitle: 'title',
    group: 'Menu',
    hidden: ({ user }) => {
      // reuse your access control function
      return !isAdmin({ req: { user } as any })
      // Payload expects you to return true = hide, false = show
    },
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: anyone,
    update: isAdmin,
  },
  fields: [
    {
      type: 'checkbox',
      name: 'Op voorraad',
      defaultValue: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'text',
      required: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'price',
      type: 'number',
      required: true,
    },
    {
      name: 'menuCategory',
      type: 'relationship',
      relationTo: 'menu-categories',
      required: true,
    },
    {
      name: 'keuzemenus',
      type: 'relationship',
      relationTo: 'keuzemenus',
      hasMany: true,
    },
    ...slugField(),
  ],
}
