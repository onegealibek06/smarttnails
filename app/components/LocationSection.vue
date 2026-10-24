<script setup lang="ts">
import { salon } from '~/data/salon'

const { t } = useI18n()
const { lang } = useLang()

const today = toISODate(new Date())
const loc = computed(() => locationFor(today))
const move = computed(() => upcomingMove(today))

const mapSrc = computed(() => {
  const { lat, lon } = loc.value
  const bbox = [lon - 0.006, lat - 0.0028, lon + 0.006, lat + 0.0028].join(',')
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`
})
</script>

<template>
  <section id="location" data-bg="#FFF7F5" class="section">
    <div class="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-10">
      <div class="flex flex-col">
        <SectionHeading v-reveal :eyebrow="t('location.eyebrow')" title-key="location.title" accent-key="location.accent" />

        <div v-if="move" v-reveal class="mt-6 rounded-2xl bg-rose px-5 py-4 text-sm font-medium text-ink">
          {{ t('location.moving', { date: formatDay(move.from, lang, { day: 'numeric', month: 'long' }), address: move.street[lang] }) }}
        </div>

        <div v-reveal class="card mt-8 p-6 sm:p-8">
          <p class="text-2xl font-semibold tracking-tight sm:text-3xl">{{ loc.street[lang] }}</p>
          <p class="mt-1 text-ink-soft">{{ loc.details[lang] }} · {{ loc.district[lang] }}</p>

          <ul class="mt-6 space-y-3 text-sm">
            <li class="flex items-center gap-3">
              <span class="flex h-9 w-9 items-center justify-center rounded-full bg-blush text-plum" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" stroke-linecap="round" /></svg>
              </span>
              {{ t('location.hours') }}
            </li>
            <li class="flex items-center gap-3">
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blush text-plum" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="3" width="14" height="14" rx="3" /><path d="M5 11h14M8 21l1.5-4M16 21l-1.5-4" stroke-linecap="round" /></svg>
              </span>
              {{ t('location.transport') }}
            </li>
          </ul>

          <div class="mt-7 flex flex-col gap-3 sm:flex-row">
            <a :href="salon.twoGis" target="_blank" rel="noopener" class="btn btn-primary">{{ t('location.open2gis') }}</a>
            <a :href="whatsappLink(salon.whatsapp, t('booking.messageSite'))" target="_blank" rel="noopener" class="btn btn-ghost">{{ t('cta.whatsapp') }}</a>
          </div>
        </div>

        <p v-reveal class="mt-5 flex gap-3 text-sm leading-relaxed text-ink-soft">
          <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lilac text-[11px] font-bold text-plum" aria-hidden="true">i</span>
          {{ t('location.note') }}
        </p>
      </div>

      <!-- Без анимации появления и без CSS-фильтра на самой карте: в Safari они могут сделать её пустой.
           Под картой — запасной фон с меткой, сверху — розовый оттенок отдельным слоем -->
      <div class="map relative min-h-[300px] sm:min-h-[360px] overflow-hidden rounded-[36px] bg-blush lg:min-h-full">
        <span class="absolute inset-0 flex flex-col items-center justify-center gap-3 text-plum" aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
          <span class="text-sm font-semibold">{{ loc.street[lang] }}</span>
        </span>
        <iframe
          :src="mapSrc"
          :title="t('location.map')"
          class="absolute inset-0 h-full w-full border-0"
        />
        <span class="pointer-events-none absolute inset-0 bg-rose/15 mix-blend-multiply" aria-hidden="true" />
        <!-- На телефоне карта не перехватывает прокрутку: касание открывает 2GIS -->
        <a
          :href="salon.twoGis"
          target="_blank"
          rel="noopener"
          class="absolute inset-0 sm:hidden"
          :aria-label="t('location.open2gis')"
        />
      </div>
    </div>
  </section>
</template>
