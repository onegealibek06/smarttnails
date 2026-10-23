<script setup lang="ts">
import { whyKeys } from '~/data/salon'

const { t } = useI18n()

const icons: Record<(typeof whyKeys)[number], string> = {
  // медаль, щит с галочкой, молния, бриллиант
  experience: 'M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zm-3.2-.9L7.5 21l4.5-2.5 4.5 2.5-1.3-6.9M12 6.5l1 2.1 2.3.3-1.7 1.6.4 2.3-2-1.1-2 1.1.4-2.3-1.7-1.6 2.3-.3z',
  sterile: 'M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6l-7-3zm-3 9 2 2 4-4',
  speed: 'M13 2 4 14h7l-1 8 9-12h-7l1-8z',
  premium: 'M6 3h12l3 6-9 12L3 9l3-6zM3 9h18M9 9l3 12 3-12M9 9l3-6 3 6',
}
</script>

<template>
  <section data-bg="#FFF7F5" class="py-20 sm:py-28">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
      <SectionHeading v-reveal :eyebrow="t('why.eyebrow')" title-key="why.title" accent-key="why.accent" />

      <ul class="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <li
          v-for="(key, i) in whyKeys"
          :key="key"
          v-reveal="i * 0.08"
          class="card group relative overflow-hidden p-6 transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_-30px_rgba(123,45,99,0.45)]"
        >
          <span class="absolute right-5 top-5 text-xs font-semibold text-ink/25">0{{ i + 1 }}</span>
          <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blush text-plum transition group-hover:bg-rose">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path :d="icons[key]" />
            </svg>
          </span>
          <h3 class="mt-6 text-xl font-semibold tracking-tight">{{ t(`why.items.${key}.title`) }}</h3>
          <p class="mt-2 leading-relaxed text-ink-soft">{{ t(`why.items.${key}.text`) }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>
