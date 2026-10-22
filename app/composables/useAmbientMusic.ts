// Фоновая музыка генерируется прямо в браузере (Web Audio API):
// мягкие аккорды + редкие «капли» пентатоники. Ни файлов, ни авторских прав.
// Браузеры не дают включать звук сам по себе, поэтому старт — только по клику.

const playing = ref(false)

let ctx: AudioContext | null = null
let master: GainNode | null = null
let bus: AudioNode | null = null
let loop: ReturnType<typeof setInterval> | undefined
let chordIndex = 0

const BAR = 8
const CHORDS = [
  [53, 57, 60, 64], // Fmaj7
  [52, 55, 59, 62], // Em7
  [50, 53, 57, 60, 64], // Dm9
  [48, 52, 55, 59, 62], // Cmaj9
]
const DROPS = [72, 74, 76, 79, 81, 84]

const freq = (midi: number) => 440 * 2 ** ((midi - 69) / 12)

function setup() {
  ctx = new AudioContext()
  master = ctx.createGain()
  master.gain.value = 0

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 1800

  const delay = ctx.createDelay(1)
  delay.delayTime.value = 0.38
  const feedback = ctx.createGain()
  feedback.gain.value = 0.32
  const wet = ctx.createGain()
  wet.gain.value = 0.35

  filter.connect(master)
  filter.connect(delay)
  delay.connect(feedback)
  feedback.connect(delay)
  delay.connect(wet)
  wet.connect(master)
  master.connect(ctx.destination)
  bus = filter

  document.addEventListener('visibilitychange', () => {
    if (!ctx || !playing.value) return
    if (document.hidden) ctx.suspend()
    else ctx.resume()
  })
}

function pad(notes: number[], start: number) {
  if (!ctx || !bus) return
  for (const note of notes) {
    for (const [type, detune] of [['sine', -6], ['triangle', 6]] as const) {
      const osc = ctx.createOscillator()
      osc.type = type
      osc.frequency.value = freq(note)
      osc.detune.value = detune
      const env = ctx.createGain()
      env.gain.setValueAtTime(0, start)
      env.gain.linearRampToValueAtTime(0.045, start + 2.5)
      env.gain.setValueAtTime(0.045, start + BAR - 1)
      env.gain.linearRampToValueAtTime(0, start + BAR + 2)
      osc.connect(env)
      env.connect(bus)
      osc.start(start)
      osc.stop(start + BAR + 2.5)
    }
  }
}

function drop(note: number, start: number) {
  if (!ctx || !bus) return
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.value = freq(note)
  const env = ctx.createGain()
  env.gain.setValueAtTime(0, start)
  env.gain.linearRampToValueAtTime(0.06, start + 0.02)
  env.gain.exponentialRampToValueAtTime(0.0001, start + 2.2)
  osc.connect(env)
  env.connect(bus)
  osc.start(start)
  osc.stop(start + 2.4)
}

function scheduleBar() {
  if (!ctx) return
  const t = ctx.currentTime + 0.1
  pad(CHORDS[chordIndex % CHORDS.length]!, t)
  for (let i = 0; i < 3; i++) {
    if (Math.random() < 0.8) {
      const note = DROPS[Math.floor(Math.random() * DROPS.length)]!
      drop(note, t + 1 + i * 2.3 + Math.random() * 0.6)
    }
  }
  chordIndex++
}

export function useAmbientMusic() {
  async function start() {
    if (!import.meta.client) return
    if (!ctx) setup()
    await ctx!.resume()
    const now = ctx!.currentTime
    master!.gain.cancelScheduledValues(now)
    master!.gain.setValueAtTime(master!.gain.value, now)
    master!.gain.linearRampToValueAtTime(0.5, now + 2.5)
    if (!loop) {
      scheduleBar()
      loop = setInterval(scheduleBar, BAR * 1000)
    }
    playing.value = true
  }

  function stop() {
    if (!ctx || !master) return
    const now = ctx.currentTime
    master.gain.cancelScheduledValues(now)
    master.gain.setValueAtTime(master.gain.value, now)
    master.gain.linearRampToValueAtTime(0, now + 0.8)
    clearInterval(loop)
    loop = undefined
    playing.value = false
    setTimeout(() => {
      if (!playing.value) ctx?.suspend()
    }, 900)
  }

  function toggle() {
    if (playing.value) stop()
    else start()
  }

  return { playing: readonly(playing), start, stop, toggle }
}
