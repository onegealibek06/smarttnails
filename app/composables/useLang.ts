import type { Lang } from '~/data/salon'

export function useLang() {
  const { locale, t } = useI18n()
  const lang = computed(() => locale.value as Lang)

  function duration(min: number) {
    const h = Math.floor(min / 60)
    const m = min % 60
    if (!h) return t('duration.minutes', { m })
    if (!m) return t('duration.hours', { h })
    return t('duration.hoursMinutes', { h, m })
  }

  return { lang, duration }
}
