// Фон всей страницы — одна переменная --page-bg. У секций своего фона нет, только data-bg с оттенком:
// когда секция пересекает середину экрана, фон страницы меняется на её цвет,
// а плавность даёт CSS-переход в main.css. Так между секциями нет резких границ.
export function usePageBackground() {
  let observer: IntersectionObserver | undefined

  onMounted(() => {
    const root = document.documentElement
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const bg = (entry.target as HTMLElement).dataset.bg
        if (entry.isIntersecting && bg) root.style.setProperty('--page-bg', bg)
      }
    }, { rootMargin: '-50% 0px -50% 0px' })

    for (const section of document.querySelectorAll<HTMLElement>('[data-bg]')) {
      observer.observe(section)
    }
  })

  onBeforeUnmount(() => observer?.disconnect())
}
