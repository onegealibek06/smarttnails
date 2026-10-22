<script setup lang="ts">
import { salon } from '~/data/salon'

const { t } = useI18n()

const form = reactive({ name: '', phone: '', message: '', website: '' })
const errors = reactive({ name: false, phone: false })
type Status = 'idle' | 'sending' | 'sent' | 'not-configured' | 'error'
const status = ref<Status>('idle')

const whatsappFallback = computed(() => whatsappLink(salon.whatsapp, t('footer.whatsappText', {
  name: form.name.trim(),
  message: form.message.trim(),
})))

function onPhoneInput(e: Event) {
  form.phone = formatKzPhone((e.target as HTMLInputElement).value)
  errors.phone = false
}

async function submit() {
  errors.name = form.name.trim().length < 2
  errors.phone = form.phone.replace(/\D/g, '').length !== 11
  if (errors.name || errors.phone) return

  status.value = 'sending'
  try {
    await $fetch('/api/contact', { method: 'POST', body: { ...form } })
    status.value = 'sent'
    form.message = ''
  } catch (e: unknown) {
    const code = (e as { statusCode?: number }).statusCode
    status.value = code === 503 ? 'not-configured' : 'error'
  }
}
</script>

<template>
  <form novalidate class="flex flex-col gap-3" @submit.prevent="submit">
    <!-- Ловушка для спам-ботов: человек это поле не видит -->
    <input v-model="form.website" type="text" name="website" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true">

    <div class="grid gap-3 sm:grid-cols-2">
      <label class="block">
        <span class="field-label">{{ t('footer.name') }}</span>
        <input
          v-model="form.name"
          type="text"
          autocomplete="given-name"
          :placeholder="t('footer.namePlaceholder')"
          class="field"
          :aria-invalid="errors.name"
          @input="errors.name = false"
        >
        <span v-if="errors.name" class="mt-1 block text-xs text-rose-deep" role="alert">{{ t('footer.errors.name') }}</span>
      </label>
      <label class="block">
        <span class="field-label">{{ t('footer.phone') }}</span>
        <input
          :value="form.phone"
          type="tel"
          inputmode="tel"
          autocomplete="tel"
          :placeholder="t('footer.phonePlaceholder')"
          class="field tabular-nums"
          :aria-invalid="errors.phone"
          @input="onPhoneInput"
        >
        <span v-if="errors.phone" class="mt-1 block text-xs text-rose-deep" role="alert">{{ t('footer.errors.phone') }}</span>
      </label>
    </div>
    <label class="block">
      <span class="field-label">{{ t('footer.message') }}</span>
      <textarea v-model="form.message" rows="2" maxlength="1000" :placeholder="t('footer.messagePlaceholder')" class="field resize-none py-3" />
    </label>

    <button type="submit" class="btn btn-primary mt-1 self-start" :disabled="status === 'sending'">
      {{ status === 'sending' ? t('footer.sending') : t('footer.send') }}
      <svg v-if="status !== 'sending'" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10m-4-4 4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </button>

    <div aria-live="polite">
      <p v-if="status === 'sent'" class="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-plum">{{ t('footer.sent') }}</p>
      <div v-else-if="status === 'not-configured' || status === 'error'" class="rounded-2xl bg-white px-4 py-3 text-sm">
        <p>{{ status === 'error' ? t('footer.error') : t('footer.notConfigured') }}</p>
        <a :href="whatsappFallback" target="_blank" rel="noopener" class="mt-2 inline-flex font-semibold text-rose-deep underline-offset-4 hover:underline">{{ t('footer.openWhatsapp') }} ↗</a>
      </div>
    </div>

    <p class="text-xs leading-relaxed text-ink-soft">{{ t('footer.consent') }}</p>
  </form>
</template>

<style scoped>
.field-label {
  display: inline-block;
  border-radius: 6px;
  background: var(--color-rose);
  padding: 1px 8px;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-ink);
}

.field {
  margin-top: 0.4rem;
  display: block;
  width: 100%;
  min-height: 48px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--color-ink) 10%, transparent);
  background: white;
  padding: 0 1rem;
  font-size: 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.field:focus {
  outline: none;
  border-color: var(--color-plum);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-rose) 35%, transparent);
}

.field[aria-invalid="true"] {
  border-color: var(--color-rose-deep);
}
</style>
