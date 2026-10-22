// Сообщение из формы в подвале → Ардак в Telegram и/или на email.
// Ключи лежат только на сервере (runtimeConfig), в браузер они не попадают.

interface ContactBody {
  name?: unknown
  phone?: unknown
  message?: unknown
  // Скрытое поле-ловушка: люди его не видят, а спам-боты заполняют
  website?: unknown
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ContactBody>(event)
  if (body?.website) return { ok: true }

  const name = String(body?.name ?? '').trim().slice(0, 80)
  const phone = String(body?.phone ?? '').replace(/[^\d+ ]/g, '').trim().slice(0, 20)
  const message = String(body?.message ?? '').trim().slice(0, 1000)

  if (name.length < 2 || phone.replace(/\D/g, '').length !== 11) {
    throw createError({ statusCode: 400, statusMessage: 'invalid' })
  }

  const config = useRuntimeConfig(event)
  // Отвечать на письмо бесполезно (оно от служебного адреса), поэтому сразу даём ссылку на чат с клиенткой
  const text = [
    '💅 Новое сообщение с сайта Smarttnails',
    '',
    `Имя: ${name}`,
    `WhatsApp: ${phone}`,
    message ? `Сообщение: ${message}` : '',
    '',
    `Ответить в WhatsApp: https://wa.me/${phone.replace(/\D/g, '')}`,
  ].filter((line, i, lines) => line || lines[i - 1]).join('\n')

  const jobs: Promise<unknown>[] = []

  if (config.telegramBotToken && config.telegramChatId) {
    jobs.push($fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
      method: 'POST',
      body: { chat_id: config.telegramChatId, text },
    }))
  }

  if (config.resendApiKey && config.contactEmail) {
    jobs.push($fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.resendApiKey}` },
      body: {
        from: 'Smarttnails <onboarding@resend.dev>',
        to: [config.contactEmail],
        subject: `Сообщение с сайта от ${name}`,
        text,
      },
    }))
  }

  if (!jobs.length) {
    throw createError({ statusCode: 503, statusMessage: 'not-configured' })
  }

  // Достаточно, чтобы дошло хотя бы одним способом
  const results = await Promise.allSettled(jobs)
  if (results.every(r => r.status === 'rejected')) {
    console.error('[contact] delivery failed', results)
    throw createError({ statusCode: 502, statusMessage: 'delivery-failed' })
  }

  return { ok: true }
})
