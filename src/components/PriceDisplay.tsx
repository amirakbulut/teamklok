import { cn } from '@/utilities'
import { formatToEuro } from '@/utilities/formatToEuro'

interface PriceDisplayProps {
  price: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'muted' | 'accent'
}

export function PriceDisplay({
  price,
  className,
  size = 'md',
  variant = 'default',
}: PriceDisplayProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  const variantClasses = {
    default: 'text-foreground',
    muted: 'text-muted-foreground',
    accent: 'text-primary',
  }

  return (
    <span className={cn('font-medium', sizeClasses[size], variantClasses[variant], className)}>
      {formatToEuro(price)}
    </span>
  )
}
