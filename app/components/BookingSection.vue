<script setup lang="ts">
import { salon, services } from '~/data/salon'
import type { Booking } from '~/composables/useBooking'

const { t } = useI18n()
const { lang, duration } = useLang()
const { push } = useToasts()
const {
  selected, chosenServices, totalDuration, totalPrice,
  toggleService, freeSlots, book, cancel, upcoming, load,
} = useBooking()

type Step = 1 | 2 | 3 | 4
const step = ref<Step>(1)
const stepNames = ['services', 'time', 'contacts'] as const

const days = ref<string[]>([])
const date = ref('')
const time = ref<number | null>(null)

const form = reactive({ name: '', phone: '', comment: '', remind: true })
const errors = reactive({ services: false, time: false, name: false, phone: false })
const lastBooking = ref<Booking | null>(null)
const card = ref<HTMLElement>()

const slots = computed(() => date.value ? freeSlots(date.value, totalDuration.value) : [])
const dayFree = (d: string) => freeSlots(d, totalDuration.value || 60).length
const dayLocation = computed(() => locationFor(date.value || toISODate(new Date())))
const servicesText = computed(() => chosenServices.value.map(s => t(`services.items.${s.id}.name`)).join(', '))

function scrollToCard() {
  if (!card.value) return
  // window.scrollTo, а не scrollIntoView: тот прокручивает и блоки с overflow-hidden внутри
  const top = card.value.getBoundingClientRect().top + window.scrollY - 88
  window.scrollTo({ top, behavior: 'smooth' })
}

function goTo(next: Step) {
  step.value = next
  nextTick(scrollToCard)
}

function toTime() {
  errors.services = !selected.value.length
  if (errors.services) return
  if (!date.value || !dayFree(date.value)) date.value = days.value.find(d => dayFree(d)) ?? days.value[0]!
  time.value = null
  goTo(2)
}

function toContacts() {
  errors.time = time.value === null
  if (!errors.time) goTo(3)
}

watch(date, () => {
  time.value = null
})

const phoneDigits = computed(() => form.phone.replace(/\D/g, ''))

// Ошибка пропадает, как только начали исправлять поле
watch(() => form.name, () => { errors.name = false })
watch(() => form.phone, () => { errors.phone = false })

function submit() {
  errors.name = form.name.trim().length < 2
  errors.phone = phoneDigits.value.length !== 11
  if (errors.name || errors.phone || time.value === null) return

  const booking = book({
    date: date.value,
    start: time.value,
    duration: totalDuration.value,
    services: [...selected.value],
    name: form.name.trim(),
    phone: form.phone,
    comment: form.comment.trim(),
    remind: form.remind,
  })
  lastBooking.value = booking

  const when = { date: formatDay(booking.date, lang.value, { day: 'numeric', month: 'long' }), time: formatTime(booking.start) }
  push(t('booking.toastBooked', when))
  // Демо: в следующей версии здесь будет настоящий Telegram-бот мастера
  setTimeout(() => push(t('booking.toastMaster'), 'info'), 1400)
  goTo(4)
}

function restart() {
  selected.value = []
  time.value = null
  form.comment = ''
  lastBooking.value = null
  goTo(1)
}

function cancelBooking(id: string) {
  cancel(id)
  push(t('booking.toastCancelled'), 'info')
}

function addressLine(d: string) {
  const loc = locationFor(d)
  return `${loc.street[lang.value]}, ${loc.details[lang.value]}`
}

