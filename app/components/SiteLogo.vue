<script setup lang="ts">
import { salon, type LogoVariant } from '~/data/salon'

const props = withDefaults(defineProps<{
  tone?: 'dark' | 'light'
  variant?: LogoVariant
}>(), { tone: 'dark' })

const variant = computed(() => props.variant ?? salon.logo)
</script>

<template>
  <span class="logo" :class="`logo--${tone}`" role="img" aria-label="Smarttnails">
    <span v-if="variant === 'mix'" class="logo-row" aria-hidden="true">
      <NailShape class="logo-nail" />
      <span class="logo-word">smartt<span class="logo-italic">nails</span></span>
    </span>

    <span v-else-if="variant === 'dot'" class="logo-word" aria-hidden="true">smarttna<span class="logo-i">ı<NailShape class="logo-i-nail" /></span>ls</span>

    <span v-else-if="variant === 'tt'" class="logo-word" aria-hidden="true">smar<span class="logo-tt">tt</span>nails</span>

    <span v-else class="logo-row" aria-hidden="true">
      <span class="logo-badge">
        <NailShape />
        <span>S</span>
      </span>
      <span class="logo-spaced">smarttnails</span>
    </span>
  </span>
</template>

<style scoped>
.logo {
  display: inline-flex;
  align-items: center;
  line-height: 1;
  white-space: nowrap;
  color: var(--color-ink);
}

.logo--light {
  color: var(--color-milk);
}

.logo-row {
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
}

.logo-word {
  font-family: var(--font-sans);
  font-weight: 700;
  letter-spacing: -0.045em;
}

.logo-nail {
  width: 0.45em;
  height: 0.75em;
  color: var(--color-rose);
}

.logo-italic {
  font-family: var(--font-accent);
  font-style: italic;
  font-weight: 600;
  font-size: 1.18em;
  letter-spacing: 0;
  color: var(--color-rose-deep);
}

.logo--light .logo-italic,
.logo--light .logo-tt {
  color: var(--color-rose);
}

.logo-i {
  position: relative;
  display: inline-block;
}

.logo-i-nail {
  position: absolute;
  left: 50%;
  top: -0.27em;
  width: 0.3em;
  height: 0.45em;
  transform: translateX(-50%);
  color: var(--color-rose-deep);
}

.logo-tt {
  color: var(--color-rose-deep);
  letter-spacing: -0.11em;
  padding-right: 0.1em;
}

.logo-badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 0.95em;
  height: 1.5em;
  color: var(--color-ink);
}

.logo--light .logo-badge {
  color: var(--color-milk);
}

.logo-badge svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.logo-badge span {
  position: relative;
  margin-top: 0.15em;
  font-family: var(--font-accent);
  font-style: italic;
  font-weight: 600;
  font-size: 0.85em;
  color: var(--color-rose);
}

.logo-spaced {
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 0.7em;
  letter-spacing: 0.14em;
}
</style>
