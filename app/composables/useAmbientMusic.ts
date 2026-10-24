// Фоновая музыка: «Deep House Sunset» (sunset-house-grooves) с Pixabay.
// Pixabay Content License: бесплатно, в том числе на коммерческом сайте, без указания автора.
// Браузеры не дают включать звук сам по себе, поэтому старт — только по клику;
// файл тоже начинает грузиться только после клика, чтобы не тратить трафик зря.
// Громкость меняем через Web Audio (GainNode): на iPhone у <audio> свойство volume не работает.

const SRC = '/audio/deep-house-sunset.mp3'
const VOLUME = 0.4

const playing = ref(false)

let audio: HTMLAudioElement | null = null
let ctx: AudioContext | null = null
let gain: GainNode | null = null
let pauseTimer: ReturnType<typeof setTimeout> | undefined

function setup() {
  audio = new Audio(SRC)
  audio.loop = true
  ctx = new AudioContext()
  gain = ctx.createGain()
  gain.gain.value = 0
  ctx.createMediaElementSource(audio).connect(gain)
  gain.connect(ctx.destination)

  // В фоновой вкладке музыка замолкает и продолжается, когда вкладку открывают снова
  document.addEventListener('visibilitychange', () => {
    if (!audio || !playing.value) return
    if (document.hidden) audio.pause()
    else audio.play().catch(() => {})
  })
}

function fadeTo(value: number, seconds: number) {
  if (!ctx || !gain) return
  const now = ctx.currentTime
  gain.gain.cancelScheduledValues(now)
  gain.gain.setValueAtTime(gain.gain.value, now)
  gain.gain.linearRampToValueAtTime(value, now + seconds)
}

export function useAmbientMusic() {
  async function start() {
    if (!import.meta.client) return
    if (!audio) setup()
    clearTimeout(pauseTimer)
    playing.value = true
    try {
      await ctx!.resume()
      await audio!.play()
      fadeTo(VOLUME, 2.5)
    }
    catch {
      playing.value = false
    }
  }

  function stop() {
    if (!audio) return
    playing.value = false
    fadeTo(0, 0.8)
    pauseTimer = setTimeout(() => {
      if (!playing.value) audio?.pause()
    }, 900)
  }

  function toggle() {
    if (playing.value) stop()
    else start()
  }

  return { playing: readonly(playing), start, stop, toggle }
}
