<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

// top — это первый экран («Главная»)
const links = ['top', 'about', 'works', 'services', 'booking', 'location', 'reviews'] as const
const label = (link: (typeof links)[number]) => t(link === 'top' ? 'nav.home' : `nav.${link}`)

const menuOpen = ref(false)
const active = ref<(typeof links)[number]>('top')

// На первом экране шапка прозрачная; фон мягко появляется, когда к ней подходит следующий раздел
const solid = ref(false)
let ticking = false

function updateSolid() {
  ticking = false
  const hero = document.getElementById('top')
  solid.value = hero ? hero.getBoundingClientRect().bottom < 120 : window.scrollY > 40
}

function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(updateSolid)
}

// Буквы большой подписи в мобильном меню
const word = 'smartt'.split('')
const accent = 'nails'.split('')

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') menuOpen.value = false
}

watch(menuOpen, (open) => {
  document.documentElement.style.overflow = open ? 'hidden' : ''
})

// Подсветка пункта меню той секции, которая сейчас на экране
let spy: IntersectionObserver | undefined

onMounted(() => {
  window.addEventListener('keydown', onKey)
  window.addEventListener('scroll', onScroll, { passive: true })
  updateSolid()
  spy = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) active.value = entry.target.id as (typeof links)[number]
    }
  }, { rootMargin: '-45% 0px -50% 0px' })
  for (const id of links) {
    const el = document.getElementById(id)
    if (el) spy.observe(el)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('scroll', onScroll)
  spy?.disconnect()
})
</script>

<template>
  <header class="header fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)]" :class="{ 'header--solid': solid || menuOpen }">
    <div class="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
      <NuxtLink :to="localePath('/')" class="shrink-0 text-[1.6rem]" @click="menuOpen = false">
        <SiteLogo />
      </NuxtLink>

      <nav class="hidden h-full items-center gap-1 xl:flex" aria-label="Main">
        <a
          v-for="link in links"
          :key="link"
          :href="`#${link}`"
          class="nav-link"
          :class="{ 'nav-link--active': active === link }"
          :aria-current="active === link ? 'true' : undefined"
        >{{ label(link) }}</a>
      </nav>

      <div class="flex items-center gap-2">
        <LangSwitch class="hidden sm:flex" />
        <SoundToggle />
        <a href="#booking" class="cta hidden sm:inline-flex">
          {{ t('cta.book') }}
          <span class="cta-icon" aria-hidden="true">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m-4-4 4 4-4 4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </span>
        </a>
        <button
          type="button"
          class="flex h-11 w-11 items-center justify-center rounded-full text-ink transition hover:bg-blush xl:hidden"
          :aria-expanded="menuOpen"
          aria-controls="mobile-menu"
          :aria-label="menuOpen ? t('header.close') : t('header.menu')"
          @click="menuOpen = !menuOpen"
        >
          <span class="burger" :class="{ 'burger--open': menuOpen }" aria-hidden="true"><i /><i /><i /></span>
        </button>
      </div>
    </div>
  </header>

  <!-- Меню вынесено в body: размытие шапки (backdrop-filter) ломает position: fixed у детей -->
  <Teleport to="body">
    <Transition name="sheet">
      <div
        v-if="menuOpen"
        id="mobile-menu"
        class="fixed inset-x-0 bottom-0 top-[calc(72px+env(safe-area-inset-top))] z-[49] flex flex-col overflow-y-auto overflow-x-hidden bg-milk px-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3 xl:hidden"
      >
        <div class="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-blush blur-3xl" aria-hidden="true" />
        <nav class="flex flex-col" aria-label="Mobile">
          <a
            v-for="(link, i) in links"
            :key="link"
            :href="`#${link}`"
            class="flex items-baseline gap-3 border-b border-ink/8 py-3 text-[1.65rem] font-semibold leading-tight tracking-tight"
            @click="menuOpen = false"
          >
            <span class="text-xs font-medium text-rose-deep">0{{ i + 1 }}</span>
            {{ label(link) }}
          </a>
        </nav>
        <div class="relative mt-auto flex flex-col gap-4 pt-6">
          <LangSwitch class="self-start" />
          <a href="#booking" class="cta cta--wide flex" @click="menuOpen = false">
            {{ t('cta.bookOnline') }}
            <span class="cta-icon" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m-4-4 4 4-4 4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </span>
          </a>
        </div>

        <!-- Большая подпись, как в подвале -->
        <div class="menu-sign relative -mx-6 mt-6 px-3" aria-hidden="true">
          <p class="whitespace-nowrap text-center text-[21vw] font-bold leading-[0.9] tracking-[-0.055em] text-ink">
            <span v-for="(ch, i) in word" :key="`w${i}`" class="sign-letter" :style="{ '--i': i }">{{ ch }}</span><span class="accent tracking-[-0.02em]"><span v-for="(ch, i) in accent" :key="`a${i}`" class="sign-letter" :style="{ '--i': i + word.length }">{{ ch }}</span></span>
          </p>
          <p class="sign-sub mt-1 text-right font-accent text-[6.6vw] italic leading-none text-plum">by Ardak Aldanazarova</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.nav-link {
  position: relative;
  display: flex;
  height: 100%;
  align-items: center;
  padding: 0 0.9rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: color-mix(in srgb, var(--color-ink) 75%, transparent);
  transition: color 0.2s;
}

