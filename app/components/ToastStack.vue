<script setup lang="ts">
const { t } = useI18n()
const { toasts, dismiss } = useToasts()
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-3 top-[calc(80px+env(safe-area-inset-top))] z-[80] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:items-end"
    aria-live="polite"
    role="status"
  >
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl bg-white py-3 pl-3 pr-2 shadow-[0_20px_50px_-20px_rgba(42,20,36,0.45)] ring-1 ring-ink/5"
      >
        <span
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          :class="toast.tone === 'success' ? 'bg-rose text-ink' : 'bg-lilac text-plum'"
          aria-hidden="true"
        >
          <svg v-if="toast.tone === 'success'" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" /></svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0" stroke-linecap="round" /></svg>
        </span>
        <p class="flex-1 text-sm font-medium leading-snug">{{ toast.text }}</p>
        <button type="button" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink/40 hover:bg-blush hover:text-ink" :aria-label="t('toast.close')" @click="dismiss(toast.id)">✕</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.35s var(--ease-soft), transform 0.35s var(--ease-soft);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.97);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(24px);
}
</style>
