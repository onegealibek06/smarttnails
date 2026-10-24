<script setup lang="ts">
import { faqKeys } from '~/data/salon'

const { t } = useI18n()
</script>

<template>
  <section id="faq" data-bg="#FFF7F5" class="section">
    <div class="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-10">
      <SectionHeading v-reveal :eyebrow="t('faq.eyebrow')" title-key="faq.title" accent-key="faq.accent" />

      <div class="divide-y divide-ink/10 border-y border-ink/10">
        <details v-for="key in faqKeys" :key="key" v-reveal class="group py-2">
          <summary class="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-3 text-lg font-semibold tracking-tight">
            {{ t(`faq.items.${key}.q`) }}
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blush text-plum transition duration-300 group-open:rotate-45 group-open:bg-ink group-open:text-milk" aria-hidden="true">+</span>
          </summary>
          <p class="max-w-2xl pb-5 pr-12 leading-relaxed text-ink-soft">{{ t(`faq.items.${key}.a`) }}</p>
        </details>
      </div>
    </div>
  </section>
</template>

<style scoped>
summary::-webkit-details-marker {
  display: none;
}
</style>
