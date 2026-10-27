// Через сколько запасная CSS-шторка заставки уезжает сама (см. стили ThePreloader.vue)
export const PRELOADER_FALLBACK_MS = 3400

// Момент первой отрисовки: с него стартуют CSS-анимации заставки (логотип, запасная шторка),
// а не с начала загрузки страницы. 0 — страница ещё не отрисовалась
export function firstPaintAt() {
  return performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0
}

// Запасная шторка уже уехала сама: скрипты загрузились слишком поздно (медленный телефон)
export function preloaderGoneByCss() {
  const painted = firstPaintAt()
  return painted > 0 && performance.now() >= painted + PRELOADER_FALLBACK_MS
}
