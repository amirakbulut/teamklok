import { isAdmin } from '@/access/isAdmin'
import { isAdminOrPublished } from '@/access/isAdminOrPublished'
import { CollectionConfig } from 'payload'

export const BezorgGebieden: CollectionConfig = {
  slug: 'bezorg-gebieden',
  labels: {
    singular: 'Bezorg gebied',
    plural: 'Bezorg gebieden',
  },
  admin: {
    useAsTitle: 'zipCode',
    group: 'Instellingen',
    hidden: ({ user }) => {
      // reuse your access control function
      return !isAdmin({ req: { user } as any })
      // Payload expects you to return true = hide, false = show
    },
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdminOrPublished,
    update: isAdmin,
  },
  fields: [
    {
      name: 'zipCode',
      label: 'Postcode',
      type: 'text',
      required: true,
    },
    {
      name: 'minOrder',
      label: 'Min. bestelwaarde',
      type: 'number',
      required: true,
    },
    {
      name: 'deliveryCosts',
      label: 'Bezorgkosten',
      type: 'number',
      required: true,
    },
    {
      name: 'freeDeliveryFrom',
      label: 'Gratis bezorgen vanaf',
      type: 'number',
    },
    {
      name: 'deliveryTime',
      label: 'Bezorgtijd in minuten',
      type: 'number',
    },
    {
      name: 'active',
      label: 'Actief',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
