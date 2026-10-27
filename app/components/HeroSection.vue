<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { salon } from '~/data/salon'

const { t } = useI18n()
const preloaderDone = useState('preloader:done', () => false)

// Фото для первого экрана — те, что выбрала она (имя файла = время скриншота).
// Сменяют друг друга с плавным наплывом; в активном — медленный «наезд камеры»
const slides = ['1203-52', '1205-26', '1205-38', '1207-58', '1211-40', '1213-23'].map(name => `/hero/${name}.webp`)
const SLIDE_MS = 5500
const current = ref(0)
// Сначала грузятся только первый и следующий слайд, остальные — по мере показа:
// иначе телефон при открытии сразу качает все шесть фото
const loaded = ref(new Set([0, 1]))
watch(current, (i) => {
  loaded.value = new Set([...loaded.value, i, (i + 1) % slides.length])
})

const root = ref<HTMLElement>()
// armed — элементы спрятаны и ждут вступительной анимации. Без JavaScript всё просто видно.
const armed = ref(false)

const sparkles = [
  { x: 24, y: 30, s: 16, d: 0 },
  { x: 62, y: 16, s: 11, d: 0.8 },
  { x: 78, y: 52, s: 18, d: 1.6 },
  { x: 42, y: 68, s: 10, d: 0.4 },
  { x: 88, y: 24, s: 12, d: 2.2 },
  { x: 54, y: 40, s: 9, d: 1.2 },
]

let timer: ReturnType<typeof setInterval> | undefined
let ctx: gsap.Context | undefined
// Слайды листаются, только пока первый экран виден: прокрученный вниз слайдер не нагружает телефон
let inView = true
let viewObserver: IntersectionObserver | undefined

function goTo(i: number) {
  current.value = i
  restartTimer()
}

function restartTimer() {
  clearInterval(timer)
  timer = setInterval(() => {
    if (inView && !document.hidden) current.value = (current.value + 1) % slides.length
  }, SLIDE_MS)
}

function intro() {
  const el = root.value
  if (!el) return
  ctx = gsap.context(() => {
    gsap.timeline({ defaults: { ease: 'power4.out' } })
      .fromTo('[data-media]', { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'power4.inOut' }, 0)
      .fromTo('[data-media-inner]', { scale: 1.25 }, { scale: 1, duration: 2.1, ease: 'power3.out' }, 0)
      // y: 0 обязательно: иначе GSAP возьмёт сдвиг из CSS (translateY 115%) в пикселях, и строки останутся внизу
      .fromTo('.line-inner', { yPercent: 115, y: 0 }, { yPercent: 0, y: 0, duration: 1.15, stagger: 0.12 }, 0.35)
      .fromTo('[data-fade]', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.08 }, 0.75)
      .fromTo('.sparkle-wrap', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(2.5)' }, 1.3)
  }, el)
}

// Заставка ещё на экране: её шторка сама открывает первый экран. Поэтому без «шторки в шторке»
// (фото выезжает сбоку, пока заставка уезжает вверх) — только мягкое движение вверх вслед за ней
function softIntro() {
  const el = root.value
  if (!el) return
  ctx = gsap.context(() => {
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .fromTo('[data-media-inner]', { scale: 1.08 }, { scale: 1, duration: 1.8 }, 0)
      .fromTo('.line-inner', { y: 36 }, { y: 0, duration: 1, stagger: 0.07 }, 0.1)
      .fromTo('[data-fade]', { y: 22 }, { y: 0, duration: 0.9, stagger: 0.05 }, 0.2)
      .fromTo('.sparkle-wrap', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(2.5)' }, 0.8)
  }, el)
}

function setupMotion() {
  const el = root.value
  if (!el) return
  gsap.registerPlugin(ScrollTrigger)
  ctx ??= gsap.context(() => {}, el)
  ctx?.add(() => {
    // При прокрутке фото уезжает медленнее текста — глубина
    gsap.to('[data-media]', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } })
    gsap.to('[data-content]', { y: -60, opacity: 0.25, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } })
  })

  // Фото и розовое свечение чуть следуют за мышкой (только на компьютере)
  if (!window.matchMedia('(pointer: fine)').matches) return
  const parallax = el.querySelector('[data-parallax]')
  const glow = el.querySelector('[data-glow]')
  const px = gsap.quickTo(parallax, 'x', { duration: 1.2, ease: 'power3' })
  const py = gsap.quickTo(parallax, 'y', { duration: 1.2, ease: 'power3' })
  const gx = gsap.quickTo(glow, 'x', { duration: 1.8, ease: 'power3' })
  const gy = gsap.quickTo(glow, 'y', { duration: 1.8, ease: 'power3' })
  const onMove = (e: PointerEvent) => {
    const nx = e.clientX / window.innerWidth - 0.5
    const ny = e.clientY / window.innerHeight - 0.5
    px(nx * -18)
    py(ny * -12)
    gx(nx * 60)
    gy(ny * 40)
  }
  el.addEventListener('pointermove', onMove)
  ctx?.add(() => () => el.removeEventListener('pointermove', onMove))
}

onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) return
  // Сайт ожил поздно (медленный телефон): первый экран уже давно виден — не прячем его ради вступления
  const late = preloaderGoneByCss()
  // Заставка ещё не ушла — значит, первый экран откроет её шторка
  const withCurtain = !late && !preloaderDone.value
  if (!late && !withCurtain) armed.value = true
  restartTimer()
  if (root.value) {
    viewObserver = new IntersectionObserver(([entry]) => {
      inView = entry!.isIntersecting
    })
    viewObserver.observe(root.value)
  }

  const start = () => {
    if (withCurtain) softIntro()
    else if (!late) intro()
    setupMotion()
  }
  if (preloaderDone.value) start()
  else {
    const stop = watch(preloaderDone, (done) => {
      if (!done) return
      stop()
      start()
    })
  }
})

onBeforeUnmount(() => {
  clearInterval(timer)
  viewObserver?.disconnect()
  ctx?.revert()
})
</script>

<template>
  <section id="top" ref="root" v-pause-offscreen data-bg="#F9E4EB" class="hero relative flex min-h-[100svh] flex-col overflow-hidden lg:block" :class="{ 'hero--armed': armed }">
    <div data-glow class="pointer-events-none absolute -left-48 top-[38%] h-[36rem] w-[36rem] rounded-full bg-rose/55 blur-[110px]" aria-hidden="true" />
    <div class="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-lilac/70 blur-[90px]" aria-hidden="true" />

    <!-- Фото: на телефоне сверху, на компьютере справа во всю высоту -->
    <div data-media class="media relative h-[56svh] w-full shrink-0 lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[58%]">
      <div data-parallax class="absolute -inset-6">
        <div data-media-inner class="relative h-full w-full">
          <img
            v-for="(src, i) in slides"
            :key="src"
            :src="loaded.has(i) ? src : undefined"
            alt=""
            width="1600"
            height="1600"
            :fetchpriority="i === 0 ? 'high' : undefined"
            :loading="i === 0 ? 'eager' : 'lazy'"
            class="slide absolute inset-0 h-full w-full object-cover"
            :class="{ 'slide--active': current === i }"
          >
        </div>
      </div>

      <div class="media-fade pointer-events-none absolute inset-x-0 bottom-0 hidden h-1/4 lg:block" aria-hidden="true" />

      <span
        v-for="(sp, i) in sparkles"
        :key="i"
        class="sparkle-wrap pointer-events-none absolute"
        :style="{ left: `${sp.x}%`, top: `${sp.y}%` }"
        aria-hidden="true"
      >
        <svg class="sparkle" :width="sp.s" :height="sp.s" viewBox="0 0 24 24" :style="{ animationDelay: `${sp.d}s` }">
          <path d="M12 0c.6 6.6 5.4 11.4 12 12-6.6.6-11.4 5.4-12 12-.6-6.6-5.4-11.4-12-12C6.6 11.4 11.4 6.6 12 0z" fill="#fff" />
        </svg>
      </span>
    </div>

    <!-- Шапка на первом экране прозрачная: лёгкая белая дымка сверху сохраняет читаемость меню поверх фото -->
    <div class="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-white/60 via-white/20 to-transparent" aria-hidden="true" />

    <div data-content class="relative z-10 mx-auto -mt-24 w-full max-w-7xl px-4 pb-16 sm:px-6 lg:mt-0 lg:flex lg:min-h-[100svh] lg:items-center lg:px-10 lg:pb-0 lg:pt-[72px]">
      <div class="max-w-xl">
        <p data-fade class="eyebrow">
          <span class="h-px w-6 bg-current" aria-hidden="true" />
          {{ t('hero.eyebrow') }}
        </p>

        <h1 class="mt-5 text-[clamp(2.7rem,6.2vw,5.4rem)] font-semibold leading-[1] tracking-[-0.045em]">
          <span class="line"><span class="line-inner">{{ t('hero.line1') }}</span></span>
          <span class="line"><span class="line-inner">{{ t('hero.line2') }}</span></span>
          <span class="line line--accent"><span class="line-inner accent text-[1.15em]">{{ t('hero.line3') }}</span></span>
        </h1>

        <p data-fade class="mt-6 text-lg font-semibold tracking-tight">@ {{ salon.brand }} {{ salon.signature }}.</p>
        <p data-fade class="mt-2 max-w-md leading-relaxed text-ink-soft">{{ t('hero.subtitle') }}</p>

        <div data-fade class="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
          <a href="#booking" class="hero-btn group">
            {{ t('cta.bookOnline') }}
            <svg class="transition-transform duration-300 group-hover:translate-x-1" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10m-4-4 4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </a>
          <a href="#works" class="text-sm font-semibold text-ink underline decoration-rose decoration-2 underline-offset-[6px] transition hover:text-rose-deep">
            {{ t('hero.seeWorks') }}
          </a>
        </div>

        <!-- Переключатель фото с полоской, которая заполняется до смены -->
        <div data-fade class="mt-12 flex items-center gap-4">
          <span class="text-xs font-semibold tabular-nums text-ink/50">0{{ current + 1 }} / 0{{ slides.length }}</span>
          <div class="flex gap-1.5">
            <button
              v-for="(src, i) in slides"
              :key="src"
              type="button"
              class="flex h-11 items-center"
              :aria-label="t('hero.slide', { n: i + 1, total: slides.length })"
              :aria-current="current === i ? 'true' : undefined"
              @click="goTo(i)"
            >
              <span class="relative block h-[3px] w-10 overflow-hidden rounded-full bg-ink/15">
                <span v-if="current === i" :key="`bar-${current}`" class="progress absolute inset-y-0 left-0 rounded-full bg-rose-deep" :style="{ animationDuration: `${SLIDE_MS}ms` }" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Фото растворяется в розовом фоне: на телефоне книзу, на компьютере влево.
   Низ на компьютере растворяет отдельный градиент (.media-fade), а не вторая маска — так надёжнее во всех браузерах */
