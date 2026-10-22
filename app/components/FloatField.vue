<script setup lang="ts">
// Поле с «всплывающей» подписью: пока поле пустое, подпись стоит внутри,
// при фокусе или вводе мягко поднимается наверх. Без рамок — мягкая подложка и свечение.
const props = withDefaults(defineProps<{
  label: string
  modelValue: string
  type?: string
  textarea?: boolean
  rows?: number
  placeholder?: string
  autocomplete?: string
  inputmode?: 'text' | 'tel' | 'email' | 'numeric'
  maxlength?: number
  error?: string
  // Например, маска телефона: получает то, что ввели, и возвращает отформатированное
  format?: (value: string) => string
}>(), { type: 'text', rows: 3, placeholder: ' ' })

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const id = useId()

function onInput(e: Event) {
  const target = e.target as HTMLInputElement | HTMLTextAreaElement
  const value = props.format ? props.format(target.value) : target.value
  // Маска могла изменить текст — возвращаем его в поле сразу, чтобы курсор не прыгал по старому значению
  if (value !== target.value) target.value = value
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="ff" :class="{ 'ff--error': error, 'ff--area': textarea }">
    <textarea
      v-if="textarea"
      :id="id"
      :value="modelValue"
      :rows="rows"
      :maxlength="maxlength"
      :placeholder="placeholder"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${id}-error` : undefined"
      class="ff-input resize-none"
      @input="onInput"
    />
    <input
      v-else
      :id="id"
      :value="modelValue"
      :type="type"
      :inputmode="inputmode"
      :autocomplete="autocomplete"
      :maxlength="maxlength"
      :placeholder="placeholder"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${id}-error` : undefined"
      class="ff-input"
      @input="onInput"
    >
    <label :for="id" class="ff-label">{{ label }}</label>
    <Transition name="ff-msg">
      <p v-if="error" :id="`${id}-error`" class="ff-error" role="alert">{{ error }}</p>
    </Transition>
  </div>
</template>

<style scoped>
.ff {
  position: relative;
}

.ff-input {
  display: block;
  width: 100%;
  min-height: 60px;
  border: 0;
  border-radius: 20px;
  background: rgb(255 255 255 / 0.72);
  padding: 1.6rem 1.15rem 0.6rem;
  font-size: 16px;
  line-height: 1.4;
  color: var(--color-ink);
  box-shadow:
    inset 0 0 0 1px rgb(42 20 36 / 0.05),
    0 12px 30px -24px rgb(123 45 99 / 0.45);
  transition: background-color 0.3s, box-shadow 0.35s var(--ease-soft);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

.ff--area .ff-input {
  padding-top: 1.75rem;
}

.ff-input:hover {
  background: rgb(255 255 255 / 0.9);
}

.ff-input:focus {
  outline: none;
  background: white;
  box-shadow:
    inset 0 0 0 1.5px var(--color-rose),
    0 0 0 6px rgb(238 155 184 / 0.22),
    0 16px 36px -22px rgb(123 45 99 / 0.5);
}

/* Подсказка-пример видна только в фокусе, когда подпись уже поднялась */
.ff-input::placeholder {
  color: transparent;
  transition: color 0.25s;
}

.ff-input:focus::placeholder {
  color: rgb(42 20 36 / 0.32);
}

.ff-label {
  position: absolute;
  left: 1.15rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
  color: var(--color-ink-soft);
  pointer-events: none;
  transform-origin: left top;
  transition: top 0.3s var(--ease-soft), transform 0.3s var(--ease-soft), font-size 0.3s var(--ease-soft), color 0.3s;
}

.ff--area .ff-label {
  top: 1.1rem;
  transform: none;
}

.ff-input:focus + .ff-label,
.ff-input:not(:placeholder-shown) + .ff-label {
  top: 0.6rem;
  transform: none;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--color-plum);
}

.ff--error .ff-input {
  box-shadow:
    inset 0 0 0 1.5px var(--color-rose-deep),
    0 12px 30px -24px rgb(123 45 99 / 0.45);
}

.ff-error {
  margin-top: 0.4rem;
  padding-left: 1.15rem;
  font-size: 0.8rem;
  color: var(--color-rose-deep);
}

.ff-msg-enter-active,
.ff-msg-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}

.ff-msg-enter-from,
.ff-msg-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
