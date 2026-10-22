<script setup lang="ts">
import { heroImages, salon, services } from '~/data/salon'

const { t } = useI18n()
const { lang } = useLang()
const preloaderDone = useState('preloader:done', () => false)
const { nearestSlot, load } = useBooking()

const today = toISODate(new Date())
const place = computed(() => locationFor(today).street[lang.value])

const nearest = ref<ReturnType<typeof nearestSlot>>(null)
const nearestLabel = computed(() => {
  if (!nearest.value) return t('hero.noFree')
  const day = nearest.value.offset === 0
    ? t('hero.today')
    : nearest.value.offset === 1
      ? t('hero.tomorrow')
      : formatDay(nearest.value.date, lang.value, { weekday: 'long' })
  return `${day}, ${formatTime(nearest.value.start)}`
})

const root = ref<HTMLElement>()

async function playIntro() {
  if (!root.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const { gsap } = await import('gsap')
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
  tl.from(root.value.querySelectorAll('[data-hero]'), { y: 40, opacity: 0, duration: 1, stagger: 0.08 })
    .from(root.value.querySelector('[data-hero-photo]'), { clipPath: 'inset(100% 0 0 0 round 999px 999px 28px 28px)', duration: 1.3 }, 0.1)
    .from(root.value.querySelectorAll('[data-hero-float]'), { scale: 0.8, opacity: 0, duration: 0.8, stagger: 0.12 }, 0.6)
}

onMounted(() => {
  load()
  nearest.value = nearestSlot(90)
  if (preloaderDone.value) playIntro()
  else {
    const stop = watch(preloaderDone, (done) => {
      if (done) {
        playIntro()
        stop()
      }
    })
  }
})
</script>

<template>
  <section ref="root" class="relative overflow-hidden pb-16 pt-[calc(96px+env(safe-area-inset-top))] sm:pt-32 lg:pb-24">
    <div class="pointer-events-none absolute -right-40 top-10 h-[34rem] w-[34rem] rounded-full bg-blush blur-3xl" aria-hidden="true" />
    <div class="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-lilac/70 blur-3xl" aria-hidden="true" />

    <div class="relative mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-10">
      <div>
        <a
          data-hero
          href="#location"
          class="inline-flex max-w-full items-center gap-2.5 rounded-full border border-ink/8 bg-white/80 py-2 pl-3 pr-4 text-sm font-medium backdrop-blur"
        >
          <span class="relative flex h-2.5 w-2.5 shrink-0">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose opacity-70" />
            <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-deep" />
          </span>
          <span class="min-w-0 truncate">{{ t('hero.badge', { place }) }}</span>
        </a>

        <h1 data-hero class="mt-6 text-[clamp(2.7rem,8.4vw,5.6rem)] font-semibold leading-[0.98] tracking-[-0.05em]">
          {{ t('hero.title1') }}
          <span class="accent text-[1.12em]">{{ t('hero.titleAccent') }}</span>
          {{ t('hero.title2') }}
        </h1>

        <p data-hero class="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
          {{ t('hero.subtitle') }}
        </p>

        <div data-hero class="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href="#booking" class="btn btn-primary">
            {{ t('cta.bookOnline') }}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10m-4-4 4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </a>
          <a href="#works" class="btn btn-ghost">{{ t('cta.seeWorks') }}</a>
        </div>

        <dl data-hero class="mt-10 grid max-w-md grid-cols-3 divide-x divide-ink/10 rounded-3xl border border-ink/8 bg-white/70 py-4 backdrop-blur">
          <div class="px-4">
            <dt class="sr-only">{{ t('hero.ratingLabel') }}</dt>
            <dd class="flex items-center gap-1 text-2xl font-semibold tracking-tight">
              {{ salon.rating.toFixed(1).replace('.', lang === 'en' ? '.' : ',') }}
              <svg width="16" height="16" viewBox="0 0 20 20" class="text-rose-deep" aria-hidden="true"><path fill="currentColor" d="m10 1.8 2.5 5.3 5.8.7-4.3 4 1.1 5.7L10 14.7l-5.1 2.8L6 11.8l-4.3-4 5.8-.7z" /></svg>
            </dd>
            <dd class="mt-1 text-xs leading-tight text-ink-soft">{{ t('hero.ratingLabel') }}</dd>
          </div>
          <div class="px-4">
            <dt class="sr-only">{{ t('hero.hoursLabel') }}</dt>
            <dd class="text-2xl font-semibold tracking-tight">9–22</dd>
            <dd class="mt-1 text-xs leading-tight text-ink-soft">{{ t('hero.hoursLabel') }}</dd>
          </div>
          <div class="px-4">
            <dt class="sr-only">{{ t('hero.servicesLabel') }}</dt>
            <dd class="text-2xl font-semibold tracking-tight">{{ services.length }}</dd>
            <dd class="mt-1 text-xs leading-tight text-ink-soft">{{ t('hero.servicesLabel') }}</dd>
          </div>
        </dl>
      </div>

      <div class="relative mx-auto w-full max-w-md lg:max-w-none">
        <div data-hero-photo class="arch relative aspect-[4/5] bg-blush lg:ml-auto lg:w-[88%]">
          <img
            :src="heroImages.main"
            alt=""
            width="1000"
            height="1250"
            fetchpriority="high"
            class="h-full w-full object-cover"
          >
        </div>

        <div data-hero-float class="absolute -bottom-6 left-0 h-32 w-32 overflow-hidden rounded-full border-[6px] border-milk sm:h-40 sm:w-40 lg:left-2">
          <img :src="heroImages.small" alt="" width="600" height="600" loading="lazy" class="h-full w-full object-cover">
        </div>

        <svg data-hero-float class="spin absolute -top-4 right-0 h-28 w-28 text-plum sm:h-32 sm:w-32" viewBox="0 0 120 120" aria-hidden="true">
          <defs><path id="ring" d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0" /></defs>
          <circle cx="60" cy="60" r="58" fill="#FFF7F5" />
          <text font-size="9.5" font-weight="600" fill="currentColor"><textPath href="#ring" textLength="286" lengthAdjust="spacing">SMARTTNAILS · NAIL STUDIO · ASTANA ·</textPath></text>
          <path d="M60 44c4.5 0 6.5 6.5 6.5 11v8.5c0 2.8-1.8 4.5-4.5 4.5h-4c-2.7 0-4.5-1.7-4.5-4.5V55c0-4.5 2-11 6.5-11z" fill="#EE9BB8" />
        </svg>

        <div data-hero-float class="absolute -right-1 bottom-10 w-56 rounded-3xl bg-white/90 p-4 shadow-[0_20px_60px_-20px_rgba(123,45,99,0.35)] backdrop-blur sm:-right-4">
          <p class="text-xs font-medium text-ink-soft">{{ t('hero.nearest') }}</p>
          <ClientOnly>
            <p class="mt-1 text-lg font-semibold first-letter:uppercase">{{ nearestLabel }}</p>
            <template #fallback>
              <p class="mt-1 h-7 w-32 animate-pulse rounded-lg bg-blush" />
            </template>
          </ClientOnly>
          <a href="#booking" class="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-rose-deep">
            {{ t('cta.book') }} →
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.spin {
  animation: spin 22s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
