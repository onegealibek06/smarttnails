<script setup lang="ts">
const { t, locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
</script>

<template>
  <nav :aria-label="t('header.language')" class="flex items-center rounded-full border border-ink/10 bg-white/70 p-1">
    <NuxtLink
      v-for="item in locales"
      :key="item.code"
      :to="switchLocalePath(item.code)"
      :hreflang="item.language"
      :aria-current="item.code === locale ? 'true' : undefined"
      class="flex h-9 min-w-10 items-center justify-center rounded-full px-2.5 text-xs font-semibold tracking-wide transition"
      :class="item.code === locale ? 'bg-ink text-milk' : 'text-ink/70 hover:text-ink'"
    >
      {{ item.name }}
    </NuxtLink>
  </nav>
</template>