function downloadIcs(b: Booking) {
  const ics = bookingToIcs(b, t('booking.calendarTitle'), `${addressLine(b.date)}, ${locationFor(b.date).district[lang.value]}`)
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = 'smarttnails.ics'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function bookingWhatsapp(b: Booking) {
  const names = b.services.map(id => t(`services.items.${id}.name`)).join(', ')
  return whatsappLink(salon.whatsapp, t('booking.whatsappText', {
    date: formatDay(b.date, lang.value, { day: 'numeric', month: 'long' }),
    time: formatTime(b.start),
    services: names,
  }))
}

onMounted(() => {
  load()
  const now = new Date()
  days.value = Array.from({ length: 14 }, (_, i) => toISODate(addDays(now, i)))
})
</script>

<template>
  <section id="booking" data-bg="#F2EBF8" class="px-2 py-8 sm:px-4 sm:py-12">
    <div class="relative mx-auto max-w-7xl overflow-clip rounded-[36px] bg-ink px-4 py-14 text-milk sm:rounded-[48px] sm:px-10 sm:py-20 lg:px-16">
      <div class="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-plum/60 blur-3xl" aria-hidden="true" />
      <div class="pointer-events-none absolute -bottom-40 left-10 h-96 w-96 rounded-full bg-rose-deep/25 blur-3xl" aria-hidden="true" />

      <div class="relative grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <div>
          <SectionHeading v-reveal light :eyebrow="t('booking.eyebrow')" title-key="booking.title" accent-key="booking.accent" />
          <p v-reveal class="mt-5 max-w-sm leading-relaxed text-milk/70">{{ t('booking.subtitle') }}</p>

          <ol class="mt-10 hidden flex-col gap-4 lg:flex">
            <li v-for="(name, i) in stepNames" :key="name" class="flex items-center gap-4">
              <span
                class="flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition"
                :class="step > i + 1 ? 'border-rose bg-rose text-ink' : step === i + 1 ? 'border-milk bg-milk text-ink' : 'border-milk/20 text-milk/50'"
              >
                <template v-if="step > i + 1">✓</template>
                <template v-else>{{ i + 1 }}</template>
              </span>
              <span :class="step === i + 1 ? 'text-milk' : 'text-milk/50'">{{ t(`booking.steps.${name}`) }}</span>
            </li>
          </ol>
        </div>

        <div ref="card">
          <ClientOnly>
            <div class="rounded-[28px] bg-milk p-5 text-ink sm:p-8">
              <!-- Мобильный индикатор шагов -->
              <div v-if="step < 4" class="mb-6 flex gap-1.5 lg:hidden" aria-hidden="true">
                <span v-for="i in 3" :key="i" class="h-1 flex-1 rounded-full transition" :class="step >= i ? 'bg-rose-deep' : 'bg-blush-deep'" />
              </div>

              <!-- Шаг 1: услуги -->
              <div v-if="step === 1">
                <h3 class="text-xl font-semibold tracking-tight">{{ t('booking.steps.services') }}</h3>
                <ul class="mt-5 grid gap-2 sm:grid-cols-2">
                  <li v-for="service in services" :key="service.id">
                    <button
                      type="button"
                      class="flex min-h-[64px] w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition"
                      :class="selected.includes(service.id) ? 'border-ink bg-ink text-milk' : 'border-ink/10 bg-white hover:border-ink/30'"
                      :aria-pressed="selected.includes(service.id)"
                      @click="toggleService(service.id); errors.services = false"
                    >
                      <span class="text-sm font-medium leading-snug">{{ t(`services.items.${service.id}.name`) }}</span>
                      <span class="shrink-0 text-right text-xs opacity-70">
                        {{ t('services.price', { price: formatPrice(service.price, lang) }) }}<br>{{ duration(service.duration) }}
                      </span>
                    </button>
                  </li>
                </ul>
                <p v-if="errors.services" class="mt-3 text-sm font-medium text-rose-deep" role="alert">{{ t('booking.pickService') }}</p>

                <div class="mt-6 flex flex-col gap-4 border-t border-ink/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p class="text-sm text-ink-soft">
                    <template v-if="selected.length">
                      {{ t('booking.total') }}: <b class="text-ink">{{ t('services.price', { price: formatPrice(totalPrice, lang) }) }}</b> · {{ duration(totalDuration) }}
                    </template>
                    <template v-else>{{ t('booking.pickService') }}</template>
                  </p>
                  <button type="button" class="btn btn-primary" @click="toTime">{{ t('booking.next') }} →</button>
                </div>
              </div>

              <!-- Шаг 2: дата и время -->
              <div v-else-if="step === 2">
                <h3 class="text-xl font-semibold tracking-tight">{{ t('booking.pickDate') }}</h3>
                <div class="no-scrollbar -mx-5 mt-4 flex snap-x gap-2 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8">
                  <button
                    v-for="d in days"
                    :key="d"
                    type="button"
                    class="flex h-[76px] w-[64px] shrink-0 snap-start flex-col items-center justify-center rounded-2xl border transition"
                    :class="[
                      date === d ? 'border-ink bg-ink text-milk' : 'border-ink/10 bg-white hover:border-ink/30',
                      !dayFree(d) && date !== d ? 'opacity-40' : '',
                    ]"
                    :aria-pressed="date === d"
                    :aria-label="formatDay(d, lang)"
                    @click="date = d"
                  >
                    <span class="text-[11px] uppercase tracking-wide opacity-70">{{ formatDay(d, lang, { weekday: 'short' }) }}</span>
                    <span class="text-xl font-semibold leading-tight">{{ formatDay(d, lang, { day: 'numeric' }) }}</span>
                    <span class="text-[10px] opacity-60">{{ formatDay(d, lang, { month: 'short' }) }}</span>
                  </button>
                </div>

                <h3 class="mt-7 text-xl font-semibold tracking-tight">{{ t('booking.pickTime') }}</h3>
                <p class="mt-1 text-sm text-ink-soft first-letter:uppercase">{{ formatDay(date, lang) }} · {{ duration(totalDuration) }}</p>
                <div v-if="slots.length" class="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6">
                  <button
                    v-for="s in slots"
                    :key="s"
                    type="button"
                    class="h-11 rounded-xl border text-sm font-semibold tabular-nums transition"
                    :class="time === s ? 'border-rose-deep bg-rose-deep text-white' : 'border-ink/10 bg-white hover:border-ink/30'"
                    :aria-pressed="time === s"
                    @click="time = s; errors.time = false"
                  >
                    {{ formatTime(s) }}
                  </button>
                </div>
                <p v-else class="mt-4 rounded-2xl bg-blush px-4 py-3 text-sm">{{ t('booking.noSlots') }}</p>
                <p v-if="errors.time" class="mt-3 text-sm font-medium text-rose-deep" role="alert">{{ t('booking.pickTimeError') }}</p>

                <div class="mt-6 flex items-start gap-3 rounded-2xl bg-white p-4">
                  <span class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blush text-plum">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
                  </span>
                  <div>
                    <p class="text-xs font-medium text-ink-soft">{{ t('booking.addressForDay') }}</p>
                    <p class="mt-0.5 font-semibold">{{ dayLocation.street[lang] }}</p>
                    <p class="text-sm text-ink-soft">{{ dayLocation.details[lang] }} · {{ dayLocation.district[lang] }}</p>
                  </div>
                </div>

                <div class="mt-6 flex justify-between gap-3 border-t border-ink/8 pt-5">
                  <button type="button" class="btn btn-ghost" @click="goTo(1)">← {{ t('booking.back') }}</button>
                  <button type="button" class="btn btn-primary" @click="toContacts">{{ t('booking.next') }} →</button>
                </div>
              </div>

              <!-- Шаг 3: контакты -->
              <form v-else-if="step === 3" novalidate @submit.prevent="submit">
                <div class="rounded-2xl bg-white p-4 text-sm">
                  <p class="font-semibold first-letter:uppercase">{{ formatDay(date, lang) }}, {{ formatTime(time ?? 0) }}</p>
                  <p class="mt-1 text-ink-soft">{{ t('booking.summary', { services: servicesText, duration: duration(totalDuration) }) }}</p>
                  <p class="mt-1 text-ink-soft">{{ addressLine(date) }}</p>
                  <p class="mt-2 font-semibold">{{ t('services.price', { price: formatPrice(totalPrice, lang) }) }}</p>
                </div>

                <div class="mt-5 grid gap-3 sm:grid-cols-2">
                  <FloatField
                    v-model="form.name"
                    :label="t('booking.name')"
                    :placeholder="t('booking.namePlaceholder')"
                    autocomplete="given-name"
                    :error="errors.name ? t('booking.errors.name') : undefined"
                  />
                  <FloatField
                    v-model="form.phone"
                    type="tel"
                    inputmode="tel"
                    autocomplete="tel"
                    :label="t('booking.phone')"
                    :placeholder="t('booking.phonePlaceholder')"
                    :format="formatKzPhone"
                    :error="errors.phone ? t('booking.errors.phone') : undefined"
                  />
                </div>
                <FloatField
                  v-model="form.comment"
                  class="mt-3"
                  textarea
                  :rows="2"
                  :label="t('booking.comment')"
                  :placeholder="t('booking.commentPlaceholder')"
                />
                <label class="mt-5 flex cursor-pointer items-center gap-3 text-sm">
                  <input v-model="form.remind" type="checkbox" role="switch" class="peer sr-only">
                  <span class="switch" aria-hidden="true" />
                  {{ t('booking.remind') }}
                </label>

                <div class="mt-6 flex justify-between gap-3 border-t border-ink/8 pt-5">
                  <button type="button" class="btn btn-ghost" @click="goTo(2)">← {{ t('booking.back') }}</button>
                  <button type="submit" class="btn btn-primary">{{ t('booking.submit') }}</button>
                </div>
              </form>

              <!-- Шаг 4: готово -->
              <div v-else-if="lastBooking" class="py-4 text-center">
                <span class="success-check mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose text-ink">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                </span>
                <h3 class="mt-5 text-3xl font-semibold tracking-tight">{{ t('booking.success.title') }}</h3>
                <p class="mt-2 text-ink-soft">
                  {{ t('booking.success.text', { date: formatDay(lastBooking.date, lang, { day: 'numeric', month: 'long' }), time: formatTime(lastBooking.start) }) }}
                </p>
                <p class="mt-1 text-sm text-ink-soft">{{ addressLine(lastBooking.date) }}</p>
                <div class="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
                  <button type="button" class="btn btn-primary" @click="downloadIcs(lastBooking)">{{ t('booking.success.addCalendar') }}</button>
                  <a :href="bookingWhatsapp(lastBooking)" target="_blank" rel="noopener" class="btn btn-ghost">{{ t('booking.success.writeMaster') }}</a>
                </div>
                <button type="button" class="mt-4 text-sm font-semibold text-rose-deep underline-offset-4 hover:underline" @click="restart">{{ t('booking.success.again') }}</button>
              </div>
            </div>

            <!-- Мои записи -->
            <div v-if="upcoming.length" class="mt-4 rounded-[28px] border border-milk/15 p-5 sm:p-6">
              <h3 class="text-sm font-semibold uppercase tracking-[0.16em] text-rose">{{ t('booking.my') }}</h3>
              <ul class="mt-3 divide-y divide-milk/10">
                <li v-for="b in upcoming" :key="b.id" class="flex items-center justify-between gap-4 py-3">
                  <div class="min-w-0">
                    <p class="font-semibold first-letter:uppercase">{{ formatDay(b.date, lang, { weekday: 'short', day: 'numeric', month: 'long' }) }}, {{ formatTime(b.start) }}</p>
                    <p class="truncate text-sm text-milk/60">{{ b.services.map(id => t(`services.items.${id}.name`)).join(', ') }}</p>
                  </div>
                  <button type="button" class="shrink-0 rounded-full border border-milk/20 px-4 py-2 text-sm transition hover:bg-milk/10" @click="cancelBooking(b.id)">
                    {{ t('booking.cancel') }}
                  </button>
                </li>
              </ul>
            </div>

            <template #fallback>
              <div class="h-[420px] animate-pulse rounded-[28px] bg-milk/10" />
            </template>
          </ClientOnly>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Переключатель «Напомнить в Telegram» вместо старомодной галочки */
.switch {
  position: relative;
  flex: none;
  width: 46px;
  height: 28px;
  border-radius: 999px;
  background: rgb(42 20 36 / 0.12);
  transition: background-color 0.3s;
}

.switch::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: white;
  box-shadow: 0 2px 6px rgb(42 20 36 / 0.2);
  transition: transform 0.35s var(--ease-soft);
}

.peer:checked + .switch {
  background: var(--color-rose-deep);
}

.peer:checked + .switch::after {
  transform: translateX(18px);
}

.peer:focus-visible + .switch {
  outline: 2px solid var(--color-plum);
  outline-offset: 3px;
}

.no-scrollbar {
  scrollbar-width: none;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.success-check {
  animation: pop 0.6s var(--ease-soft) both;
}

@keyframes pop {
  from {
    transform: scale(0.4);
    opacity: 0;
  }
}
</style>
