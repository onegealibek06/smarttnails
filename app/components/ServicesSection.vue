<script setup lang="ts">
import { salon, services } from '~/data/salon'

const { t } = useI18n()
const { lang, duration } = useLang()
const { selected, chosenServices, toggleService, totalPrice, totalDuration } = useBooking()

// Выбранные услуги сразу уходят в WhatsApp готовым сообщением
const whatsappHref = computed(() => whatsappLink(salon.whatsapp, t('booking.messageServices', {
  services: chosenServices.value.map(s => t(`services.items.${s.id}.name`).toLowerCase()).join(', '),
})))
</script>

<template>
  <section id="services" data-bg="#FFFAF8" class="py-20 sm:py-28">
    <div class="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-10">
      <div class="lg:sticky lg:top-28 lg:self-start">
        <SectionHeading v-reveal :eyebrow="t('services.eyebrow')" title-key="services.title" accent-key="services.accent" />
        <p v-reveal class="mt-5 max-w-sm leading-relaxed text-ink-soft">{{ t('services.subtitle') }}</p>

        <Transition name="pop">
          <div v-if="selected.length" class="mt-8 rounded-[28px] bg-ink p-6 text-milk">
            <div class="flex items-end justify-between gap-4">
              <div>
                <p class="text-sm text-milk/60">{{ t('booking.total') }}</p>
                <p class="mt-1 text-3xl font-semibold tracking-tight">{{ t('services.price', { price: formatPrice(totalPrice, lang) }) }}</p>
              </div>
              <p class="text-sm text-milk/70">{{ duration(totalDuration) }}</p>
            </div>
            <a :href="whatsappHref" target="_blank" rel="noopener" class="btn btn-rose mt-5 w-full">{{ t('booking.cta') }}</a>
          </div>
        </Transition>
      </div>

      <ul class="flex flex-col gap-3">
        <li
          v-for="(service, i) in services"
          :key="service.id"
          v-reveal="i * 0.04"
          class="card flex flex-col gap-4 p-5 transition sm:flex-row sm:items-center sm:gap-6 sm:p-6"
          :class="{ '!border-rose-deep/40 bg-blush/40': selected.includes(service.id) }"
        >
          <div class="flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="text-lg font-semibold tracking-tight">{{ t(`services.items.${service.id}.name`) }}</h3>
              <span v-if="service.popular" class="rounded-full bg-rose px-2.5 py-0.5 text-xs font-semibold text-ink">{{ t('services.popular') }}</span>
            </div>
            <p class="mt-1.5 text-sm leading-relaxed text-ink-soft">{{ t(`services.items.${service.id}.desc`) }}</p>
          </div>

          <div class="flex items-center justify-between gap-4 sm:justify-end">
            <div class="text-left sm:text-right">
              <p class="text-lg font-semibold whitespace-nowrap">{{ t('services.price', { price: formatPrice(service.price, lang) }) }}</p>
              <p class="text-xs text-ink-soft">{{ duration(service.duration) }}</p>
            </div>
            <button
              type="button"
              class="chip min-w-[7.5rem] justify-center"
              :aria-pressed="selected.includes(service.id)"
              @click="toggleService(service.id)"
            >
              <svg v-if="selected.includes(service.id)" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m3 8.5 3 3 7-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
              {{ selected.includes(service.id) ? t('services.chosen') : t('services.choose') }}
            </button>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.pop-enter-active,
.pop-leave-active {
  transition: opacity 0.35s var(--ease-soft), transform 0.35s var(--ease-soft);
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}
</style>
