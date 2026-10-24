<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { salon } from '~/data/salon'

const { t, tm, rt } = useI18n()
const { lang } = useLang()

const ticker = computed(() => (tm('about.ticker') as unknown[]).map(word => rt(word as Parameters<typeof rt>[0])))
const handle = salon.instagramHandle

// Плитки появляются по очереди, цифры «набегают». armed — всё спрятано и ждёт; shown — секция на экране.
// Без JavaScript классы не ставятся, и всё просто видно.
const root = ref<HTMLElement>()
const armed = ref(false)
const shown = ref(false)
const years = ref(8)
const rating = ref(salon.rating)
const ratingText = computed(() => rating.value.toFixed(1).replace('.', lang.value === 'en' ? '.' : ','))

let observer: IntersectionObserver | undefined
let ctx: gsap.Context | undefined

function countUp() {
  const start = performance.now()
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / 1400)
    const eased = 1 - (1 - p) ** 3
    years.value = Math.round(8 * eased)
    rating.value = salon.rating * eased
    if (p < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !root.value) return
  armed.value = true
  years.value = 0
  rating.value = 0

  observer = new IntersectionObserver(([entry]) => {
    if (!entry!.isIntersecting) return
    shown.value = true
    countUp()
    observer?.disconnect()
  }, { threshold: 0.2 })
  observer.observe(root.value)

  // Фото чуть медленнее прокрутки — лёгкая глубина
  gsap.registerPlugin(ScrollTrigger)
  ctx = gsap.context(() => {
    gsap.fromTo('[data-photo-img]', { yPercent: -6 }, {
      yPercent: 6,
      ease: 'none',
      scrollTrigger: { trigger: '[data-photo]', start: 'top bottom', end: 'bottom top', scrub: true },
    })
  }, root.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  ctx?.revert()
})
</script>

