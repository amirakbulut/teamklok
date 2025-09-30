import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  label?: string
  className?: string
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max,
  label = 'Aantal',
  className,
}: QuantitySelectorProps) {
  const handleDecrease = () => {
    const newValue = Math.max(min, value - 1)
    onChange(newValue)
  }

  const handleIncrease = () => {
    const newValue = max ? Math.min(max, value + 1) : value + 1
    onChange(newValue)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Math.max(min, parseInt(e.target.value) || min)
    const finalValue = max ? Math.min(max, newValue) : newValue
    onChange(finalValue)
  }

  return (
    <div className={`space-y-2 ${className || ''}`}>
      <Label htmlFor="quantity">{label}</Label>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={handleDecrease} disabled={value <= min}>
          -
        </Button>
        <Input
          id="quantity"
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={handleInputChange}
          className="w-20 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleIncrease}
          disabled={max ? value >= max : false}
        >
          +
        </Button>
      </div>
    </div>
  )
}
