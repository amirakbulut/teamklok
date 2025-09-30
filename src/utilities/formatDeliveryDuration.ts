export function formatDeliveryDuration(minutes: number): string {
  if (minutes <= 0) {
    return 'Afhalen'
  }

  if (minutes <= 30) {
    return `${minutes} min`
  } else {
    const minTime = Math.max(15, minutes - 15)
    const maxTime = minutes + 15
    return `${minTime}-${maxTime} min`
  }
}
