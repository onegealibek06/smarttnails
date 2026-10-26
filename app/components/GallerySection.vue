<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { gallery, salon, workSrc, type GalleryItem, type GalleryTag } from '~/data/salon'

const { t } = useI18n()

const tags: Array<GalleryTag | 'all'> = ['all', 'nude', 'french', 'design', 'bright', 'pedicure']
const filter = ref<GalleryTag | 'all'>('all')
const view = ref<'marquee' | 'grid'>('marquee')
const items = computed(() => filter.value === 'all' ? gallery : gallery.filter(g => g.tag === filter.value))

const tagLabel = (tag: GalleryTag | 'all') => tag === 'all' ? t('gallery.all') : t(`gallery.tags.${tag}`)

// Живая лента: фото делятся на 2 ряда, которые медленно плывут навстречу друг другу.
// Каждый ряд повторяется дважды — когда первая копия уезжает, на её место встаёт вторая, и цикл бесшовный.
interface Tile { item: GalleryItem, index: number, clone: boolean }

// Лёгкий наклон плиток, как у разложенных на столе фотографий
const TILTS = [-1.6, 1.1, -0.6, 1.5, -1.2, 0.7]

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
    // Секунд на одну копию ряда: чем больше фото, тем дольше — скорость остаётся спокойной
    return { tiles, duration: Math.max(70, base.length * 11) }
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

// Движение ленты на GSAP: так её можно плавно притормозить, а не остановить рывком
let motion: gsap.Context | undefined

function setupMotion() {
  motion?.revert()
  motion = undefined
  if (view.value !== 'marquee' || !marquee.value) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  gsap.registerPlugin(ScrollTrigger)

  const rowsEl = [...marquee.value.querySelectorAll<HTMLElement>('[data-row]')]
  motion = gsap.context(() => {
    const tweens = rowsEl.map((row, i) => {
      const track = row.querySelector('.marquee-track')
      const reverse = i % 2 === 1
      const tween = gsap.fromTo(track, { xPercent: reverse ? -50 : 0 }, {
        xPercent: reverse ? 0 : -50,
        duration: rows.value[i]?.duration ?? 90,
        ease: 'none',
        repeat: -1,
      })

      // Наведение или касание: лента мягко замедляется до остановки и так же мягко трогается
      let hovered = false
      row.addEventListener('pointerenter', () => {
        hovered = true
        gsap.to(tween, { timeScale: 0, duration: 0.9, ease: 'power2.out', overwrite: true })
      })
      row.addEventListener('pointerleave', () => {
        hovered = false
        gsap.to(tween, { timeScale: 1, duration: 1.2, ease: 'power2.inOut', overwrite: true })
      })
      return { tween, isHovered: () => hovered }
    })

    // Быстрая прокрутка страницы чуть подгоняет ленту, потом она снова успокаивается
    ScrollTrigger.create({
      trigger: marquee.value,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const boost = Math.min(Math.abs(self.getVelocity()) / 900, 1.5)
        if (boost < 0.15) return
        for (const { tween, isHovered } of tweens) {
          if (isHovered()) continue
          gsap.to(tween, {
            timeScale: 1 + boost,
            duration: 0.25,
            ease: 'power1.out',
            overwrite: true,
            onComplete: () => {
              if (!isHovered()) gsap.to(tween, { timeScale: 1, duration: 1.4, ease: 'power2.out', overwrite: true })
            },
          })
        }
      },
    })

    // Пока ленты нет на экране, она стоит: телефону незачем двигать фото, которых никто не видит
    const setRunning = (on: boolean) => tweens.forEach(({ tween }) => on ? tween.resume() : tween.pause())
    ScrollTrigger.create({
      trigger: marquee.value,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: self => setRunning(self.isActive),
    })
    setRunning(ScrollTrigger.isInViewport(marquee.value!))

    // И ряды слегка расходятся в стороны при прокрутке
    rowsEl.forEach((row, i) => {
      gsap.fromTo(row, { x: i % 2 ? -28 : 28 }, {
        x: i % 2 ? 28 : -28,
        ease: 'none',
        scrollTrigger: { trigger: marquee.value, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
      })
    })
  }, marquee.value)
}

// Движение новых рядов запускается в @after-enter у Transition: при смене фильтра (mode out-in)
// новая лента появляется только после ухода старой, и раньше цепляться не к чему

onMounted(() => {
  window.addEventListener('keydown', onKey)
  setupMotion()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  motion?.revert()
})
</script>

