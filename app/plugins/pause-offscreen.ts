// v-pause-offscreen: пока раздел не на экране, его CSS-анимации стоят на паузе (класс is-offscreen,
// правило в main.css). Телефону не нужно без конца перерисовывать то, чего сейчас никто не видит.
const observers = new WeakMap<HTMLElement, IntersectionObserver>()

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive<HTMLElement>('pause-offscreen', {
    getSSRProps: () => ({}),
    mounted(el) {
      el.classList.add('is-offscreen')
      const io = new IntersectionObserver(([entry]) => {
        el.classList.toggle('is-offscreen', !entry!.isIntersecting)
      }, { rootMargin: '120px 0px' })
      io.observe(el)
      observers.set(el, io)
    },
    unmounted(el) {
      observers.get(el)?.disconnect()
      observers.delete(el)
    },
  })
})
