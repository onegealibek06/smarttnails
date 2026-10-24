<script setup lang="ts">
import { gsap } from 'gsap'
import { salon, services } from '~/data/salon'

// Запись — через WhatsApp сестры: справа iPhone с «живой» перепиской, внизу экрана —
// кнопки-услуги, которые открывают WhatsApp с готовым сообщением.
const { t } = useI18n()

const wa = (text: string) => whatsappLink(salon.whatsapp, text)
const serviceLink = (id: string) => wa(t('booking.messageService', { service: t(`services.items.${id}.name`).toLowerCase() }))

interface ChatLine { id: number, side: 'in' | 'out', key: string, time: string }
interface ScriptLine { side: 'in' | 'out', key: string, time: string, typing?: number, pause: number }

// Сценарий переписки: typing — сколько мс Ардак «печатает» перед сообщением, pause — пауза после
const SCRIPT: ScriptLine[] = [
  { side: 'in', key: 'm1', time: '10:21', pause: 700 },
  { side: 'in', key: 'm2', time: '10:21', pause: 1200 },
  { side: 'out', key: 'm3', time: '10:23', pause: 1500 },
  { side: 'in', key: 'm4', time: '10:24', typing: 1600, pause: 1000 },
  { side: 'out', key: 'm5', time: '10:24', pause: 1300 },
  { side: 'in', key: 'm6', time: '10:25', typing: 1300, pause: 800 },
]

// На сервере (и без JavaScript) переписка видна целиком
const lines = ref<ChatLine[]>(SCRIPT.map((s, i) => ({ id: i, side: s.side, key: s.key, time: s.time })))
const typing = ref(false)

const root = ref<HTMLElement>()
const phone = ref<HTMLElement>()
let alive = true
let observer: IntersectionObserver | undefined
let ctx: gsap.Context | undefined

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function play() {
  let id = 100
  while (alive) {
    lines.value = []
    await sleep(600)
    for (const step of SCRIPT) {
      if (!alive) return
      if (step.typing) {
        typing.value = true
        await sleep(step.typing)
        typing.value = false
      }
      lines.value = [...lines.value, { id: id++, side: step.side, key: step.key, time: step.time }]
      await sleep(step.pause)
    }
    await sleep(5000)
  }
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !phone.value) return

  // Переписка запускается, когда телефон показался на экране
  observer = new IntersectionObserver(([entry]) => {
    if (!entry!.isIntersecting) return
    observer?.disconnect()
    play()
  }, { threshold: 0.3 })
  observer.observe(phone.value)

  // Телефон чуть поворачивается за мышкой (только на компьютере)
  if (!window.matchMedia('(pointer: fine)').matches || !root.value) return
  ctx = gsap.context(() => {
    const rx = gsap.quickTo(phone.value!, 'rotationX', { duration: 0.9, ease: 'power3' })
    const ry = gsap.quickTo(phone.value!, 'rotationY', { duration: 0.9, ease: 'power3' })
    const onMove = (e: PointerEvent) => {
      const rect = root.value!.getBoundingClientRect()
      ry(((e.clientX - rect.left) / rect.width - 0.5) * 12)
      rx(((e.clientY - rect.top) / rect.height - 0.5) * -8)
    }
    const onLeave = () => {
      rx(0)
      ry(0)
    }
    root.value!.addEventListener('pointermove', onMove)
    root.value!.addEventListener('pointerleave', onLeave)
    return () => {
      root.value?.removeEventListener('pointermove', onMove)
      root.value?.removeEventListener('pointerleave', onLeave)
    }
  })
})

onBeforeUnmount(() => {
  alive = false
  observer?.disconnect()
  ctx?.revert()
})
</script>

