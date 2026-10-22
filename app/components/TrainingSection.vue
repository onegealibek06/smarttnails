<script setup lang="ts">
import { salon } from '~/data/salon'

const { t } = useI18n()
</script>

<template>
  <section class="px-2 py-8 sm:px-4">
    <div v-reveal class="relative mx-auto max-w-7xl overflow-hidden rounded-[36px] bg-lilac px-6 py-14 sm:rounded-[48px] sm:px-12 sm:py-20 lg:px-16">
      <NailShape class="pointer-events-none absolute -bottom-24 -right-10 h-[26rem] w-64 rotate-12 text-white/60 sm:right-16" />
      <div class="relative max-w-xl">
        <SectionHeading :eyebrow="t('training.eyebrow')" title-key="training.title" accent-key="training.accent" />
        <p class="mt-5 text-lg leading-relaxed text-ink-soft">{{ t('training.text') }}</p>
        <a :href="whatsappLink(salon.whatsapp, t('training.whatsappText'))" target="_blank" rel="noopener" class="btn btn-primary mt-8">{{ t('training.cta') }}</a>
      </div>
    </div>
  </section>
</template>
