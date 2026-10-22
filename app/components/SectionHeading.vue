<script setup lang="ts">
// Заголовок секции: маленькая подпись сверху + крупный заголовок, где одно слово — курсивом
defineProps<{
  eyebrow: string
  titleKey: string
  accentKey: string
  light?: boolean
}>()

const { t } = useI18n()
</script>

<template>
  <div>
    <p class="eyebrow" :class="{ '!text-rose': light }">
      <span class="h-px w-6 bg-current" aria-hidden="true" />
      {{ eyebrow }}
    </p>
    <i18n-t :keypath="titleKey" tag="h2" class="section-title mt-4" scope="global">
      <template #accent>
        <span class="accent text-[1.1em]" :class="{ '!text-rose': light }">{{ t(accentKey) }}</span>
      </template>
    </i18n-t>
  </div>
</template>
