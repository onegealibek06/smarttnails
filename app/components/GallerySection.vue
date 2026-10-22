<script setup lang="ts">
import { gallery, salon, workSrc, type GalleryItem, type GalleryTag } from '~/data/salon'

const { t } = useI18n()

const tags: Array<GalleryTag | 'all'> = ['all', 'nude', 'french', 'design', 'bright', 'pedicure']
const filter = ref<GalleryTag | 'all'>('all')
const view = ref<'marquee' | 'grid'>('marquee')
const items = computed(() => filter.value === 'all' ? gallery : gallery.filter(g => g.tag === filter.value))

const tagLabel = (tag: GalleryTag | 'all') => tag === 'all' ? t('gallery.all') : t(`gallery.tags.${tag}`)

// Живая лента: фото делятся на 2 ряда, которые едут навстречу друг другу.
// Каждый ряд повторяется дважды — когда первая копия уезжает, на её место встаёт вторая, и цикл бесшовный.
interface Tile { item: GalleryItem, index: number, clone: boolean }

const rows = computed(() => {
  const list = items.value.map((item, index) => ({ item, index }))
  const split = list.length >= 8 ? [list.filter((_, i) => i % 2 === 0), list.filter((_, i) => i % 2 === 1)] : [list]
  return split.map((row) => {
    let base = [...row]
    while (base.length && base.length < 10) base = [...base, ...row]
    const tiles: Tile[] = [
      ...base.map((x, i) => ({ ...x, clone: i >= row.length })),
      ...base.map(x => ({ ...x, clone: true })),
    ]
    return { tiles, duration: Math.max(50, base.length * 8) }
  })
})

const marquee = ref<HTMLElement>()

// Лайтбокс
const openIndex = ref<number | null>(null)
const closeButton = ref<HTMLButtonElement>()
let lastFocus: HTMLElement | null = null
let touchX = 0

const current = computed(() => openIndex.value === null ? null : items.value[openIndex.value])

async function open(i: number, e: Event) {
  lastFocus = e.currentTarget as HTMLElement
  openIndex.value = i
  document.documentElement.style.overflow = 'hidden'
  await nextTick()
  closeButton.value?.focus()
}

function close() {
  openIndex.value = null
  document.documentElement.style.overflow = ''
  lastFocus?.focus()
}

function step(dir: 1 | -1) {
  if (openIndex.value === null) return
  const n = items.value.length
  openIndex.value = (openIndex.value + dir + n) % n
}

function onKey(e: KeyboardEvent) {
  if (openIndex.value === null) return
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowRight') step(1)
  if (e.key === 'ArrowLeft') step(-1)
}

function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0]!.clientX - touchX
  if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1)
}

// При прокрутке страницы ряды ещё и слегка разъезжаются в стороны
let scrollFx: { kill: () => void } | undefined

