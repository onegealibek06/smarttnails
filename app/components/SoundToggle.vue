<script setup lang="ts">
const { t } = useI18n()
const music = useAmbientMusic()
</script>

<template>
  <button
    type="button"
    class="flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-white/70 transition hover:bg-blush"
    :aria-label="music.playing.value ? t('header.soundOff') : t('header.soundOn')"
    :aria-pressed="music.playing.value"
    @click="music.toggle()"
  >
    <span class="bars" :class="{ 'bars--on': music.playing.value }" aria-hidden="true">
      <i /><i /><i /><i />
    </span>
  </button>
</template>

<style scoped>
.bars {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  height: 16px;
}

.bars i {
  width: 2.5px;
  height: 4px;
  border-radius: 2px;
  background: var(--color-ink);
  transition: height 0.3s;
}

.bars--on i {
  background: var(--color-rose-deep);
  animation: bar 0.9s ease-in-out infinite;
}

.bars--on i:nth-child(2) { animation-delay: 0.15s; }
.bars--on i:nth-child(3) { animation-delay: 0.3s; }
.bars--on i:nth-child(4) { animation-delay: 0.45s; }

@keyframes bar {
  0%, 100% { height: 4px; }
  50% { height: 16px; }
}
</style>
