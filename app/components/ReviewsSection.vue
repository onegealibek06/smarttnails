<script setup lang="ts">
import { salon } from '~/data/salon'
import { reviewInitials, reviews } from '~/data/reviews'

const { t } = useI18n()
const { lang } = useLang()

const root = ref<HTMLElement>()
const track = ref<HTMLElement>()

// armed — карточки спрятаны и ждут появления; visible — секция на экране, запускаем анимации.
// Без JavaScript ни один класс не ставится, и всё просто видно.
const armed = ref(false)
const visible = ref(false)
const inView = ref(false)
const paused = ref(false)
const active = ref(0)
const atEnd = ref(false)

const count = String(reviews.length).padStart(2, '0')
const avatars = reviews.slice(0, 4)

// Рейтинг «набегает» от 0,0 до 5,0
const ratingValue = ref(salon.rating)
const ratingShown = computed(() => ratingValue.value.toFixed(1).replace('.', lang.value === 'en' ? '.' : ','))

function countUp() {
  const start = performance.now()
  const duration = 1200
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / duration)
    ratingValue.value = salon.rating * (1 - (1 - p) ** 3)
    if (p < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

function cards() {
  return [...(track.value?.querySelectorAll<HTMLElement>('[data-card]') ?? [])]
}

function go(i: number) {
  const list = cards()
  if (!track.value || !list[i]) return
  track.value.scrollTo({ left: list[i].offsetLeft - list[0]!.offsetLeft, behavior: 'smooth' })
}

function onScroll() {
  const el = track.value
  if (!el) return
  atEnd.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
  const list = cards()
  if (atEnd.value) {
    active.value = list.length - 1
    return
  }
  let best = 0
  list.forEach((card, i) => {
    const d = Math.abs(card.offsetLeft - list[0]!.offsetLeft - el.scrollLeft)
    const bestD = Math.abs(list[best]!.offsetLeft - list[0]!.offsetLeft - el.scrollLeft)
    if (d < bestD) best = i
  })
  active.value = best
}

function step(dir: 1 | -1) {
  const n = reviews.length
  go(dir === 1 && atEnd.value ? 0 : (active.value + dir + n) % n)
}

let timer: ReturnType<typeof setInterval> | undefined
let observer: IntersectionObserver | undefined

onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduced) {
    armed.value = true
    ratingValue.value = 0
  }

  observer = new IntersectionObserver(([entry]) => {
    inView.value = entry!.isIntersecting
    if (entry!.isIntersecting && !visible.value) {
      visible.value = true
      if (!reduced) countUp()
    }
  }, { threshold: 0.25 })
  if (root.value) observer.observe(root.value)

  // Автопрокрутка: каждые 5 секунд следующий отзыв, пока на него не смотрят
  if (!reduced) {
    timer = setInterval(() => {
      if (!paused.value && inView.value && !document.hidden) step(1)
    }, 5000)
  }
})

onBeforeUnmount(() => {
  clearInterval(timer)
  observer?.disconnect()
})
</script>

