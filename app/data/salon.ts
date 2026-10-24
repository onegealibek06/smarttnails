// Все данные студии в одном месте: поменяли здесь — поменялось на всём сайте.

// Варианты логотипа из обсуждения: mix — курсив-микс, dot — ноготок вместо точки,
// tt — двойное tt, badge — значок-стикер
export type LogoVariant = 'mix' | 'dot' | 'tt' | 'badge'

export const salon = {
  brand: 'Smarttnails',
  owner: 'Ardak Aldanazarova',
  // Как студия подписывается на сайте: «Smarttnails by Ardak Aldanazarova»
  signature: 'by Ardak Aldanazarova',
  // TODO: поставить вариант, который выберет сестра
  logo: 'mix' as LogoVariant,
  master: 'Ардак',
  // Контакты из карточки 2GIS
  phone: '+77769946660',
  whatsapp: '77769946660',
  instagram: 'https://instagram.com/smarttnails_ardak',
  instagramHandle: '@smarttnails_ardak',
  tiktok: 'https://www.tiktok.com/@smarttnails',
  twoGis: 'https://2gis.kz/astana/firm/70000001083753872',
  rating: 5,
  ratingCount: 7,
  // Рабочие часы в минутах от полуночи: 09:00–22:00, ежедневно
  workStart: 9 * 60,
  workEnd: 22 * 60,
  slotStep: 30,
  developer: {
    name: 'Onege Alibek',
    url: 'https://portfolio-vue-j15o.vercel.app/',
  },
}

export type Lang = 'ru' | 'kk' | 'en'
type Localized = Record<Lang, string>

export interface Location {
  id: string
  // С какой даты сестра принимает по этому адресу (YYYY-MM-DD)
  from: string
  street: Localized
  details: Localized
  district: Localized
  lat: number
  lon: number
}

// Сестра часто переезжает: новый адрес добавляется сюда с датой «from».
// Клиентка видит адрес именно на тот день, на который записывается.
export const locations: Location[] = [
  {
    id: 'mailin-19',
    from: '2024-01-01',
    street: {
      ru: 'ул. Бейимбет Майлина, 19',
      kk: 'Бейімбет Майлин көшесі, 19',
      en: '19 Beimbet Mailin St',
    },
    details: {
      ru: 'кабинет 533, 5 этаж',
      kk: '533 кабинет, 5 қабат',
      en: 'Office 533, 5th floor',
    },
    district: {
      ru: 'Алматинский район, Астана',
      kk: 'Алматы ауданы, Астана',
      en: 'Almaty district, Astana',
    },
    lat: 51.14574,
    lon: 71.476058,
  },
  // Пример переезда:
  // { id: 'new-place', from: '2026-11-15', street: { ru: '…', kk: '…', en: '…' }, details: {…}, district: {…}, lat: 51.12, lon: 71.43 },
]

export interface Service {
  id: string
  duration: number
  price: number
  popular?: boolean
}

// Прайс и время от Ардак (24.10)
export const services: Service[] = [
  { id: 'manicure', duration: 90, price: 8000, popular: true },
  { id: 'extension', duration: 120, price: 12000 },
  { id: 'smartPedicure', duration: 90, price: 10000 },
  { id: 'removal', duration: 20, price: 1000 },
]

export type GalleryTag = 'nude' | 'french' | 'design' | 'bright' | 'pedicure'

export interface GalleryItem {
  file: string
  tag: GalleryTag
  // Размер маленькой версии: нужен, чтобы плитка заранее знала свои пропорции
  w: number
  h: number
}

// Работы сестры: public/works/<file>-640.webp и <file>-1400.webp.
// Сначала снимки с телефона (23.10, они чётче), потом скриншоты из Instagram
export const gallery: GalleryItem[] = [
  { file: '25-bright', tag: 'bright', w: 640, h: 480 },
  { file: '26-nude', tag: 'nude', w: 480, h: 640 },
  { file: '27-bright', tag: 'bright', w: 640, h: 481 },
  { file: '28-french', tag: 'french', w: 480, h: 640 },
  { file: '29-design', tag: 'design', w: 480, h: 640 },
  { file: '30-design', tag: 'design', w: 480, h: 640 },
  { file: '31-nude', tag: 'nude', w: 480, h: 640 },
  { file: '32-bright', tag: 'bright', w: 480, h: 640 },
  { file: '33-nude', tag: 'nude', w: 480, h: 640 },
  { file: '34-design', tag: 'design', w: 640, h: 480 },
  { file: '35-nude', tag: 'nude', w: 480, h: 640 },
  { file: '36-nude', tag: 'nude', w: 640, h: 640 },
  { file: '37-french', tag: 'french', w: 480, h: 640 },
  { file: '38-design', tag: 'design', w: 480, h: 640 },
  { file: '39-design', tag: 'design', w: 485, h: 640 },
  { file: '40-nude', tag: 'nude', w: 389, h: 640 },
  { file: '01-nude', tag: 'nude', w: 617, h: 640 },
  { file: '02-design', tag: 'design', w: 640, h: 626 },
  { file: '03-french', tag: 'french', w: 640, h: 618 },
  { file: '04-bright', tag: 'bright', w: 482, h: 640 },
  { file: '05-design', tag: 'design', w: 520, h: 640 },
  { file: '06-pedicure', tag: 'pedicure', w: 640, h: 617 },
  { file: '07-nude', tag: 'nude', w: 640, h: 638 },
  { file: '08-design', tag: 'design', w: 540, h: 640 },
  { file: '09-french', tag: 'french', w: 580, h: 640 },
  { file: '10-bright', tag: 'bright', w: 640, h: 618 },
  { file: '11-design', tag: 'design', w: 561, h: 640 },
  { file: '12-nude', tag: 'nude', w: 533, h: 640 },
  { file: '13-design', tag: 'design', w: 640, h: 626 },
  { file: '14-french', tag: 'french', w: 640, h: 363 },
  { file: '15-bright', tag: 'bright', w: 539, h: 640 },
  { file: '16-design', tag: 'design', w: 640, h: 626 },
  { file: '17-pedicure', tag: 'pedicure', w: 640, h: 560 },
  { file: '18-french', tag: 'french', w: 500, h: 640 },
  { file: '19-bright', tag: 'bright', w: 640, h: 453 },
  { file: '20-design', tag: 'design', w: 640, h: 626 },
  { file: '21-nude', tag: 'nude', w: 449, h: 640 },
  { file: '22-design', tag: 'design', w: 469, h: 640 },
  { file: '23-bright', tag: 'bright', w: 482, h: 640 },
  { file: '24-design', tag: 'design', w: 640, h: 447 },
]

export const workSrc = (file: string, size: 640 | 1400 = 640) => `/works/${file}-${size}.webp`

export const faqKeys = ['wear', 'late', 'kids', 'techniques'] as const
// Пункты «За что меня любят» — по тексту Ардак (23.10)
export const whyKeys = ['experience', 'sterile', 'speed', 'premium'] as const
