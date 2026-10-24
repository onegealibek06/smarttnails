// Поисковикам открыт весь сайт; здесь же — где лежит карта сайта
export default defineEventHandler((event) => {
  const { siteUrl } = useRuntimeConfig(event).public
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`
})
