<script setup lang="ts">
import { salon } from '~/data/salon'

// Плавающая кнопка WhatsApp справа внизу, как на референсе. На телефоне её роль играет нижняя панель.
const { t } = useI18n()
const preloaderDone = useState('preloader:done', () => false)
</script>

<template>
  <Transition name="float">
    <a
      v-if="preloaderDone"
      :href="whatsappLink(salon.whatsapp, t('booking.messageSite'))"
      target="_blank"
      rel="noopener"
      class="wa fixed bottom-6 right-6 z-40 hidden items-center gap-2.5 rounded-xl bg-[#25D366] py-3 pl-3.5 pr-5 text-sm font-semibold text-white shadow-[0_18px_40px_-14px_rgba(37,211,102,0.75)] transition hover:-translate-y-1 hover:bg-[#1EBE5B] lg:flex"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.6 2.5 4 3.5 1.5.6 2 .7 2.8.6.4-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.5-.3z" /></svg>
      {{ t('cta.whatsappFloat') }}
      <span class="pulse absolute -right-1 -top-1 h-3 w-3 rounded-full bg-white" aria-hidden="true" />
    </a>
  </Transition>
</template>

<style scoped>
.pulse::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: white;
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2.4);
    opacity: 0;
  }
}

.float-enter-active {
  transition: opacity 0.6s 1.6s var(--ease-soft), transform 0.6s 1.6s var(--ease-soft);
}

.float-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
</style>
