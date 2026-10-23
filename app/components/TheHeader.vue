<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

// top — это первый экран («Главная»)
const links = ['top', 'about', 'works', 'services', 'booking', 'location', 'reviews'] as const
const label = (link: (typeof links)[number]) => t(link === 'top' ? 'nav.home' : `nav.${link}`)

const menuOpen = ref(false)
const active = ref<(typeof links)[number]>('top')

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
  spy?.disconnect()
})
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 border-b border-ink/6 bg-white/90 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
    <div class="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
      <NuxtLink :to="localePath('/')" class="shrink-0 text-[1.6rem]" @click="menuOpen = false">
        <SiteLogo />
      </NuxtLink>

      <nav class="hidden h-full items-center xl:flex" aria-label="Main">
        <span class="nav-dot" aria-hidden="true" />
        <template v-for="link in links" :key="link">
          <a
            :href="`#${link}`"
            class="nav-link"
            :class="{ 'nav-link--active': active === link }"
            :aria-current="active === link ? 'true' : undefined"
          >{{ label(link) }}</a>
          <span class="nav-dot" aria-hidden="true" />
        </template>
      </nav>

      <div class="flex items-center gap-2">
        <LangSwitch class="hidden sm:flex" />
        <SoundToggle />
        <a href="#booking" class="cta hidden sm:inline-flex">{{ t('cta.book') }}</a>
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
        class="fixed inset-x-0 bottom-0 top-[calc(72px+env(safe-area-inset-top))] z-[49] flex flex-col overflow-y-auto bg-milk px-6 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-6 xl:hidden"
      >
        <nav class="flex flex-col" aria-label="Mobile">
          <a
            v-for="(link, i) in links"
            :key="link"
            :href="`#${link}`"
            class="flex items-baseline gap-3 border-b border-ink/8 py-4 text-3xl font-semibold tracking-tight"
            @click="menuOpen = false"
          >
            <span class="text-xs font-medium text-rose-deep">0{{ i + 1 }}</span>
            {{ label(link) }}
          </a>
        </nav>
        <div class="mt-auto flex flex-col gap-4 pt-8">
          <LangSwitch class="self-start" />
          <a href="#booking" class="btn btn-primary w-full" @click="menuOpen = false">{{ t('cta.bookOnline') }}</a>
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

.nav-dot {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: var(--color-rose);
}

.cta {
  min-height: 44px;
  align-items: center;
  border: 1.5px solid var(--color-rose);
  border-radius: 6px;
  padding: 0 1.1rem;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  transition: background-color 0.25s, color 0.25s;
}

.cta:hover {
  background: var(--color-rose);
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
