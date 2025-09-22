import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'
import { isAdminOrSelf } from '@/access/isAdminOrSelf'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdminOrSelf,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },

  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
  ],
  timestamps: true,
}
