// За сколько заставка от первой отрисовки страницы успевает раствориться (см. стили ThePreloader.vue)
export const PRELOADER_MS = 1500

// Момент первой отрисовки: с него стартуют CSS-анимации заставки и первого экрана,
// а не с начала загрузки страницы. 0 — страница ещё не отрисовалась
export function firstPaintAt() {
  return performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0
}
