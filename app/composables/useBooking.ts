import { locations, services, type Location } from '~/data/salon'

// Адрес, по которому мастер принимает в конкретный день
export function locationFor(date: string): Location {
  const sorted = [...locations].sort((a, b) => a.from.localeCompare(b.from))
  let current = sorted[0]!
  for (const loc of sorted) {
    if (loc.from <= date) current = loc
  }
  return current
}

export function upcomingMove(today: string): Location | null {
  return locations.find(loc => loc.from > today) ?? null
}

// Выбор услуг в прайсе: из них собирается сообщение для записи в WhatsApp
export function useBooking() {
  const selected = useState<string[]>('booking:selected', () => [])

  const chosenServices = computed(() => services.filter(s => selected.value.includes(s.id)))
  const totalDuration = computed(() => chosenServices.value.reduce((sum, s) => sum + s.duration, 0))
  const totalPrice = computed(() => chosenServices.value.reduce((sum, s) => sum + s.price, 0))

  function toggleService(id: string) {
    selected.value = selected.value.includes(id)
      ? selected.value.filter(x => x !== id)
      : [...selected.value, id]
  }

  return { selected, chosenServices, totalDuration, totalPrice, toggleService }
}
