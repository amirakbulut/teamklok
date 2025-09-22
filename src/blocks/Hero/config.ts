import type { Block } from 'payload'

export const Hero: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      required: true,
    },
    {
      name: 'links',
      type: 'array',
      fields: [
        {
          name: 'link-type',
          type: 'select',
          options: [
            {
              label: 'Page',
              value: 'page',
            },
            {
              label: 'Custom URL',
              value: 'custom',
            },
          ],
        },
        {
          name: 'link',
          type: 'relationship',
          relationTo: 'pages',
          label: 'Link',
          admin: {
            condition: (_, siblingData) => siblingData?.['link-type'] === 'page',
          },
        },
        {
          name: 'link_custom',
          type: 'group',
          label: 'URL',
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Title',
            },
            {
              name: 'url',
              type: 'text',
              label: 'URL',
            },
            {
              name: 'newTab',
              type: 'checkbox',
              label: 'Open in new tab',
            },
          ],
          admin: {
            condition: (_, siblingData) => siblingData?.['link-type'] === 'custom',
          },
        },
      ],
    },
  ],
  labels: {
    plural: 'Heroes',
    singular: 'Hero',
  },
}
