<script setup lang="ts">
import { salon } from '~/data/salon'

const { t } = useI18n()
const { lang } = useLang()
const rating = computed(() => salon.rating.toFixed(1).replace('.', lang.value === 'en' ? '.' : ','))

// armed — фото спрятано и ждёт появления; shown — секция на экране, фото раскрывается снизу вверх.
// Без JavaScript ни один класс не ставится, и фото просто видно.
const photo = ref<HTMLElement>()
const armed = ref(false)
const shown = ref(false)
let observer: IntersectionObserver | undefined

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !photo.value) return
  armed.value = true
  observer = new IntersectionObserver(([entry]) => {
    if (!entry!.isIntersecting) return
    shown.value = true
    observer?.disconnect()
  }, { threshold: 0.25 })
  observer.observe(photo.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <section id="about" data-bg="#F7EFEA" class="relative overflow-x-clip py-20 sm:py-28">
    <div class="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] items-center gap-16 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20 lg:px-10">
      <!-- Фото в арке: розовое свечение позади, вращающаяся подпись и плашка «2017» -->
      <div ref="photo" class="about-photo relative mx-auto w-full max-w-[440px]" :class="{ armed, shown }">
        <div class="pointer-events-none absolute -inset-8 rounded-full bg-rose/35 blur-3xl" aria-hidden="true" />
        <div class="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-lilac blur-3xl" aria-hidden="true" />

        <div data-photo class="arch relative aspect-[4/5] border-[6px] border-white bg-blush shadow-[0_40px_80px_-40px_rgba(123,45,99,0.55)]">
          <img
            src="/about/ardak-1000.webp"
            srcset="/about/ardak-600.webp 480w, /about/ardak-1000.webp 760w"
            sizes="(min-width: 1024px) 440px, 90vw"
            :alt="t('about.photoAlt')"
            width="760"
            height="950"
            loading="lazy"
            class="h-full w-full object-cover"
          >
        </div>

        <svg class="ring absolute -right-3 -top-3 h-28 w-28 text-plum sm:-right-8 sm:-top-6 sm:h-32 sm:w-32" viewBox="0 0 120 120" aria-hidden="true">
          <defs><path id="about-ring" d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0" /></defs>
          <circle cx="60" cy="60" r="58" fill="#FFF7F5" />
          <text font-size="9" font-weight="600" fill="currentColor"><textPath href="#about-ring" textLength="286" lengthAdjust="spacing">SMARTTNAILS · BY ARDAK ALDANAZAROVA ·</textPath></text>
          <path d="M60 44c4.5 0 6.5 6.5 6.5 11v8.5c0 2.8-1.8 4.5-4.5 4.5h-4c-2.7 0-4.5-1.7-4.5-4.5V55c0-4.5 2-11 6.5-11z" fill="#EE9BB8" />
        </svg>

        <div class="float-card absolute -bottom-6 left-0 rounded-3xl bg-white/90 px-5 py-4 shadow-[0_24px_50px_-24px_rgba(123,45,99,0.5)] backdrop-blur sm:-left-8">
          <p class="text-3xl font-semibold tracking-tight">2017</p>
          <p class="mt-0.5 max-w-[9rem] text-xs leading-snug text-ink-soft">{{ t('about.since') }}</p>
        </div>
      </div>

      <div>
        <SectionHeading v-reveal :eyebrow="t('about.eyebrow')" title-key="about.title" accent-key="about.accent" />

        <blockquote v-reveal class="mt-8 border-l-2 border-rose pl-5 font-accent text-2xl italic leading-snug text-plum sm:text-3xl">
          {{ t('about.quote') }}
        </blockquote>

        <div class="mt-6 space-y-4 text-lg leading-relaxed text-ink-soft">
          <p v-reveal>{{ t('about.p1') }}</p>
          <p v-reveal>{{ t('about.p2') }}</p>
          <p v-reveal>{{ t('about.p3') }}</p>
        </div>

        <dl v-reveal class="mt-8 grid max-w-md grid-cols-2 gap-3">
          <div class="rounded-3xl bg-white/70 px-5 py-4 backdrop-blur">
            <dt class="sr-only">{{ t('about.years') }}</dt>
            <dd class="text-3xl font-semibold tracking-tight">8</dd>
            <dd class="mt-0.5 text-xs text-ink-soft">{{ t('about.years') }}</dd>
          </div>
          <div class="rounded-3xl bg-white/70 px-5 py-4 backdrop-blur">
            <dt class="sr-only">{{ t('about.rating') }}</dt>
            <dd class="flex items-center gap-1.5 text-3xl font-semibold tracking-tight">
              {{ rating }}
              <svg width="18" height="18" viewBox="0 0 20 20" class="text-rose-deep" aria-hidden="true"><path fill="currentColor" d="m10 1.8 2.5 5.3 5.8.7-4.3 4 1.1 5.7L10 14.7l-5.1 2.8L6 11.8l-4.3-4 5.8-.7z" /></svg>
            </dd>
            <dd class="mt-0.5 text-xs text-ink-soft">{{ t('about.rating') }}</dd>
          </div>
        </dl>

        <div v-reveal class="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
          <a :href="salon.instagram" target="_blank" rel="noopener" class="btn btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>
            {{ t('about.cta') }}
          </a>
          <p class="font-accent text-3xl italic text-rose-deep" aria-hidden="true">{{ salon.owner }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ring {
  animation: spin 24s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.float-card {
  animation: float 6s ease-in-out infinite alternate;
}

@keyframes float {
  from {
    transform: translateY(-6px);
  }
  to {
    transform: translateY(6px);
  }
}

/* Фото раскрывается снизу вверх и чуть отдаляется, плашки появляются следом */
.armed [data-photo] {
  clip-path: inset(100% 0 0 0 round 999px 999px 28px 28px);
}

.armed [data-photo] img {
  transform: scale(1.18);
}

.armed .ring,
.armed .float-card {
  opacity: 0;
}

.shown [data-photo] {
  clip-path: inset(0 0 0 0 round 999px 999px 28px 28px);
  transition: clip-path 1.4s var(--ease-soft);
}

.shown [data-photo] img {
  transform: scale(1);
  transition: transform 2s var(--ease-soft);
}

.shown .ring,
.shown .float-card {
  opacity: 1;
  transition: opacity 0.8s 0.9s;
}
</style>