<template>
  <section id="booking" ref="root" data-bg="#F2EBF8" class="section relative overflow-x-clip">
    <div class="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] items-center gap-10 px-4 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] md:gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:px-10">
      <div>
        <SectionHeading v-reveal :eyebrow="t('booking.eyebrow')" title-key="booking.title" accent-key="booking.accent" />
        <p v-reveal class="mt-5 max-w-md text-lg leading-relaxed text-ink-soft">
          {{ t('booking.subtitle') }}
          <a :href="wa(t('booking.messageFree'))" target="_blank" rel="noopener" class="group whitespace-nowrap font-semibold text-rose-deep underline decoration-rose/50 decoration-2 underline-offset-4 transition hover:decoration-rose-deep">
            {{ t('booking.grab') }}<span class="ml-1 inline-block transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
          </a>
        </p>

        <ol class="mt-7 max-w-md space-y-2 sm:mt-8 sm:space-y-3">
          <li
            v-for="(step, i) in ['s1', 's2', 's3']"
            :key="step"
            v-reveal="i * 0.08"
            class="flex items-center gap-3 rounded-3xl bg-white/60 p-3 backdrop-blur sm:gap-4 sm:p-4"
          >
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-milk sm:h-10 sm:w-10">{{ i + 1 }}</span>
            <span class="text-[15px] font-medium leading-snug sm:text-base">{{ t(`booking.steps.${step}`) }}</span>
          </li>
        </ol>

        <div v-reveal class="mt-7 grid gap-2.5 sm:mt-8 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
          <a :href="wa(t('booking.messageGeneric'))" target="_blank" rel="noopener" class="wa-btn group justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.6 2.5 4 3.5 1.5.6 2 .7 2.8.6.4-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.5-.3z" /></svg>
            {{ t('booking.cta') }}
          </a>
          <a :href="`tel:${salon.phone}`" class="btn btn-ghost bg-white/50">{{ t('booking.call') }}</a>
        </div>
        <p v-reveal class="mt-5 flex items-center gap-2 text-sm text-ink-soft">
          <span class="h-2 w-2 shrink-0 rounded-full bg-[#25D366]" aria-hidden="true" />
          {{ t('booking.hours') }}
        </p>
      </div>

      <!-- iPhone с перепиской -->
      <div class="relative mx-auto w-full max-w-[330px]" style="perspective: 1200px">
        <div class="pointer-events-none absolute -inset-10 rounded-full bg-[#25D366]/15 blur-3xl" aria-hidden="true" />
        <div class="pointer-events-none absolute -bottom-6 -left-10 h-56 w-56 rounded-full bg-rose/40 blur-3xl" aria-hidden="true" />

        <div class="phone-float relative">
          <figure ref="phone" class="phone relative mx-auto" :aria-label="t('booking.phoneLabel')">
            <div class="screen">
              <!-- Строка состояния -->
              <div class="flex h-11 shrink-0 items-end justify-between px-7 pb-1 text-[13px] font-semibold" aria-hidden="true">
                <span>9:41</span>
                <span class="flex items-center gap-1">
                  <svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="7" width="3" height="4" rx="1" fill="currentColor" /><rect x="4.5" y="5" width="3" height="6" rx="1" fill="currentColor" /><rect x="9" y="2.5" width="3" height="8.5" rx="1" fill="currentColor" /><rect x="13.5" y="0" width="3" height="11" rx="1" fill="currentColor" /></svg>
                  <svg width="15" height="11" viewBox="0 0 15 11"><path d="M7.5 2.2c2 0 3.9.8 5.3 2.1l1-1A8.9 8.9 0 0 0 7.5.8 8.9 8.9 0 0 0 1.2 3.3l1 1a7.5 7.5 0 0 1 5.3-2.1zm0 3c1.2 0 2.3.4 3.2 1.2l1-1A6 6 0 0 0 7.5 3.8a6 6 0 0 0-4.2 1.6l1 1a4.5 4.5 0 0 1 3.2-1.2zm0 3a1.5 1.5 0 0 0-1.1.4l1.1 1.2 1.1-1.2a1.5 1.5 0 0 0-1.1-.4z" fill="currentColor" /></svg>
                  <svg width="25" height="12" viewBox="0 0 25 12"><rect x=".5" y=".5" width="21" height="11" rx="3.5" fill="none" stroke="currentColor" opacity=".4" /><rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor" /><rect x="22.5" y="4" width="1.5" height="4" rx=".7" fill="currentColor" opacity=".5" /></svg>
                </span>
              </div>

              <!-- Шапка чата -->
              <div class="flex shrink-0 items-center gap-2.5 border-b border-black/5 bg-white/95 px-3 py-2">
                <svg width="10" height="17" viewBox="0 0 10 17" class="text-[#128C7E]" aria-hidden="true"><path d="M8.5 1.5 1.5 8.5l7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose" aria-hidden="true">
                  <NailShape class="h-5 w-3 text-white" />
                </span>
                <span class="min-w-0 flex-1 leading-tight">
                  <span class="block truncate text-[14px] font-semibold">Smarttnails · Ardak</span>
                  <span class="flex items-center gap-1 text-[11px] text-ink/55">
                    <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden="true"><path fill="#25D366" d="m12 1 3 2.2 3.7-.2 1.1 3.5 3 2.2-1.2 3.5 1.2 3.5-3 2.2-1.1 3.5-3.7-.2L12 23l-3-2.2-3.7.2-1.1-3.5-3-2.2L2.4 12 1.2 8.5l3-2.2 1.1-3.5 3.7.2z" /><path d="m7.5 12.5 3 3 6-6" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                    {{ t('booking.chat.status') }}
                  </span>
                </span>
                <span class="flex items-center gap-3 text-[#128C7E]" aria-hidden="true">
                  <svg width="20" height="14" viewBox="0 0 22 14"><rect x="1" y="1" width="14" height="12" rx="3" fill="none" stroke="currentColor" stroke-width="1.7" /><path d="m15 5.5 5.5-3v9L15 8.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" /></svg>
                  <svg width="16" height="16" viewBox="0 0 24 24"><path d="M6.6 2h3l1.6 5-2.2 1.5a12 12 0 0 0 6.5 6.5l1.5-2.2 5 1.6v3a2 2 0 0 1-2.2 2A18 18 0 0 1 4.6 4.2 2 2 0 0 1 6.6 2z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" /></svg>
                </span>
              </div>

              <!-- Переписка -->
              <div class="chat flex min-h-0 flex-1 flex-col justify-end gap-1.5 overflow-hidden px-3 py-3" aria-hidden="true">
                <span class="mb-1 self-center rounded-md bg-white/85 px-2 py-0.5 text-[11px] font-medium text-ink/60 shadow-sm">{{ t('booking.chat.today') }}</span>
                <TransitionGroup name="msg">
                  <div
                    v-for="line in lines"
                    :key="line.id"
                    class="bubble"
                    :class="line.side === 'in' ? 'bubble--in' : 'bubble--out'"
                  >
                    {{ t(`booking.chat.${line.key}`) }}
                    <span class="ml-2 inline-flex translate-y-1 items-center gap-0.5 whitespace-nowrap align-bottom text-[10px] text-ink/45">
                      {{ line.time }}
                      <svg v-if="line.side === 'out'" width="15" height="9" viewBox="0 0 16 10"><path d="m1 5.5 3 3L10.5 2M6.5 8.5l1 0L14.5 2" fill="none" stroke="#53BDEB" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
                    </span>
                  </div>
                  <div v-if="typing" key="typing" class="bubble bubble--in flex items-center gap-1 !py-3">
                    <i class="dot" /><i class="dot" /><i class="dot" />
                  </div>
                </TransitionGroup>
              </div>

              <!-- Быстрые кнопки-услуги: открывают WhatsApp с готовым сообщением -->
              <div class="no-scrollbar flex shrink-0 gap-1.5 overflow-x-auto bg-[#F7F3EF] px-3 py-2">
                <a :href="wa(t('booking.messageFree'))" target="_blank" rel="noopener" class="chip-wa chip-wa--accent">{{ t('booking.free') }}</a>
                <a
                  v-for="service in services"
                  :key="service.id"
                  :href="serviceLink(service.id)"
                  target="_blank"
                  rel="noopener"
                  class="chip-wa"
                >{{ t(`services.items.${service.id}.name`) }}</a>
              </div>

              <!-- Поле ввода: тоже ведёт в WhatsApp -->
              <a :href="wa(t('booking.messageGeneric'))" target="_blank" rel="noopener" class="flex shrink-0 items-center gap-2 bg-[#F7F3EF] px-3 pb-6 pt-1" :aria-label="t('booking.cta')">
                <span class="text-2xl leading-none text-[#128C7E]" aria-hidden="true">+</span>
                <span class="flex-1 rounded-full border border-black/5 bg-white px-4 py-2 text-[13px] text-ink/40">{{ t('booking.chat.input') }}</span>
                <span class="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 20.5 21 12 3 3.5l.01 6.6L15 12 3.01 13.9z" /></svg>
                </span>
              </a>
            </div>

            <!-- «Остров» и кнопки корпуса -->
            <span class="island" aria-hidden="true" />
            <span class="side-btn left-[-3px] top-[120px] h-8" aria-hidden="true" />
            <span class="side-btn left-[-3px] top-[170px] h-14" aria-hidden="true" />
            <span class="side-btn right-[-3px] top-[150px] h-20" aria-hidden="true" />
          </figure>
        </div>
        <p class="relative mt-7 text-center text-xs text-ink-soft">{{ t('booking.quick') }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.wa-btn {
  display: inline-flex;
  min-height: 52px;
  align-items: center;
  gap: 0.6rem;
  border-radius: 999px;
  background: #25D366;
  padding: 0 1.6rem;
  font-weight: 700;
  color: white;
  box-shadow: 0 18px 40px -16px rgb(37 211 102 / 0.75);
  transition: transform 0.3s var(--ease-soft), background-color 0.3s;
}

.wa-btn:hover {
  background: #1EBE5B;
  transform: translateY(-2px);
}

.phone-float {
  animation: bob 6s ease-in-out infinite alternate;
}

@keyframes bob {
  from {
    transform: translateY(-8px);
  }
  to {
    transform: translateY(8px);
  }
}

/* Корпус iPhone: тёмная рамка, скругления, мягкая тень */
.phone {
  width: 300px;
  height: 630px;
  border-radius: 54px;
  background: #1c1418;
  padding: 11px;
  box-shadow:
    inset 0 0 0 2px #3a2e35,
    0 50px 90px -40px rgb(42 20 36 / 0.6),
    0 30px 60px -30px rgb(37 211 102 / 0.35);
  transform-style: preserve-3d;
}

.screen {
  display: flex;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border-radius: 44px;
  background: #EFE7DE;
  color: var(--color-ink);
}

/* Фон чата как в WhatsApp: тёплый беж с едва заметным узором */
.chat {
  background:
    radial-gradient(circle at 20% 30%, rgb(0 0 0 / 0.035) 1.5px, transparent 2px) 0 0 / 22px 22px,
    radial-gradient(circle at 70% 75%, rgb(0 0 0 / 0.03) 1.5px, transparent 2px) 0 0 / 30px 30px,
    #EFE7DE;
}

.island {
  position: absolute;
  top: 20px;
  left: 50%;
  width: 92px;
  height: 27px;
  border-radius: 999px;
  background: #000;
  transform: translateX(-50%);
}

.side-btn {
  position: absolute;
  width: 3px;
  border-radius: 2px;
  background: #2a2026;
}

.bubble {
  max-width: 80%;
  border-radius: 16px;
  padding: 6px 10px;
  font-size: 13.5px;
  line-height: 1.35;
  box-shadow: 0 1px 1px rgb(0 0 0 / 0.08);
}

.bubble--in {
  align-self: flex-start;
  border-top-left-radius: 4px;
  background: white;
}

.bubble--out {
  align-self: flex-end;
  border-top-right-radius: 4px;
  background: #D9FDD3;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgb(42 20 36 / 0.35);
  animation: typing 1.2s infinite ease-in-out;
}

.dot:nth-child(2) { animation-delay: 0.15s; }
.dot:nth-child(3) { animation-delay: 0.3s; }

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
  30% { transform: translateY(-4px); opacity: 1; }
}

.msg-enter-active {
  transition: opacity 0.35s var(--ease-soft), transform 0.35s var(--ease-soft);
}

.msg-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.96);
}

.msg-leave-active {
  transition: opacity 0.25s;
  position: absolute;
}

.msg-leave-to {
  opacity: 0;
}

.chip-wa {
  flex: none;
  border-radius: 999px;
  border: 1px solid rgb(18 140 126 / 0.25);
  background: white;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  color: #128C7E;
  transition: background-color 0.2s, color 0.2s;
}

.chip-wa:hover,
.chip-wa--accent {
  background: #25D366;
  border-color: #25D366;
  color: white;
}

/* На телефоне iPhone компактнее, чтобы не занимал весь экран */
@media (max-width: 639px) {
  .phone {
    width: 272px;
    height: 560px;
    border-radius: 48px;
    padding: 10px;
  }

  .screen {
    border-radius: 39px;
  }

  .island {
    top: 18px;
    width: 84px;
    height: 24px;
  }

  .bubble {
    font-size: 13px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .phone-float {
    animation: none;
  }
}
</style>