<template>
  <section id="about" ref="root" data-bg="#F7EFEA" class="about relative overflow-x-clip py-20 sm:py-28" :class="{ armed, shown }">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
      <div class="grid grid-cols-[minmax(0,1fr)] gap-3 sm:gap-4 lg:grid-cols-12">
        <!-- Заголовок и цитата -->
        <div class="tile lg:col-span-7 lg:pb-6" style="--d: 0">
          <p class="eyebrow">
            <span class="h-px w-6 bg-current" aria-hidden="true" />
            {{ t('about.eyebrow') }}
          </p>
          <i18n-t keypath="about.title" tag="h2" class="mt-4 text-[clamp(2.4rem,5.4vw,4.6rem)] font-semibold leading-[1.02] tracking-[-0.045em]" scope="global">
            <template #accent>
              <span class="accent text-[1.1em]">{{ t('about.accent') }}</span>
            </template>
          </i18n-t>
          <p class="mt-6 max-w-xl text-xl leading-snug tracking-tight text-ink-soft sm:text-2xl">
            <span class="mr-1 font-accent text-4xl leading-none text-rose-deep" aria-hidden="true">“</span>{{ t('about.quote') }}
          </p>
        </div>

        <!-- Фото: большая скруглённая плитка, сверху статус, снизу «стеклянная» подпись -->
        <figure data-photo class="tile relative overflow-hidden rounded-[32px] bg-blush lg:col-span-5 lg:row-span-3" style="--d: 1">
          <div class="relative aspect-[4/5] h-full w-full lg:aspect-auto lg:min-h-full">
            <img
              data-photo-img
              src="/about/ardak-1000.webp"
              srcset="/about/ardak-600.webp 480w, /about/ardak-1000.webp 760w"
              sizes="(min-width: 1024px) 40vw, 92vw"
              :alt="t('about.photoAlt')"
              width="760"
              height="950"
              loading="lazy"
              class="photo-img absolute inset-0 h-[112%] w-full object-cover"
            >
          </div>
          <span class="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/80 py-1.5 pl-2.5 pr-3.5 text-xs font-semibold backdrop-blur">
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-70" />
              <span class="relative inline-flex h-2 w-2 rounded-full bg-[#25D366]" />
            </span>
            {{ t('about.status') }}
          </span>
          <figcaption class="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-[24px] bg-white/70 px-5 py-4 backdrop-blur-xl">
            <span>
              <span class="block text-lg font-semibold tracking-tight">{{ salon.owner }}</span>
              <span class="block text-xs text-ink-soft">{{ t('about.role') }}</span>
            </span>
            <span class="flex items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-sm font-semibold text-milk">
              {{ ratingText }}
              <svg width="13" height="13" viewBox="0 0 20 20" class="text-rose" aria-hidden="true"><path fill="currentColor" d="m10 1.8 2.5 5.3 5.8.7-4.3 4 1.1 5.7L10 14.7l-5.1 2.8L6 11.8l-4.3-4 5.8-.7z" /></svg>
            </span>
          </figcaption>
        </figure>

        <!-- История -->
        <div class="tile rounded-[32px] bg-white/65 p-6 backdrop-blur sm:p-8 lg:col-span-7" style="--d: 2">
          <div class="space-y-4 leading-relaxed text-ink-soft sm:text-[1.05rem]">
            <p>{{ t('about.p1') }}</p>
            <p>{{ t('about.p2') }}</p>
            <p>{{ t('about.p3') }}</p>
          </div>
        </div>

        <!-- Цифры и Instagram -->
        <div class="grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-7 lg:grid-cols-[1fr_1fr_1.4fr]">
          <div class="tile rounded-[28px] bg-white/65 p-5 backdrop-blur sm:p-6" style="--d: 3">
            <p class="text-[2.6rem] font-semibold leading-none tracking-[-0.05em] text-plum sm:text-5xl">2017</p>
            <p class="mt-2 text-xs leading-snug text-ink-soft sm:text-sm">{{ t('about.since') }}</p>
          </div>
          <div class="tile rounded-[28px] bg-rose/45 p-5 backdrop-blur sm:p-6" style="--d: 4">
            <p class="text-[2.6rem] font-semibold leading-none tracking-[-0.05em] tabular-nums sm:text-5xl">{{ years }}</p>
            <p class="mt-2 text-xs leading-snug text-ink sm:text-sm">{{ t('about.years') }}</p>
          </div>
          <a
            :href="salon.instagram"
            target="_blank"
            rel="noopener"
            class="tile insta group col-span-2 flex items-end justify-between gap-4 rounded-[28px] bg-ink p-5 text-milk transition-colors duration-500 hover:bg-plum sm:p-6 lg:col-span-1"
            style="--d: 5"
          >
            <span>
              <span class="block text-xs text-milk/60">{{ t('about.insta') }}</span>
              <span class="mt-1 block text-lg font-semibold tracking-tight">{{ handle }}</span>
              <span class="mt-3 inline-block text-sm font-semibold text-rose">{{ t('about.cta') }}</span>
            </span>
            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose text-ink transition-transform duration-500 group-hover:-rotate-45" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m-4-4 4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </span>
          </a>
        </div>
      </div>
    </div>

    <!-- Бегущая строка из ключевых слов -->
    <div class="ticker mt-14 sm:mt-20" aria-hidden="true">
      <div class="ticker-track">
        <template v-for="copy in 2" :key="copy">
          <span v-for="(word, i) in ticker" :key="`${copy}-${i}`" class="ticker-item">
            <span :class="i % 2 ? 'ticker-outline' : 'accent'">{{ word }}</span>
            <span class="text-rose" aria-hidden="true">✦</span>
          </span>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Появление плиток по очереди: снизу, из лёгкого размытия */
.armed .tile {
  opacity: 0;
  transform: translateY(28px) scale(0.98);
  filter: blur(6px);
}

.shown .tile {
  animation: tile-in 0.9s calc(var(--d) * 110ms) var(--ease-soft) forwards;
}

@keyframes tile-in {
  to {
    opacity: 1;
    transform: none;
    filter: blur(0);
  }
}

.photo-img {
  top: -6%;
}

.insta {
  min-height: 150px;
}

.ticker {
  overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
}

.ticker-track {
  display: flex;
  width: max-content;
  animation: ticker 38s linear infinite;
}

.ticker-item {
  display: inline-flex;
  align-items: center;
  gap: 1.6rem;
  padding-right: 1.6rem;
  font-size: clamp(2.4rem, 7vw, 5.5rem);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.04em;
  white-space: nowrap;
}

.ticker-item .accent {
  font-size: 1.1em;
}

/* Контурные слова — модно и легко */
.ticker-outline {
  color: transparent;
  -webkit-text-stroke: 1.2px var(--color-plum);
}

@keyframes ticker {
  to {
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ticker-track {
    animation: none !important;
  }
}
</style>
