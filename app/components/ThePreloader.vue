<script setup lang="ts">
// Лёгкая заставка ~1,5 с целиком на CSS: контур ноготка рисуется, заливается розовым с бликом,
// проявляется надпись, и всё плавно растворяется. Она не ждёт ни картинок, ни скриптов —
// поэтому не держит сайт даже на медленном телефоне. Скрипт только убирает её из страницы.
// Показывается один раз за визит: при повторном заходе её прячет скрипт в <head> до первой отрисовки.
const { t } = useI18n()
const done = useState('preloader:done', () => false)
const visible = ref(true)

const SESSION_KEY = 'smarttnails:entered'
const NAIL = 'M32 4c18 0 26 26 26 44v34c0 11.2-7.2 18-18 18H24c-10.8 0-18-6.8-18-18V48C6 30 14 4 32 4z'

useHead({
  script: [{
    key: 'preloader-seen',
    innerHTML: `try{if(sessionStorage.getItem('${SESSION_KEY}')==='1')document.documentElement.classList.add('pl-seen')}catch(e){}`,
  }],
  // Без JavaScript некому убрать заставку из страницы — просто не показываем её
  noscript: [{ innerHTML: '<style>.preloader{display:none!important}</style>' }],
})

function finish() {
  done.value = true
  visible.value = false
  document.documentElement.style.overflow = ''
}

onMounted(() => {
  let seen = false
  try {
    seen = sessionStorage.getItem(SESSION_KEY) === '1'
    sessionStorage.setItem(SESSION_KEY, '1')
  } catch {
    seen = false
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // Заставка растворяется сама за PRELOADER_MS от первой отрисовки; ждём конца и убираем её
  const left = (firstPaintAt() || performance.now()) + PRELOADER_MS - performance.now()
  if (seen || reduced || left <= 0) {
    finish()
    return
  }
  document.documentElement.style.overflow = 'hidden'
  setTimeout(finish, left)
})
</script>

<template>
  <div
    v-if="visible"
    class="preloader fixed inset-0 z-[100] flex items-center justify-center overflow-hidden px-6"
    aria-hidden="true"
  >
    <div class="relative flex flex-col items-center text-center">
      <div class="relative">
        <div class="pl-glow absolute left-1/2 top-1/2 -ml-24 -mt-24 h-48 w-48 rounded-full" />
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

      <p class="pl-word mt-6 text-[clamp(2.6rem,11vw,4.2rem)] leading-none">
        <span class="font-bold tracking-[-0.045em] text-ink">smartt</span><span class="accent text-[1.18em]">nails</span>
      </p>
      <p class="pl-tagline mt-4 text-xs font-semibold tracking-[0.32em] text-plum">{{ t('preloader.tagline') }}</p>
    </div>
  </div>
</template>

<style scoped>
/* Всё движение — только прозрачность и сдвиги: телефон делает их без перерисовки.
   Мягкие пятна — градиенты, а не размытие (blur), которое на телефоне тяжёлое.
   Растворение заканчивается к 1,5 с — это PRELOADER_MS в utils/preloader.ts */
.preloader {
  background:
    radial-gradient(circle at 12% 10%, rgb(238 155 184 / 0.45), transparent 40%),
    radial-gradient(circle at 88% 92%, var(--color-lilac), transparent 45%),
    var(--color-blush);
  animation: pl-out 0.4s 1.1s ease forwards;
}

/* Повторный заход в этом визите и «меньше движения» — без заставки */
:global(.pl-seen) .preloader {
  display: none;
}

@media (prefers-reduced-motion: reduce) {
  .preloader {
    display: none;
  }
}

@keyframes pl-out {
  to {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
  }
}

.pl-glow {
  background: radial-gradient(circle, var(--color-milk) 0%, transparent 65%);
  opacity: 0;
  animation: fade 0.8s ease-out forwards;
}

.pl-outline {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: draw 0.55s cubic-bezier(0.65, 0, 0.35, 1) forwards;
}

.pl-fill {
  opacity: 0;
  animation: fade 0.3s 0.35s ease-out forwards;
}

.pl-shine {
  animation: shine 0.55s 0.55s cubic-bezier(0.65, 0, 0.35, 1) forwards;
}

.pl-word {
  opacity: 0;
  animation: rise 0.5s 0.25s var(--ease-soft) forwards;
}

.pl-tagline {
  opacity: 0;
  animation: rise 0.45s 0.45s var(--ease-soft) forwards;
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
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>
