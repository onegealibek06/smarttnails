const LOCALE_TAGS: Record<string, string> = { ru: 'ru-RU', kk: 'kk-KZ', en: 'en-GB' }

export const localeTag = (lang: string) => LOCALE_TAGS[lang] ?? 'ru-RU'

// Даты храним строкой YYYY-MM-DD в местном времени, чтобы не ловить сдвиги часовых поясов
export function toISODate(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function fromISODate(s: string) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y!, m! - 1, d!)
}

export function addDays(d: Date, n: number) {
  const copy = new Date(d)
  copy.setDate(copy.getDate() + n)
  return copy
}

// Время храним в минутах от полуночи: 570 → «09:30»
export function formatTime(min: number) {
  const h = String(Math.floor(min / 60)).padStart(2, '0')
  const m = String(min % 60).padStart(2, '0')
  return `${h}:${m}`
}

export function formatPrice(n: number, lang: string) {
  // У многих браузеров нет казахских правил для чисел: группы разрядов как в русском
  return new Intl.NumberFormat(lang === 'kk' ? 'ru-RU' : localeTag(lang)).format(n)
}

// Казахские названия пишем сами: Intl в части браузеров не знает kk и выдаёт английский
const KK_MONTHS = ['қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым', 'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан']
const KK_MONTHS_SHORT = ['қаң.', 'ақп.', 'нау.', 'сәу.', 'мам.', 'мау.', 'шіл.', 'там.', 'қыр.', 'қаз.', 'қар.', 'жел.']
const KK_WEEKDAYS = ['жексенбі', 'дүйсенбі', 'сейсенбі', 'сәрсенбі', 'бейсенбі', 'жұма', 'сенбі']
const KK_WEEKDAYS_SHORT = ['жс', 'дс', 'сс', 'ср', 'бс', 'жм', 'сб']

function formatKk(date: Date, opts: Intl.DateTimeFormatOptions) {
  const parts: string[] = []
  if (opts.weekday) parts.push((opts.weekday === 'long' ? KK_WEEKDAYS : KK_WEEKDAYS_SHORT)[date.getDay()]!)
  const dayMonth: string[] = []
  if (opts.day) dayMonth.push(String(date.getDate()))
  if (opts.month) dayMonth.push((opts.month === 'long' ? KK_MONTHS : KK_MONTHS_SHORT)[date.getMonth()]!)
  if (opts.year) dayMonth.push(String(date.getFullYear()))
  if (dayMonth.length) parts.push(dayMonth.join(' '))
  return parts.join(', ')
}

export function formatDay(
  iso: string,
  lang: string,
  opts: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' },
) {
  const date = fromISODate(iso)
  if (lang === 'kk') return formatKk(date, opts)
  return new Intl.DateTimeFormat(localeTag(lang), opts).format(date)
}

// Маска казахстанского номера: «87011234567» → «+7 701 123 45 67»
export function formatKzPhone(raw: string) {
  let digits = raw.replace(/\D/g, '')
  if (digits.startsWith('8')) digits = `7${digits.slice(1)}`
  if (digits && !digits.startsWith('7')) digits = `7${digits}`
  digits = digits.slice(0, 11)
  const parts = [digits.slice(1, 4), digits.slice(4, 7), digits.slice(7, 9), digits.slice(9, 11)].filter(Boolean)
  return digits ? `+7 ${parts.join(' ')}`.trim() : ''
}

export function whatsappLink(phone: string, text: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
}
