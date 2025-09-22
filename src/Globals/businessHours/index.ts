import { isAdmin } from '@/access/isAdmin'
import { isAdminOrPublished } from '@/access/isAdminOrPublished'
import { Field, GlobalConfig } from 'payload'

const businessHoursFields: Field[] = [
  {
    type: 'row',
    fields: [
      {
        name: 'open',
        type: 'date',
        admin: {
          width: '15%',
          date: {
            pickerAppearance: 'timeOnly', // shows only time picker in admin UI
            timeFormat: 'HH:mm',
            displayFormat: 'HH:mm',
            timeIntervals: 15,
          },
        },
      },
      {
        name: 'close',
        type: 'date',
        admin: {
          width: '15%',
          date: {
            pickerAppearance: 'timeOnly', // shows only time picker in admin UI
            timeFormat: 'HH:mm',
            displayFormat: 'HH:mm',
            timeIntervals: 15,
          },
        },
      },
    ],
  },
]

export const BusinessHours: GlobalConfig = {
  label: 'Openingstijden',
  slug: 'business-hours',
  admin: {
    group: 'Instellingen',
    hidden: ({ user }) => {
      // reuse your access control function
      return !isAdmin({ req: { user } as any })
      // Payload expects you to return true = hide, false = show
    },
  },
  access: {
    read: isAdminOrPublished,
    update: isAdmin,
  },
  fields: [
    {
      name: 'monday',
      label: 'Maandag',
      type: 'group',
      required: true,
      fields: businessHoursFields,
    },
    {
      name: 'tuesday',
      label: 'Dinsdag',
      type: 'group',
      required: true,
      fields: businessHoursFields,
    },
    {
      name: 'wednesday',
      label: 'Woensdag',
      type: 'group',
      required: true,
      fields: businessHoursFields,
    },
    {
      name: 'thursday',
      label: 'Donderdag',
      type: 'group',
      required: true,
      fields: businessHoursFields,
    },
    {
      name: 'friday',
      label: 'Vrijdag',
      type: 'group',
      required: true,
      fields: businessHoursFields,
    },
    {
      name: 'saturday',
      label: 'Zaterdag',
      type: 'group',
      required: true,
      fields: businessHoursFields,
    },
    {
      name: 'sunday',
      label: 'Zondag',
      type: 'group',
      required: true,
      fields: businessHoursFields,
    },
  ],
}
