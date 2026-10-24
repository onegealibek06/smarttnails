// Карта сайта для Google и Яндекса: три языковые версии с перекрёстными ссылками hreflang.
// Адрес берётся из NUXT_PUBLIC_SITE_URL, поэтому при смене домена карта обновится сама
const pages = [
  { path: '', lang: 'ru' },
  { path: '/kk', lang: 'kk' },
  { path: '/en', lang: 'en' },
]

export default defineEventHandler((event) => {
  const { siteUrl } = useRuntimeConfig(event).public
  const lastmod = new Date().toISOString().slice(0, 10)
  const alternates = [
    ...pages.map(p => `    <xhtml:link rel="alternate" hreflang="${p.lang}" href="${siteUrl}${p.path}"/>`),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}"/>`,
  ].join('\n')
  const urls = pages.map(p => `  <url>
    <loc>${siteUrl}${p.path}</loc>
    <lastmod>${lastmod}</lastmod>
${alternates}
  </url>`).join('\n')

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`
})
