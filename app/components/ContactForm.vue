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

// Ошибка пропадает, как только начали исправлять поле
watch(() => form.name, () => { errors.name = false })
watch(() => form.phone, () => { errors.phone = false })

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
      <FloatField
        v-model="form.name"
        :label="t('footer.name')"
        :placeholder="t('footer.namePlaceholder')"
        autocomplete="given-name"
        :error="errors.name ? t('footer.errors.name') : undefined"
      />
      <FloatField
        v-model="form.phone"
        type="tel"
        inputmode="tel"
        autocomplete="tel"
        :label="t('footer.phone')"
        :placeholder="t('footer.phonePlaceholder')"
        :format="formatKzPhone"
        :error="errors.phone ? t('footer.errors.phone') : undefined"
      />
    </div>
    <FloatField
      v-model="form.message"
      textarea
      :rows="2"
      :maxlength="1000"
      :label="t('footer.message')"
      :placeholder="t('footer.messagePlaceholder')"
    />

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
