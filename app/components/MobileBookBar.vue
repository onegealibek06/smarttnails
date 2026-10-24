<script setup lang="ts">
import { salon } from '~/data/salon'

// Нижняя панель на телефоне: появляется после первого экрана и прячется у формы записи
const { t } = useI18n()
const { lang } = useLang()
// Когда в прайсе выбраны услуги, кнопка сразу ведёт в WhatsApp и показывает сумму
const { selected, totalPrice, whatsappHref } = useBooking()
const visible = ref(false)
let bookingInView = false
let observer: IntersectionObserver | undefined

function update() {
  visible.value = window.scrollY > window.innerHeight * 0.7 && !bookingInView
}

onMounted(() => {
  const booking = document.getElementById('booking')
  if (booking) {
    observer = new IntersectionObserver(([entry]) => {
      bookingInView = entry!.isIntersecting
      update()
    }, { threshold: 0.15 })
    observer.observe(booking)
  }
  window.addEventListener('scroll', update, { passive: true })
  update()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('scroll', update)
})
</script>

<template>
  <Transition name="bar">
    <div
      v-if="visible"
      class="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 flex gap-2 rounded-full bg-ink/95 p-1.5 shadow-[0_20px_50px_-15px_rgba(42,20,36,0.6)] backdrop-blur lg:hidden"
    >
      <a
        :href="whatsappLink(salon.whatsapp, t('booking.messageSite'))"
        target="_blank"
        rel="noopener"
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-milk/10 text-milk"
        :aria-label="t('cta.whatsapp')"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.6 2.5 4 3.5 1.5.6 2 .7 2.8.6.4-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.5-.3z" /></svg>
      </a>
      <a
        v-if="selected.length"
        :href="whatsappHref"
        target="_blank"
        rel="noopener"
        class="btn btn-rose flex-1 !min-h-12 !justify-between !pl-5 !pr-2"
      >
        <span>{{ t('booking.total') }} · {{ t('services.price', { price: formatPrice(totalPrice, lang) }) }}</span>
        <span class="flex h-9 items-center rounded-full bg-ink px-3.5 text-xs font-semibold text-milk">WhatsApp</span>
      </a>
      <a v-else href="#booking" class="btn btn-rose flex-1 !min-h-12">{{ t('cta.bookOnline') }}</a>
    </div>
  </Transition>
</template>

<style scoped>
.bar-enter-active,
.bar-leave-active {
  transition: opacity 0.35s var(--ease-soft), transform 0.35s var(--ease-soft);
}

.bar-enter-from,
.bar-leave-to {
  opacity: 0;
  transform: translateY(24px);
}
</style>
