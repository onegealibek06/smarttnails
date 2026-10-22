<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const links = ['works', 'services', 'booking', 'location', 'reviews'] as const

const scrolled = ref(false)
const menuOpen = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 24
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') menuOpen.value = false
}

watch(menuOpen, (open) => {
  document.documentElement.style.overflow = open ? 'hidden' : ''
})

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] transition-[background-color,box-shadow] duration-300"
    :class="scrolled || menuOpen ? 'bg-milk/85 shadow-[0_1px_0_rgba(42,20,36,0.06)] backdrop-blur-xl' : ''"
  >
    <div class="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
      <NuxtLink :to="localePath('/')" class="text-[1.65rem]" @click="menuOpen = false">
        <SiteLogo />
      </NuxtLink>

      <nav class="hidden items-center gap-7 lg:flex" aria-label="Main">
        <a
          v-for="link in links"
          :key="link"
          :href="`#${link}`"
          class="text-sm font-medium text-ink/75 transition hover:text-ink"
        >{{ t(`nav.${link}`) }}</a>
      </nav>

      <div class="flex items-center gap-2">
        <LangSwitch class="hidden sm:flex" />
        <SoundToggle />
        <a href="#booking" class="btn btn-primary hidden !min-h-11 sm:inline-flex">{{ t('cta.book') }}</a>
        <button
          type="button"
          class="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-milk lg:hidden"
          :aria-expanded="menuOpen"
          aria-controls="mobile-menu"
          :aria-label="menuOpen ? t('header.close') : t('header.menu')"
          @click="menuOpen = !menuOpen"
        >
          <span class="burger" :class="{ 'burger--open': menuOpen }" aria-hidden="true"><i /><i /></span>
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
        class="fixed inset-x-0 bottom-0 top-[calc(72px+env(safe-area-inset-top))] z-[49] flex flex-col overflow-y-auto bg-milk px-6 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-6 lg:hidden"
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
            {{ t(`nav.${link}`) }}
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
.burger {
  position: relative;
  width: 18px;
  height: 10px;
}

.burger i {
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  border-radius: 2px;
  background: currentColor;
  transition: transform 0.3s var(--ease-soft), top 0.3s var(--ease-soft);
}

.burger i:first-child { top: 0; }
.burger i:last-child { top: 8px; }

.burger--open i:first-child { top: 4px; transform: rotate(45deg); }
.burger--open i:last-child { top: 4px; transform: rotate(-45deg); }

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
