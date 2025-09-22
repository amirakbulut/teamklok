import { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: {
    singular: 'Order',
    plural: 'Orders',
  },
  fields: [
    {
      name: 'orderId',
      type: 'text',
      required: true,
    },
    {
      name: 'orderDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'timeOnly',
          timeFormat: 'HH:mm',
          displayFormat: 'HH:mm',
          timeIntervals: 15,
        },
      },
    },
    // {
    //   name: 'customer',
    //   type: 'relationship',
    //   relationTo: 'users',
    //   required: true,
    // },
    {
      name: 'orderItems',
      type: 'array',
      admin: {
        readOnly: true,
      },
      fields: [
        {
          name: 'menuItem',
          type: 'relationship',
          relationTo: 'menu-items',
          required: true,
          admin: {
            allowCreate: false,
          },
        },
        {
          name: 'answers',
          type: 'array',
          fields: [
            {
              name: 'question',
              type: 'text',
              required: true,
            },
            {
              name: 'answer',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'orderStatus',
      type: 'select',
      defaultValue: 'open',
      options: [
        {
          label: 'Open',
          value: 'open',
        },
        {
          label: 'Keuken',
          value: 'kitchen',
        },
        {
          label: 'Afgehaald',
          value: 'delivered',
        },
        {
          label: 'Geannuleerd',
          value: 'cancelled',
        },
      ],
    },
    {
      name: 'orderTotal',
      type: 'number',
      required: true,
    },
    {
      name: 'deliveryAddress',
      type: 'text',
      required: true,
    },
    {
      name: 'deliveryDuration',
      type: 'text',
      required: true,
    },
    {
      name: 'deliveryCosts',
      type: 'number',
      required: true,
    },
    {
      name: 'deliveryMethod',
      type: 'select',
      required: true,
      defaultValue: 'delivery',
      options: [
        {
          label: 'Bezorging',
          value: 'delivery',
        },
        {
          label: 'Afhalen',
          value: 'pickup',
        },
      ],
    },
    {
      name: 'paymentMethod',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Online betaling',
          value: 'online',
        },
        {
          label: 'Contant betaling',
          value: 'cash',
        },
        {
          label: 'Contant met pin',
          value: 'cash_pin',
        },
      ],
    },
    {
      name: 'paymentStatus',
      type: 'select',
      defaultValue: 'not_paid',
      options: [
        {
          label: 'Betaald',
          value: 'paid',
        },
        {
          label: 'Niet betaald',
          value: 'not_paid',
        },
        {
          label: 'In behandeling',
          value: 'processing',
        },
      ],
    },
  ],
}
