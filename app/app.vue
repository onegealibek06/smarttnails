<script setup lang="ts">
const { t } = useI18n()
const head = useLocaleHead()
const { siteUrl } = useRuntimeConfig().public

useHead(() => ({
  htmlAttrs: { lang: head.value.htmlAttrs?.lang },
  link: [...(head.value.link ?? [])],
  meta: [...(head.value.meta ?? [])],
}))

useSeoMeta({
  title: () => t('seo.title'),
  description: () => t('seo.description'),
  ogTitle: () => t('seo.title'),
  ogDescription: () => t('seo.description'),
  ogType: 'website',
  ogSiteName: 'Smarttnails',
  // Картинка-превью, когда ссылку на сайт отправляют в WhatsApp, Telegram или Instagram
  ogImage: `${siteUrl}/og-image.jpg`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: () => t('seo.title'),
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <NuxtPage />
</template>
