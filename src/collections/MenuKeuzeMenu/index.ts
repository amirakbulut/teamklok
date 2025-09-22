import { anyone } from '@/access/anyone'
import { isAdmin } from '@/access/isAdmin'
import { CollectionConfig } from 'payload'

// word: MenuOptions
export const Keuzemenus: CollectionConfig = {
  slug: 'keuzemenus',
  admin: {
    useAsTitle: 'title',
    group: 'Menu',
  },
  labels: {
    singular: 'Keuzemenu',
    plural: 'Keuzemenus',
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: anyone,
    update: isAdmin,
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          name: 'Algemeen',
          fields: [
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
              name: 'Gerechten',
              type: 'join',
              collection: 'menu-items',
              on: 'keuzemenus',
              hasMany: true,
              admin: {
                allowCreate: false,
              },
            },
          ],
        },
        {
          name: 'Vragen',
          fields: [
            {
              name: 'questions',
              type: 'array',
              fields: [
                {
                  name: 'question',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'questionType',
                  type: 'select',
                  options: [
                    {
                      label: 'Single Choice (Radio)',
                      value: 'radio',
                    },
                    {
                      label: 'Multiple Choice (Checkbox)',
                      value: 'checkbox',
                    },
                  ],
                  defaultValue: 'radio',
                  required: true,
                },
                {
                  name: 'options',
                  type: 'array',
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                      required: true,
                    },
                    {
                      name: 'price',
                      type: 'number',
                      admin: {
                        description: 'Optional price for this option (leave empty for free)',
                      },
                    },
                  ],
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'title',
      type: 'text',
      admin: {
        hidden: true,
      },
      hooks: {
        beforeChange: [
          ({ data }) => {
            return data?.title
          },
        ],
      },
    },
  ],
}
