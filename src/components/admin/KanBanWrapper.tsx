import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import { AdminViewServerProps } from 'payload'
import KanBan from './KanBan'

export default async function KanBanWrapper({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  // Fetch orders for today
  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

  const orders = await initPageResult.req.payload.find({
    collection: 'orders',
    where: {
      orderDate: {
        greater_than_equal: startOfDay.toISOString(),
        less_than: endOfDay.toISOString(),
      },
    },
    depth: 2,
    sort: 'orderDate',
  })

  return (
    <DefaultTemplate
      i18n={initPageResult.req?.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={initPageResult.req.payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={initPageResult.req.user || undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter>
        <KanBan initialOrders={orders.docs} />
      </Gutter>
    </DefaultTemplate>
  )
}