<template>
  <section id="reviews" ref="root" data-bg="#F8ECF4" class="reviews section overflow-x-clip" :class="{ armed, visible }">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
      <div class="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,0.33fr)_minmax(0,0.67fr)] lg:gap-10">
        <div>
          <p class="eyebrow">
            <span class="h-px w-6 bg-current" aria-hidden="true" />
            {{ t('reviews.eyebrow') }}
          </p>
          <p class="mt-2 text-sm tabular-nums text-ink/35">(01–{{ count }})</p>
        </div>
        <i18n-t keypath="reviews.title" tag="h2" class="section-title" scope="global">
          <template #accent>
            <span class="accent text-[1.1em]">{{ t('reviews.accent') }}</span>
          </template>
        </i18n-t>
      </div>

      <div class="mt-10 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <!-- Карточка рейтинга -->
        <div class="rating-card relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-[28px] p-6 sm:p-7">
          <div>
            <p class="flex items-baseline gap-2">
              <span class="text-7xl font-semibold tabular-nums tracking-[-0.05em]">{{ ratingShown }}</span>
              <span class="text-2xl text-ink/35">{{ t('reviews.of5') }}</span>
            </p>
            <div class="mt-3 flex gap-1 text-rose-deep" role="img" :aria-label="t('reviews.stars', { n: salon.rating })">
              <svg v-for="i in 5" :key="i" class="star" :style="{ '--d': `${300 + i * 90}ms` }" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="m10 1.8 2.5 5.3 5.8.7-4.3 4 1.1 5.7L10 14.7l-5.1 2.8L6 11.8l-4.3-4 5.8-.7z" /></svg>
            </div>
            <p class="mt-2 text-sm text-ink-soft">{{ t('reviews.rating', { count: salon.ratingCount }) }}</p>
          </div>

          <div class="mt-8">
            <div class="flex items-center gap-3">
              <div class="flex -space-x-2.5" aria-hidden="true">
                <span
                  v-for="(r, i) in avatars"
                  :key="r.id"
                  class="flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-semibold ring-2 ring-white"
                  :style="{ background: ['#F3CFDC', '#ECE3F7', '#E9D2B0', '#2A1424'][i], color: i === 3 ? '#FFF7F5' : '#7B2D63' }"
                >{{ reviewInitials(r.author) }}</span>
                <span class="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-milk ring-2 ring-white">+{{ reviews.length - avatars.length }}</span>
              </div>
              <p class="text-xs font-medium leading-tight text-ink-soft">{{ t('reviews.trusted') }}</p>
            </div>
            <a
              :href="`${salon.twoGis}/tab/reviews`"
              target="_blank"
              rel="noopener"
              class="group mt-5 flex items-center gap-4 rounded-full bg-ink p-1.5 pr-6 text-milk transition hover:bg-plum"
            >
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-milk text-ink transition duration-300 group-hover:translate-x-1" aria-hidden="true">→</span>
              <span class="text-sm font-semibold">{{ t('reviews.all') }}</span>
            </a>
          </div>
        </div>

        <!-- Лента отзывов -->
        <div
          ref="track"
          class="track no-scrollbar flex snap-x snap-mandatory items-start gap-4 overflow-x-auto"
          :class="{ 'track--end': atEnd }"
          @scroll.passive="onScroll"
          @pointerenter="paused = true"
          @pointerleave="paused = false"
          @focusin="paused = true"
          @focusout="paused = false"
          @touchstart.passive="paused = true"
        >
          <div
            v-for="(r, i) in reviews"
            :key="r.id"
            data-card
            class="w-[86%] shrink-0 snap-start sm:w-[360px]"
            :style="{ '--i': i }"
          >
            <ReviewCard :review="r" :index="i" />
          </div>
        </div>
      </div>

      <div class="mt-8 flex items-center justify-center gap-4 lg:pl-[316px]">
        <button type="button" class="nav-btn" :aria-label="t('reviews.prev')" @click="step(-1)">←</button>
        <div class="flex items-center">
          <button
            v-for="(r, i) in reviews"
            :key="r.id"
            type="button"
            class="flex h-11 items-center px-1"
            :aria-label="t('reviews.goTo', { n: i + 1 })"
            :aria-current="active === i ? 'true' : undefined"
            @click="go(i)"
          >
            <span class="block h-1.5 rounded-full transition-all duration-500" :class="active === i ? 'w-10 bg-ink' : 'w-1.5 bg-ink/20'" />
          </button>
        </div>
        <button type="button" class="nav-btn" :aria-label="t('reviews.next')" @click="step(1)">→</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rating-card {
  background:
    radial-gradient(120% 90% at 0% 0%, var(--color-lilac) 0%, transparent 60%),
    radial-gradient(90% 80% at 100% 100%, var(--color-blush-deep) 0%, transparent 70%),
    var(--color-blush);
}

.track {
  scrollbar-width: none;
  scroll-padding-left: 0;
  -webkit-mask-image: linear-gradient(90deg, #000 78%, transparent);
  mask-image: linear-gradient(90deg, #000 78%, transparent);
  transition: -webkit-mask-image 0.4s, mask-image 0.4s;
}

.track::-webkit-scrollbar {
  display: none;
}

.track--end {
  -webkit-mask-image: none;
  mask-image: none;
}

.nav-btn {
  display: flex;
  height: 44px;
  width: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--color-ink) 12%, transparent);
  background: white;
  transition: background-color 0.2s, transform 0.2s;
}

.nav-btn:hover {
  background: var(--color-blush);
}

.nav-btn:active {
  transform: scale(0.94);
}

/* Появление: рейтинг выезжает слева, карточки — веером справа, звёзды «щёлкают» по одной */
.armed .rating-card {
  opacity: 0;
  transform: translateX(-32px);
}

.armed [data-card] {
  opacity: 0;
  transform: translateX(56px);
}

.armed :deep(.star) {
  transform: scale(0);
}

.visible .rating-card {
  animation: slide-in 0.9s var(--ease-soft) forwards;
}

.visible [data-card] {
  animation: slide-in 0.9s calc(0.15s + var(--i) * 90ms) var(--ease-soft) forwards;
}

.visible :deep(.star) {
  animation: star-pop 0.5s calc(0.4s + var(--d)) cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes slide-in {
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes star-pop {
  to {
    transform: scale(1);
  }
}
</style>