<template>
  <section id="works" v-pause-offscreen data-bg="#FBEEF3" class="section relative overflow-x-clip">
    <!-- Размытые розовые блики медленно плавают за лентой -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <span class="bokeh left-[6%] top-[38%] h-64 w-64 bg-rose/30" style="animation-duration: 26s" />
      <span class="bokeh left-[38%] top-[62%] h-80 w-80 bg-lilac/80" style="animation-duration: 32s; animation-delay: -8s" />
      <span class="bokeh right-[8%] top-[30%] h-72 w-72 bg-blush-deep/70" style="animation-duration: 28s; animation-delay: -14s" />
      <span class="bokeh right-[30%] top-[78%] h-48 w-48 bg-rose/25" style="animation-duration: 22s; animation-delay: -4s" />
    </div>

    <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
      <div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading v-reveal :eyebrow="t('gallery.eyebrow')" title-key="gallery.title" accent-key="gallery.accent" />
        <a v-reveal :href="salon.instagram" target="_blank" rel="noopener" class="btn btn-ghost self-start bg-white/60 sm:self-auto">
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

    <Transition name="swap" mode="out-in" @after-enter="setupMotion">
      <!-- Живая лента -->
      <div v-if="view === 'marquee'" :key="`m-${filter}`" ref="marquee" class="relative mt-8 flex flex-col">
        <div v-for="(row, r) in rows" :key="r" v-reveal="r * 0.15" data-row class="marquee">
          <div class="marquee-track">
            <div
              v-for="(tile, i) in row.tiles"
              :key="i"
              class="tile-wrap"
              :style="{ animationDelay: `${-(i % 7) * 0.9}s`, animationDuration: `${6 + (i % 3)}s` }"
            >
              <button
                type="button"
                class="tile group"
                :style="{ aspectRatio: `${tile.item.w} / ${tile.item.h}`, '--tilt': `${TILTS[(i + r) % TILTS.length]}deg` }"
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
                  :style="{ animationDelay: `${-(i % 6) * 2}s` }"
                >
                <span class="pointer-events-none absolute bottom-3 left-3 translate-y-1 rounded-full bg-milk/90 px-3 py-1 text-xs font-semibold opacity-0 transition lg:backdrop-blur duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                  {{ tagLabel(tile.item.tag) }}
                </span>
              </button>
            </div>
          </div>
        </div>
        <p class="mt-2 px-4 text-center text-xs text-ink-soft">{{ t('gallery.hint') }}</p>
      </div>

      <!-- Сетка -->
      <div v-else :key="`g-${filter}`" class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
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
.bokeh {
  position: absolute;
  border-radius: 999px;
  filter: blur(60px);
  animation: drift ease-in-out infinite alternate;
}

@keyframes drift {
  from {
    transform: translate3d(0, 0, 0) scale(1);
  }
  to {
    transform: translate3d(60px, -40px, 0) scale(1.15);
  }
}

/* Края ленты мягко растворяются */
.marquee {
  position: relative;
  overflow: hidden;
  padding: 18px 0 22px;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
}

/* Отступы делаем полями плиток, а не gap: так две копии ряда ровно по 50% и цикл без скачка */
.marquee-track {
  display: flex;
  width: max-content;
  will-change: transform;
}

/* Каждая плитка чуть покачивается вверх-вниз, как на воде */
.tile-wrap {
  flex: none;
  padding-right: 18px;
  animation: bob ease-in-out infinite alternate;
}

@keyframes bob {
  from {
    transform: translateY(-5px);
  }
  to {
    transform: translateY(5px);
  }
}

.tile {
  position: relative;
  display: block;
  height: 210px;
  overflow: hidden;
  border: 5px solid white;
  border-radius: 30px;
  background: var(--color-blush);
  box-shadow: 0 22px 44px -26px rgb(201 80 126 / 0.55);
  transform: rotate(var(--tilt));
  transition: transform 0.7s var(--ease-soft), box-shadow 0.7s var(--ease-soft);
}

/* Блик, как отблеск на свежем лаке, пробегает при наведении */
.tile::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(115deg, transparent 35%, rgb(255 255 255 / 0.45) 50%, transparent 65%);
  transform: translateX(-120%);
  transition: transform 1s var(--ease-soft);
  pointer-events: none;
}

.tile:hover,
.tile:focus-visible {
  transform: rotate(0deg) scale(1.05);
  box-shadow: 0 30px 60px -24px rgb(201 80 126 / 0.6);
}

.tile:hover::after,
.tile:focus-visible::after {
  transform: translateX(120%);
}

@media (min-width: 640px) {
  .tile {
    height: 280px;
  }
}

@media (min-width: 1024px) {
  .tile {
    height: 320px;
  }
}

/* Медленный и едва заметный «наезд камеры» внутри плитки */
.kenburns {
  animation: kenburns 12s ease-in-out infinite alternate;
  transform-origin: 50% 60%;
}

@keyframes kenburns {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.07) translate3d(-1.5%, -1.5%, 0);
  }
}

/* На телефоне и планшете — только сама лента: без покачивания плиток, «наезда камеры» и размытых бликов.
   Так ей хватает сил идти плавно */
@media (max-width: 1023px) {
  .tile-wrap,
  .kenburns {
    animation: none;
  }

  .bokeh {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .marquee {
    overflow-x: auto;
  }

  .tile-wrap,
  .kenburns,
  .bokeh {
    animation: none !important;
  }

  .tile-wrap:has([tabindex="-1"]) {
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
  transition: opacity 0.4s var(--ease-soft), transform 0.4s var(--ease-soft);
}

.swap-enter-from,
.swap-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
