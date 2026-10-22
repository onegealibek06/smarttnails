import { salon, services, locations, type Location } from '~/data/salon'
import { addDays, formatTime, toISODate } from '~/utils/format'

export interface Booking {
  id: string
  date: string
  start: number
  duration: number
  services: string[]
  name: string
  phone: string
  comment: string
  remind: boolean
  createdAt: number
}

const STORAGE_KEY = 'smarttnails:bookings'

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

// Демо: пока нет настоящей базы, «занятые» окна генерируются из даты,
// чтобы календарь выглядел как живой рабочий день. Одна дата — всегда одинаковые окна.
function demoBusy(date: string): Array<[number, number]> {
  let seed = 0
  for (const ch of date) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 2 ** 32
  }
  const blocks: Array<[number, number]> = []
  const count = 2 + Math.floor(rand() * 3)
  for (let i = 0; i < count; i++) {
    const start = salon.workStart + Math.floor(rand() * 24) * salon.slotStep
    const length = [60, 90, 120][Math.floor(rand() * 3)]!
    blocks.push([start, Math.min(start + length, salon.workEnd)])
  }
  return blocks
}

export function bookingToIcs(booking: Booking, title: string, address: string) {
  const stamp = (date: string, min: number) =>
    `${date.replaceAll('-', '')}T${formatTime(min).replace(':', '')}00`
  const escape = (s: string) => s.replace(/[,;\\]/g, m => `\\${m}`)
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Smarttnails//Booking//RU',
    'BEGIN:VEVENT',
    `UID:${booking.id}@smarttnails`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${stamp(booking.date, booking.start)}`,
    `DTEND:${stamp(booking.date, booking.start + booking.duration)}`,
    `SUMMARY:${escape(title)}`,
    `LOCATION:${escape(address)}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT3H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escape(title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export function useBooking() {
  const selected = useState<string[]>('booking:selected', () => [])
  const bookings = useState<Booking[]>('booking:list', () => [])
  const loaded = useState('booking:loaded', () => false)

  function load() {
    if (!import.meta.client || loaded.value) return
    try {
      bookings.value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    } catch {
      bookings.value = []
    }
    loaded.value = true
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings.value))
    } catch {
      // Приватный режим браузера: запись живёт до перезагрузки страницы
    }
  }

  const chosenServices = computed(() => services.filter(s => selected.value.includes(s.id)))
  const totalDuration = computed(() => chosenServices.value.reduce((sum, s) => sum + s.duration, 0))
  const totalPrice = computed(() => chosenServices.value.reduce((sum, s) => sum + s.price, 0))

  function toggleService(id: string) {
    selected.value = selected.value.includes(id)
      ? selected.value.filter(x => x !== id)
      : [...selected.value, id]
  }

  function selectService(id: string) {
    if (!selected.value.includes(id)) selected.value = [...selected.value, id]
  }

  function freeSlots(date: string, duration: number, now = new Date()) {
    if (!duration) return []
    const busy = [
      ...demoBusy(date),
      ...bookings.value
        .filter(b => b.date === date)
        .map(b => [b.start, b.start + b.duration] as [number, number]),
    ]
    // Сегодня записываем не раньше чем через час
    const minStart = date === toISODate(now) ? now.getHours() * 60 + now.getMinutes() + 60 : 0
    const slots: number[] = []
    for (let start = salon.workStart; start + duration <= salon.workEnd; start += salon.slotStep) {
      if (start < minStart) continue
      if (busy.some(([a, b]) => start < b && start + duration > a)) continue
      slots.push(start)
    }
    return slots
  }

  function nearestSlot(duration: number, days = 7, now = new Date()) {
    for (let offset = 0; offset < days; offset++) {
      const date = toISODate(addDays(now, offset))
      const slots = freeSlots(date, duration, now)
      if (slots.length) return { date, start: slots[0]!, offset }
    }
    return null
  }

  function book(data: Omit<Booking, 'id' | 'createdAt'>) {
    const booking: Booking = {
      ...data,
      id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
      createdAt: Date.now(),
    }
    bookings.value = [...bookings.value, booking]
    persist()
    return booking
  }

  function cancel(id: string) {
    bookings.value = bookings.value.filter(b => b.id !== id)
    persist()
  }

  const upcoming = computed(() => {
    const today = toISODate(new Date())
    return bookings.value
      .filter(b => b.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start)
  })

  return {
    selected,
    chosenServices,
    totalDuration,
    totalPrice,
    toggleService,
    selectService,
    freeSlots,
    nearestSlot,
    book,
    cancel,
    upcoming,
    load,
  }
}
