/**
 * Quote lead capture. When a visitor locks in an estimated rate, their
 * details + quote summary are emailed to ARG (Brevo) so the team can
 * follow up with an official quotation — the owner sees every serious lead.
 */

interface QuoteLeadPayload {
  name: string
  email: string
  phone: string
  company?: string
  origin: string
  destination: string
  serviceType: string
  price?: number
  currency?: string
  transitTime?: number
  weight?: number
  volume?: number
  containerType?: string
  vehicleType?: string
  message?: string
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildEmailHtml(lead: QuoteLeadPayload): string {
  const row = (label: string, value: unknown) =>
    `<tr><td style="padding:6px 12px;color:#64748b;font-size:13px;">${label}</td><td style="padding:6px 12px;font-size:13px;font-weight:600;">${escapeHtml(value || '—')}</td></tr>`
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
    <div style="background:#0f172a;color:#fff;padding:20px 24px;">
      <h1 style="margin:0;font-size:18px;">New ARG Logistics Quote Request</h1>
      <p style="margin:6px 0 0;font-size:13px;color:#94a3b8;">A visitor locked in an estimated rate on arglogistics.com.my</p>
    </div>
    <table style="border-collapse:collapse;width:100%;">
      ${row('Name', lead.name)}
      ${row('Email', lead.email)}
      ${row('Phone', lead.phone)}
      ${row('Company', lead.company)}
      ${row('Route', `${lead.origin} → ${lead.destination}`)}
      ${row('Service', lead.serviceType)}
      ${row('Estimated Price', lead.price ? `${lead.currency || 'MYR'} ${Number(lead.price).toLocaleString()}` : '—')}
      ${row('Transit Time', lead.transitTime ? `${lead.transitTime} days` : '—')}
      ${row('Weight (kg)', lead.weight)}
      ${row('Volume (CBM)', lead.volume)}
      ${row('Container', lead.containerType)}
      ${row('Vehicle', lead.vehicleType)}
    </table>
    ${lead.message ? `<p style="padding:12px 24px;font-size:13px;color:#334155;">${escapeHtml(lead.message)}</p>` : ''}
    <div style="padding:16px 24px;background:#f8fafc;font-size:12px;color:#64748b;">
      Follow up with an official quotation. Rates shown on the site are indicative estimates.
    </div>
  </div>`
}

async function sendBrevoEmail(env: any, to: string[], subject: string, html: string): Promise<boolean> {
  const apiKey = env?.BREVO_API_KEY
  if (!apiKey) return false
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { email: env?.BREVO_SENDER_EMAIL || 'noreply@arglogistics.com.my', name: 'ARG Logistics Website' },
      to: to.map((email) => ({ email })),
      subject,
      htmlContent: html,
    }),
  })
  return res.ok
}

export const onRequestPost: PagesFunction<any, any, Record<string, string>> = async ({ request, env }) => {
  let lead: QuoteLeadPayload
  try {
    lead = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 })
  }

  const required = ['name', 'email', 'phone', 'origin', 'destination', 'serviceType'] as const
  for (const field of required) {
    if (!lead[field] || typeof lead[field] !== 'string') {
      return new Response(JSON.stringify({ error: `${field} is required` }), { status: 400 })
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return new Response(JSON.stringify({ error: 'valid email is required' }), { status: 400 })
  }

  const recipients = [env?.OWNER_EMAIL || 'vg@vcanresources.com', env?.CONTACT_EMAIL || 'anna@arglogistics.com.my'].filter(
    (v, i, a) => v && a.indexOf(v) === i,
  )
  const subject = `Quote Request ${lead.origin} → ${lead.destination} [${lead.serviceType}] — ${lead.name}`
  const html = buildEmailHtml(lead)
  const sent = await sendBrevoEmail(env, recipients, subject, html)

  return new Response(JSON.stringify({ ok: true, emailed: sent, reference: `ARG-${Date.now().toString(36).toUpperCase()}` }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
