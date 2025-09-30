import clsx from 'clsx'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { loading: loadingFromProps, priority: priorityFromProps, className } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  return (
    /* eslint-disable @next/next/no-img-element */
    <img
      alt="La Pizza Logo"
      width={150}
      height={150}
      loading={loading}
      fetchPriority={priority}
      decoding="async"
      className={clsx('max-w-50 w-full', className)}
      src="/media/logo.svg"
    />
  )
}
