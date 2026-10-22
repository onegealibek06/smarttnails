<script setup lang="ts">
import { reviewInitials, type Review } from '~/data/reviews'

const props = defineProps<{
  review: Review
  index: number
}>()

const { t } = useI18n()
const { lang } = useLang()

const AVATAR_COLORS = [
  { bg: '#F3CFDC', fg: '#7B2D63' },
  { bg: '#ECE3F7', fg: '#7B2D63' },
  { bg: '#E9D2B0', fg: '#5A3A2A' },
  { bg: '#2A1424', fg: '#FFF7F5' },
  { bg: '#EE9BB8', fg: '#2A1424' },
]

const avatar = computed(() => AVATAR_COLORS[props.index % AVATAR_COLORS.length]!)
const initials = computed(() => reviewInitials(props.review.author))

const dateLabel = computed(() => props.review.datePrecision === 'day'
  ? formatDay(props.review.date, lang.value, { day: 'numeric', month: 'long', year: 'numeric' })
  : formatDay(props.review.date, lang.value, { month: 'long', year: 'numeric' }))

const long = computed(() => props.review.text.length > 240)
const expanded = ref(false)
</script>

<template>
  <article class="review-card flex min-h-[320px] flex-col rounded-[28px] border border-ink/6 bg-white p-6 transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_-30px_rgba(123,45,99,0.45)] sm:p-7">
    <header class="flex items-center gap-3">
      <span
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
        :style="{ background: avatar.bg, color: avatar.fg }"
        aria-hidden="true"
      >{{ initials }}</span>
      <div class="min-w-0 flex-1">
        <p class="truncate font-semibold">{{ review.author }}</p>
        <div class="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <time :datetime="review.date" class="text-xs text-ink-soft first-letter:uppercase">{{ dateLabel }}</time>
          <span v-if="review.rating" class="flex gap-0.5 text-rose-deep" role="img" :aria-label="t('reviews.stars', { n: review.rating })">
            <svg v-for="i in 5" :key="i" class="star" :style="{ '--d': `${i * 90}ms` }" width="13" height="13" viewBox="0 0 20 20" aria-hidden="true">
              <path :fill="i <= review.rating ? 'currentColor' : '#F3CFDC'" d="m10 1.8 2.5 5.3 5.8.7-4.3 4 1.1 5.7L10 14.7l-5.1 2.8L6 11.8l-4.3-4 5.8-.7z" />
            </svg>
          </span>
        </div>
      </div>
      <svg v-if="review.source === 'instagram'" class="shrink-0 text-plum" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </svg>
    </header>

    <p lang="ru" class="mt-5 text-[1.05rem] leading-relaxed" :class="{ 'line-clamp-6': long && !expanded }">
      {{ review.text }}
    </p>
    <button
      v-if="long"
      type="button"
      class="mt-2 self-start py-1 text-sm font-semibold text-rose-deep underline-offset-4 hover:underline"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      {{ expanded ? t('reviews.readLess') : t('reviews.readMore') }}
    </button>

    <footer class="mt-auto flex flex-wrap gap-2 pt-6">
      <span class="rounded-full bg-lilac px-3 py-1 text-xs font-medium text-plum">
        {{ review.source === '2gis' ? '2GIS' : 'Instagram' }}
      </span>
      <span v-if="review.source === 'instagram'" class="rounded-full bg-lilac px-3 py-1 text-xs font-medium text-plum">{{ t('reviews.comment') }}</span>
      <span v-if="lang !== 'ru'" class="rounded-full bg-blush px-3 py-1 text-xs font-medium text-ink-soft">{{ t('reviews.original') }}</span>
    </footer>
  </article>
</template>
