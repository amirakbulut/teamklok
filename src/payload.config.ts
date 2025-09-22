// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'

import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import sharp from 'sharp' // sharp-import
import { fileURLToPath } from 'url'

import { defaultLexical } from '@/fields/defaultLexical'
import { Admins } from './collections/Admins'
import { BezorgGebieden } from './collections/Bezorggebieden'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { MenuCategories } from './collections/MenuCategories'
import { MenuItems } from './collections/MenuItems'
import { Keuzemenus } from './collections/MenuKeuzeMenu'
import { Orders } from './collections/Orders'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { BusinessHours } from './Globals/businessHours'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ['@/components/BeforeDashboard'],
      views: {
        ordersKanban: {
          path: '/bestellingenlist',
          Component: '@/components/admin/KanBanWrapper',
        },
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Admins.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  collections: [
    Pages,
    Posts,
    Media,
    Categories,
    Admins,
    Users,
    MenuCategories,
    MenuItems,
    Keuzemenus,
    BezorgGebieden,
    Orders,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer, BusinessHours],
  plugins: [
    ...plugins,
    // storage-adapter-placeholder
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
})