.media {
  overflow: hidden;
  -webkit-mask-image: linear-gradient(to bottom, #000 62%, transparent 100%);
  mask-image: linear-gradient(to bottom, #000 62%, transparent 100%);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

@media (min-width: 1024px) {
  .media {
    -webkit-mask-image: linear-gradient(to right, transparent 0%, rgb(0 0 0 / 0.55) 16%, #000 36%);
    mask-image: linear-gradient(to right, transparent 0%, rgb(0 0 0 / 0.55) 16%, #000 36%);
  }
}

.media-fade {
  background: linear-gradient(to top, var(--page-bg), transparent);
}

.slide {
  opacity: 0;
  transition: opacity 1.4s ease;
}

.slide--active {
  opacity: 1;
  animation: kenburns 7s ease-out forwards;
}

@keyframes kenburns {
  from {
    transform: scale(1.1) translate3d(1.5%, 1%, 0);
  }
  to {
    transform: scale(1) translate3d(0, 0, 0);
  }
}

.sparkle {
  display: block;
  filter: drop-shadow(0 0 6px rgb(255 255 255 / 0.9));
  animation: twinkle 3s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.25;
    transform: scale(0.45) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1) rotate(45deg);
  }
}

/* Строки заголовка выезжают снизу из-под «маски» */
.line {
  display: block;
  overflow: hidden;
  padding-bottom: 0.08em;
  margin-bottom: -0.08em;
}

.line--accent {
  padding-bottom: 0.16em;
  margin-bottom: -0.16em;
}

.line-inner {
  display: inline-block;
}

.hero-btn {
  display: inline-flex;
  min-height: 52px;
  align-items: center;
  gap: 0.6rem;
  border-radius: 6px;
  background: var(--color-rose);
  padding: 0 1.6rem;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-ink);
  box-shadow: 0 18px 40px -18px rgb(201 80 126 / 0.7);
  transition: background-color 0.3s, color 0.3s, transform 0.3s var(--ease-soft);
}

.hero-btn:hover {
  background: var(--color-plum);
  color: var(--color-milk);
  transform: translateY(-2px);
}

.progress {
  width: 0;
  animation: fill linear forwards;
}

@keyframes fill {
  to {
    width: 100%;
  }
}

/* До вступительной анимации: фото закрыто, строки опущены, остальное прозрачно */
.hero--armed [data-media] {
  clip-path: inset(0% 0% 0% 100%);
}

.hero--armed .line-inner {
  transform: translateY(115%);
}

.hero--armed [data-fade],
.hero--armed .sparkle-wrap {
  opacity: 0;
}
</style>
