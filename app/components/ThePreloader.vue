<script setup lang="ts">
import { gsap } from 'gsap'

// Заставка ~2 секунды: контур ноготка рисуется, заливается розовым с бликом,
// проявляются буквы, и розовая «шторка» уезжает вверх, открывая сайт.
// Появление сделано на CSS — оно стартует сразу, ещё до загрузки скриптов.
// GSAP отвечает только за уход шторки. Показывается один раз за визит.
const { t } = useI18n()
const done = useState('preloader:done', () => false)
const visible = ref(true)
const root = ref<HTMLElement>()

const SESSION_KEY = 'smarttnails:entered'
const INTRO_MS = 1550
const NAIL = 'M32 4c18 0 26 26 26 44v34c0 11.2-7.2 18-18 18H24c-10.8 0-18-6.8-18-18V48C6 30 14 4 32 4z'

const word = 'smartt'.split('')
const accent = 'nails'.split('')

// Без JavaScript шторку некому убрать — тогда просто прячем заставку
useHead({ noscript: [{ innerHTML: '<style>.preloader{display:none!important}</style>' }] })

function finish() {
  done.value = true
  visible.value = false
  document.documentElement.style.overflow = ''
}

onMounted(() => {
  let entered = false
  try {
    entered = sessionStorage.getItem(SESSION_KEY) === '1'
    sessionStorage.setItem(SESSION_KEY, '1')
  } catch {
    entered = false
  }
  // Скрипты загрузились позже запасной CSS-шторки (медленный телефон): она уже уехала сама
  if (entered || !root.value || preloaderGoneByCss()) {
    finish()
    return
  }

  document.documentElement.style.overflow = 'hidden'
  const el = root.value
  el.style.animation = 'none' // дальше шторку уводит GSAP

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setTimeout(finish, 600)
    return
  }

  // Логотип рисуется с первой отрисовки страницы, а не с начала загрузки: даём ему собраться целиком.
  // Если скрипты пришли позже, логотип уже готов — шторка уходит сразу
  const painted = firstPaintAt() || performance.now()
  const wait = Math.max(0, painted + INTRO_MS - performance.now()) / 1000
  gsap.timeline({ delay: wait })
    .add(() => {
      done.value = true
    })
    .to(el.querySelector('.pl-inner'), { y: -24, opacity: 0, duration: 0.4, ease: 'power2.in' })
    .to(el, {
      yPercent: -100,
      borderBottomLeftRadius: '50% 140px',
      borderBottomRightRadius: '50% 140px',
      duration: 0.75,
      ease: 'power3.inOut',
    }, 0.1)
    .add(finish)
})
</script>

<template>
  <div
    v-if="visible"
    ref="root"
    class="preloader fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-blush px-6"
    aria-hidden="true"
  >
    <div class="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-rose/40 blur-3xl" />
    <div class="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-lilac blur-3xl" />

    <div class="pl-inner relative flex flex-col items-center text-center">
      <div class="relative">
        <div class="pl-glow absolute left-1/2 top-1/2 -ml-20 -mt-20 h-40 w-40 rounded-full bg-milk blur-2xl" />
        <svg class="relative h-[92px] w-[58px]" viewBox="0 0 64 104" aria-hidden="true">
          <defs>
            <linearGradient id="pl-grad" x1="0" y1="0" x2="0.4" y2="1">
              <stop offset="0" stop-color="#F7C2D4" />
              <stop offset="1" stop-color="#C9507E" />
            </linearGradient>
            <clipPath id="pl-clip"><path :d="NAIL" /></clipPath>
          </defs>
          <path class="pl-fill" :d="NAIL" fill="url(#pl-grad)" />
          <g clip-path="url(#pl-clip)">
            <g transform="rotate(20 32 52)">
              <rect class="pl-shine" x="-24" y="-20" width="12" height="150" fill="#fff" opacity="0.55" />
            </g>
          </g>
          <path class="pl-outline" :d="NAIL" fill="none" stroke="#7B2D63" stroke-width="1.6" pathLength="1" />
        </svg>
      </div>

      <p class="mt-6 text-[clamp(2.6rem,11vw,4.2rem)] leading-none">
        <span class="font-bold tracking-[-0.045em] text-ink">
          <span v-for="(ch, i) in word" :key="`w${i}`" class="pl-letter" :style="{ '--i': i }">{{ ch }}</span>
        </span>
        <span class="accent text-[1.18em]">
          <span v-for="(ch, i) in accent" :key="`a${i}`" class="pl-letter" :style="{ '--i': i + word.length }">{{ ch }}</span>
        </span>
      </p>
      <p class="pl-tagline mt-4 text-xs font-semibold tracking-[0.32em] text-plum">{{ t('preloader.tagline') }}</p>
    </div>
  </div>
</template>

<style scoped>
/* Запасной уход шторки на чистом CSS: если на медленном телефоне скрипты грузятся долго,
   заставка всё равно уезжает через ~3,4 с и не держит сайт «зависшим».
   Задержка должна совпадать с PRELOADER_FALLBACK_MS в utils/preloader.ts */
.preloader {
  animation: pl-fallback 0.75s 3.4s cubic-bezier(0.65, 0, 0.35, 1) forwards;
}

@keyframes pl-fallback {
  to {
    transform: translateY(-100%);
    visibility: hidden;
  }
}

.pl-glow {
  opacity: 0;
  animation: glow 1.2s ease-out forwards;
}

.pl-outline {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: draw 0.7s cubic-bezier(0.65, 0, 0.35, 1) forwards;
}

.pl-fill {
  opacity: 0;
  animation: fade 0.4s 0.5s ease-out forwards;
}

.pl-shine {
  animation: shine 0.7s 0.7s cubic-bezier(0.65, 0, 0.35, 1) forwards;
}

.pl-letter {
  display: inline-block;
  opacity: 0;
  animation: rise 0.55s calc(0.25s + var(--i) * 35ms) var(--ease-soft) forwards;
}

.pl-tagline {
  opacity: 0;
  animation: rise 0.5s 0.7s var(--ease-soft) forwards;
}

@keyframes glow {
  from {
    opacity: 0;
    transform: scale(0.6);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes fade {
  to {
    opacity: 1;
  }
}

@keyframes shine {
  to {
    transform: translateX(98px);
  }
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(0.35em);
    filter: blur(6px);
  }
  to {
    opacity: 1;
    transform: none;
    filter: blur(0);
  }
}
</style>
