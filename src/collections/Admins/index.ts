import type { CollectionConfig } from 'payload'

export const Admins: CollectionConfig = {
  slug: 'admins',
  // access: {
  //   admin: authenticated,
  //   create: authenticated,
  //   delete: authenticated,
  //   read: authenticated,
  //   update: authenticated,
  // },
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