async function setupScrollFx() {
  scrollFx?.kill()
  scrollFx = undefined
  if (view.value !== 'marquee' || !marquee.value) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const { gsap } = await import('gsap')
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  gsap.registerPlugin(ScrollTrigger)
  const rowsEl = marquee.value.querySelectorAll<HTMLElement>('[data-row]')
  scrollFx = gsap.context(() => {
    rowsEl.forEach((row, i) => {
      gsap.fromTo(row, { x: i % 2 ? -60 : 60 }, {
        x: i % 2 ? 60 : -60,
        ease: 'none',
        scrollTrigger: { trigger: marquee.value, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      })
    })
  })
}

// Ждём, пока закончится смена ленты/сетки (переход 0,3 с), и только потом цепляем эффект к новым рядам
watch([view, filter], () => setTimeout(setupScrollFx, 400))

onMounted(() => {
  window.addEventListener('keydown', onKey)
  setupScrollFx()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  scrollFx?.kill()
})
</script>

<template>
  <section id="works" class="overflow-x-clip py-20 sm:py-28">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
      <div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading v-reveal :eyebrow="t('gallery.eyebrow')" title-key="gallery.title" accent-key="gallery.accent" />
        <a v-reveal :href="salon.instagram" target="_blank" rel="noopener" class="btn btn-ghost self-start sm:self-auto">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>
          {{ t('gallery.more') }}
        </a>
      </div>

      <div class="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" :aria-label="t('gallery.eyebrow')">
          <button
            v-for="tag in tags"
            :key="tag"
            type="button"
            class="chip shrink-0"
            :aria-pressed="filter === tag"
            @click="filter = tag"
          >
            {{ tagLabel(tag) }}
          </button>
        </div>

        <div class="flex shrink-0 self-start rounded-full border border-ink/10 bg-white p-1 lg:self-auto">
          <button
            v-for="mode in (['marquee', 'grid'] as const)"
            :key="mode"
            type="button"
            class="flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition"
            :class="view === mode ? 'bg-ink text-milk' : 'text-ink/70 hover:text-ink'"
            :aria-pressed="view === mode"
            @click="view = mode"
          >
            <svg v-if="mode === 'marquee'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="2" y="5" width="7" height="6" rx="1.5" /><rect x="11" y="5" width="11" height="6" rx="1.5" /><rect x="2" y="13" width="11" height="6" rx="1.5" /><rect x="15" y="13" width="7" height="6" rx="1.5" /></svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
            {{ mode === 'marquee' ? t('gallery.marquee') : t('gallery.grid') }}
          </button>
        </div>
      </div>
    </div>

    <Transition name="swap" mode="out-in">
      <!-- Живая лента -->
      <div v-if="view === 'marquee'" :key="`m-${filter}`" ref="marquee" class="mt-10 flex flex-col gap-3 sm:gap-4">
        <div v-for="(row, r) in rows" :key="r" data-row class="marquee">
          <div
            class="marquee-track"
            :class="{ 'marquee-track--reverse': r % 2 === 1 }"
            :style="{ '--duration': `${row.duration}s` }"
          >
            <button
              v-for="(tile, i) in row.tiles"
              :key="i"
              type="button"
              class="tile group"
              :class="{ clone: tile.clone }"
              :style="{ aspectRatio: `${tile.item.w} / ${tile.item.h}` }"
              :aria-hidden="tile.clone ? 'true' : undefined"
              :tabindex="tile.clone ? -1 : 0"
              :aria-label="t('gallery.open')"
              @click="open(tile.index, $event)"
            >
              <img
                :src="workSrc(tile.item.file)"
                :alt="tile.clone ? '' : t('gallery.alt', { tag: tagLabel(tile.item.tag) })"
                :width="tile.item.w"
                :height="tile.item.h"
                loading="lazy"
                decoding="async"
                class="kenburns h-full w-full object-cover"
                :style="{ animationDelay: `${-(i % 6) * 1.6}s` }"
              >
              <span class="pointer-events-none absolute bottom-3 left-3 rounded-full bg-milk/90 px-3 py-1 text-xs font-semibold opacity-0 backdrop-blur transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                {{ tagLabel(tile.item.tag) }}
              </span>
            </button>
          </div>
        </div>
        <p class="px-4 text-center text-xs text-ink-soft">{{ t('gallery.hint') }}</p>
      </div>

      <!-- Сетка -->
      <div v-else :key="`g-${filter}`" class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <ul class="mt-8 columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4">
          <li v-for="(item, i) in items" :key="item.file" class="mb-3 break-inside-avoid sm:mb-4">
            <button
              type="button"
              class="group block w-full overflow-hidden rounded-[24px] bg-blush"
              :aria-label="t('gallery.open')"
              @click="open(i, $event)"
            >
              <img
                :src="workSrc(item.file)"
                :alt="t('gallery.alt', { tag: tagLabel(item.tag) })"
                loading="lazy"
                decoding="async"
                :width="item.w"
                :height="item.h"
                class="w-full object-cover transition duration-700 group-hover:scale-105"
              >
            </button>
          </li>
        </ul>
      </div>
    </Transition>

    <Teleport to="body">
      <Transition name="swap">
        <div
          v-if="current"
          class="fixed inset-0 z-[90] flex items-center justify-center bg-ink/92 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          :aria-label="t('gallery.alt', { tag: tagLabel(current.tag) })"
          @click.self="close"
          @touchstart.passive="touchX = $event.touches[0]!.clientX"
          @touchend.passive="onTouchEnd"
        >
          <img :src="workSrc(current.file, 1400)" :alt="t('gallery.alt', { tag: tagLabel(current.tag) })" class="max-h-[82vh] max-w-full rounded-[28px] object-contain">
          <button ref="closeButton" type="button" class="lb-btn right-4 top-[calc(1rem+env(safe-area-inset-top))]" :aria-label="t('gallery.close')" @click="close">✕</button>
          <button type="button" class="lb-btn bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-[calc(100%+6px)] sm:bottom-auto sm:left-6 sm:top-1/2 sm:translate-x-0 sm:-translate-y-1/2" :aria-label="t('gallery.prev')" @click="step(-1)">←</button>
          <button type="button" class="lb-btn bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 translate-x-[6px] sm:bottom-auto sm:left-auto sm:right-6 sm:top-1/2 sm:translate-x-0 sm:-translate-y-1/2" :aria-label="t('gallery.next')" @click="step(1)">→</button>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.no-scrollbar {
  scrollbar-width: none;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.marquee {
  overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
}

.marquee-track {
  display: flex;
  gap: 14px;
  width: max-content;
  animation: marquee var(--duration) linear infinite;
}

.marquee-track--reverse {
  animation-direction: reverse;
}

/* Пауза, когда смотрят на фото: наведение мышью, фокус с клавиатуры, палец на экране */
.marquee:hover .marquee-track,
.marquee:focus-within .marquee-track,
.marquee:active .marquee-track {
  animation-play-state: paused;
}

@keyframes marquee {
  to {
    /* Сдвиг ровно на одну копию ряда (половина ширины + половина промежутка) */
    transform: translateX(calc(-50% - 7px));
  }
}

.tile {
  position: relative;
  height: 220px;
  flex: none;
  overflow: hidden;
  border-radius: 26px;
  background: var(--color-blush);
  transition: transform 0.5s var(--ease-soft), border-radius 0.5s var(--ease-soft);
}

.tile:hover {
  transform: translateY(-6px) rotate(-1deg);
  border-radius: 40px;
}

.marquee:nth-child(2) .tile:nth-child(odd) {
  border-radius: 120px 120px 26px 26px;
}

@media (min-width: 640px) {
  .tile {
    height: 300px;
  }
}

@media (min-width: 1024px) {
  .tile {
    height: 340px;
  }
}

/* Медленный «наезд камеры» внутри каждой плитки — фото будто живые */
.kenburns {
  animation: kenburns 9s ease-in-out infinite alternate;
  transform-origin: 50% 60%;
}

@keyframes kenburns {
  from {
    transform: scale(1) translate3d(0, 0, 0);
  }
  to {
    transform: scale(1.12) translate3d(-2%, -2%, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .marquee {
    overflow-x: auto;
  }

  .marquee-track,
  .kenburns {
    animation: none !important;
  }

  .clone {
    display: none;
  }
}

.lb-btn {
  position: absolute;
  display: flex;
  height: 48px;
  width: 48px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgb(255 247 245 / 0.12);
  color: var(--color-milk);
  font-size: 1.1rem;
  transition: background-color 0.2s;
}

.lb-btn:hover {
  background: rgb(255 247 245 / 0.25);
}

.swap-enter-active,
.swap-leave-active {
  transition: opacity 0.3s var(--ease-soft), transform 0.3s var(--ease-soft);
}

.swap-enter-from,
.swap-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
