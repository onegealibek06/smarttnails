<script setup lang="ts">
import { salon } from '~/data/salon'

const { t } = useI18n()
const { lang } = useLang()
const loc = computed(() => locationFor(toISODate(new Date())))
const year = new Date().getFullYear()

const links = ['about', 'works', 'services', 'booking', 'location', 'reviews', 'faq'] as const

const socials = computed(() => [
  { label: 'Instagram', href: salon.instagram, icon: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm5.5-2.5h.01' },
  { label: 'WhatsApp', href: whatsappLink(salon.whatsapp, t('booking.messageSite')), icon: 'M4 20l1.3-4A8 8 0 1 1 8 18.7L4 20zm5-11.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 1a4 4 0 0 1-2.5-2.5l1-1-1-2L9 8.5z' },
  { label: 'Telegram', href: salon.telegram, icon: 'M21 4 3 11l6 2 2 6 3-4 5 4 2-15zM9 13l9-6-6 8' },
  { label: '2GIS', href: salon.twoGis, icon: 'M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z' },
])

// Гигантская подпись внизу проявляется по буквам, когда до неё доскроллили
const word = 'smartt'.split('')
const accent = 'nails'.split('')
const giant = ref<HTMLElement>()
const armed = ref(false)
const shown = ref(false)
let observer: IntersectionObserver | undefined

function toTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !giant.value) return
  armed.value = true
  observer = new IntersectionObserver(([entry]) => {
    if (entry!.isIntersecting) {
      shown.value = true
      observer?.disconnect()
    }
  }, { threshold: 0.3 })
  observer.observe(giant.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <footer data-bg="#F9E4EB" class="relative overflow-hidden pb-28 pt-16 sm:pt-20 lg:pb-8 lg:pt-24">
    <svg class="sprig pointer-events-none absolute -left-6 top-24 h-56 w-32 -rotate-12 text-white/70" viewBox="0 0 120 200" aria-hidden="true">
      <path d="M62 198C58 150 60 96 72 8" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" />
      <ellipse cx="44" cy="160" rx="20" ry="7" transform="rotate(-30 44 160)" fill="currentColor" />
      <ellipse cx="82" cy="132" rx="20" ry="7" transform="rotate(32 82 132)" fill="currentColor" />
      <ellipse cx="46" cy="106" rx="18" ry="6.5" transform="rotate(-38 46 106)" fill="currentColor" />
      <ellipse cx="86" cy="78" rx="17" ry="6" transform="rotate(36 86 78)" fill="currentColor" />
      <ellipse cx="54" cy="52" rx="15" ry="5.5" transform="rotate(-42 54 52)" fill="currentColor" />
      <ellipse cx="82" cy="26" rx="12" ry="4.5" transform="rotate(40 82 26)" fill="currentColor" />
    </svg>
    <svg class="sprig pointer-events-none absolute -right-4 top-6 h-64 w-36 rotate-[200deg] text-white/60" viewBox="0 0 120 200" aria-hidden="true">
      <path d="M62 198C58 150 60 96 72 8" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" />
      <ellipse cx="44" cy="160" rx="20" ry="7" transform="rotate(-30 44 160)" fill="currentColor" />
      <ellipse cx="82" cy="132" rx="20" ry="7" transform="rotate(32 82 132)" fill="currentColor" />
      <ellipse cx="46" cy="106" rx="18" ry="6.5" transform="rotate(-38 46 106)" fill="currentColor" />
      <ellipse cx="86" cy="78" rx="17" ry="6" transform="rotate(36 86 78)" fill="currentColor" />
      <ellipse cx="54" cy="52" rx="15" ry="5.5" transform="rotate(-42 54 52)" fill="currentColor" />
    </svg>

    <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
      <div class="grid grid-cols-[minmax(0,1fr)] gap-12 sm:grid-cols-2 lg:grid-cols-[1.1fr_0.7fr_0.8fr_1.6fr] lg:gap-10">
        <div>
          <SiteLogo class="text-[2rem]" />
          <p class="mt-1 font-accent text-lg italic text-plum">{{ salon.signature }}</p>
          <p class="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">{{ t('footer.tagline') }}</p>
        </div>

        <nav :aria-label="t('footer.menu')">
          <ul class="grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-1">
            <li v-for="link in links" :key="link">
              <a :href="`#${link}`" class="group inline-flex items-center gap-2.5 text-sm font-medium text-ink/80 transition hover:text-ink">
                <span class="h-1.5 w-1.5 rounded-full bg-rose transition group-hover:scale-150 group-hover:bg-rose-deep" aria-hidden="true" />
                {{ t(`nav.${link}`) }}
              </a>
            </li>
          </ul>
        </nav>

        <div>
          <ul class="flex gap-2" :aria-label="t('footer.follow')">
            <li v-for="s in socials" :key="s.label">
              <a
                :href="s.href"
                target="_blank"
                rel="noopener"
                :aria-label="s.label"
                class="flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-white/70 text-ink transition hover:-translate-y-0.5 hover:bg-ink hover:text-milk"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="s.icon" /></svg>
              </a>
            </li>
          </ul>
          <address class="mt-6 space-y-1.5 text-sm not-italic text-ink-soft">
            <p>{{ loc.street[lang] }}, {{ loc.details[lang] }}</p>
            <p>{{ t('location.hours') }}</p>
            <p><a :href="`tel:${salon.phone}`" class="font-medium text-ink hover:text-rose-deep">+7 776 994 66 60</a></p>
          </address>
        </div>

        <div class="sm:col-span-2 lg:col-span-1">
          <h2 class="max-w-md text-xl font-semibold leading-snug tracking-tight sm:text-2xl">{{ t('footer.formTitle') }}</h2>
          <div class="mt-5">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>

    <!-- Линия с кнопкой «наверх» и гигантская подпись -->
    <div class="relative mt-16 border-t border-ink/15">
      <button
        type="button"
        class="absolute right-4 top-0 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-xl border border-ink/15 bg-milk text-ink transition hover:-translate-y-[60%] hover:bg-white sm:right-10"
        :aria-label="t('footer.toTop')"
        @click="toTop"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 13V3m-4 4 4-4 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </button>
    </div>

    <div ref="giant" class="giant overflow-hidden px-3 pb-6 pt-8 sm:px-6" :class="{ armed, shown }" aria-hidden="true">
      <p class="whitespace-nowrap text-center text-[min(19.5vw,17rem)] font-bold leading-[0.9] tracking-[-0.055em] text-ink">
        <span v-for="(ch, i) in word" :key="`w${i}`" class="g-letter" :style="{ '--i': i }">{{ ch }}</span><span class="accent tracking-[-0.02em]"><span v-for="(ch, i) in accent" :key="`a${i}`" class="g-letter" :style="{ '--i': i + word.length }">{{ ch }}</span></span>
      </p>
      <p class="g-sign mt-2 text-right font-accent text-[min(6.2vw,5.4rem)] italic leading-none text-plum sm:pr-[4vw]">{{ salon.signature }}</p>
    </div>

    <div class="mx-auto max-w-7xl border-t border-ink/15 px-4 pt-6 sm:px-6 lg:px-10">
      <div class="flex flex-col gap-3 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between">
        <p>{{ t('footer.rights', { year }) }}</p>
        <p class="flex items-center gap-2">
          <span class="uppercase tracking-[0.18em]">{{ t('footer.madeBy') }}</span>
          <a :href="salon.developer.url" target="_blank" rel="noopener" class="font-semibold text-ink underline-offset-4 hover:text-rose-deep hover:underline">{{ salon.developer.name }}</a>
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.sprig {
  animation: sway 7s ease-in-out infinite alternate;
  transform-origin: 50% 100%;
}

/* Веточки чуть покачиваются. transform, а не rotate: rotate уже занят наклоном из Tailwind */
@keyframes sway {
  to {
    transform: rotate(6deg);
  }
}

.g-letter {
  display: inline-block;
}

.armed .g-letter {
  opacity: 0;
  transform: translateY(40%);
}

.armed .g-sign {
  opacity: 0;
  transform: translateX(24px);
}

.shown .g-letter {
  animation: g-rise 0.9s calc(var(--i) * 45ms) var(--ease-soft) forwards;
}

.shown .g-sign {
  animation: g-rise 1s 0.55s var(--ease-soft) forwards;
}

@keyframes g-rise {
  to {
    opacity: 1;
    transform: none;
  }
}
</style>