.nav-link:hover,
.nav-link--active {
  color: var(--color-ink);
}

/* Розовая полоска под активным пунктом, как на референсе */
.nav-link::after {
  content: '';
  position: absolute;
  inset-inline: 0.6rem;
  bottom: -1px;
  height: 3px;
  border-radius: 3px 3px 0 0;
  background: var(--color-rose);
  transform: scaleX(0);
  transition: transform 0.45s var(--ease-soft);
}

.nav-link--active::after {
  transform: scaleX(1);
}

/* Прозрачная на первом экране, при прокрутке мягко «запотевает» */
.header {
  border-bottom: 1px solid transparent;
  background-color: rgb(255 255 255 / 0);
  transition:
    background-color 0.7s var(--ease-soft),
    border-color 0.7s var(--ease-soft),
    box-shadow 0.7s var(--ease-soft),
    backdrop-filter 0.7s var(--ease-soft),
    -webkit-backdrop-filter 0.7s var(--ease-soft);
}

/* На телефоне — плотный фон без размытия: размывать всё под шапкой на каждом кадре прокрутки телефону тяжело */
.header--solid {
  border-bottom-color: rgb(42 20 36 / 0.06);
  background-color: rgb(255 255 255 / 0.95);
  box-shadow: 0 12px 32px -24px rgb(42 20 36 / 0.35);
}

@media (min-width: 1024px) {
  .header--solid {
    background-color: rgb(255 255 255 / 0.82);
    -webkit-backdrop-filter: blur(18px) saturate(1.4);
    backdrop-filter: blur(18px) saturate(1.4);
  }
}

/* Кнопка «Записаться»: тёмная капсула с розовым кружком-стрелкой */
.cta {
  min-height: 44px;
  align-items: center;
  gap: 0.6rem;
  border-radius: 999px;
  background: var(--color-ink);
  padding: 0 0.4rem 0 1.15rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-milk);
  transition: background-color 0.3s, transform 0.3s var(--ease-soft);
}

.cta-icon {
  display: flex;
  height: 32px;
  width: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--color-rose);
  color: var(--color-ink);
  transition: transform 0.4s var(--ease-soft);
}

/* Та же капсула во всю ширину — в мобильном меню */
.cta--wide {
  min-height: 54px;
  justify-content: space-between;
  padding: 0 0.45rem 0 1.4rem;
  font-size: 1rem;
}

.cta--wide .cta-icon {
  height: 40px;
  width: 40px;
}

.cta:hover {
  background: var(--color-plum);
}

.cta:hover .cta-icon {
  transform: rotate(-45deg);
}

.cta:active {
  transform: scale(0.97);
}

/* Буквы большой подписи в мобильном меню поднимаются по одной */
.sign-letter {
  display: inline-block;
  opacity: 0;
  transform: translateY(45%);
  animation: sign-rise 0.8s calc(0.15s + var(--i) * 40ms) var(--ease-soft) forwards;
}

.sign-sub {
  opacity: 0;
  animation: sign-rise 0.8s 0.6s var(--ease-soft) forwards;
}

@keyframes sign-rise {
  to {
    opacity: 1;
    transform: none;
  }
}

.burger {
  position: relative;
  width: 20px;
  height: 14px;
}

.burger i {
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  border-radius: 2px;
  background: currentColor;
  transition: transform 0.3s var(--ease-soft), top 0.3s var(--ease-soft), opacity 0.2s;
}

.burger i:nth-child(1) { top: 0; }
.burger i:nth-child(2) { top: 6px; }
.burger i:nth-child(3) { top: 12px; }

.burger--open i:nth-child(1) { top: 6px; transform: rotate(45deg); }
.burger--open i:nth-child(2) { opacity: 0; }
.burger--open i:nth-child(3) { top: 6px; transform: rotate(-45deg); }

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.35s var(--ease-soft), transform 0.35s var(--ease-soft);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
