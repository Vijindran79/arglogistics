import { useTranslation } from 'react-i18next'
import { SITE, whatsappLink } from '../config'
import Reveal from './Reveal'

export default function Contact() {
  const { t } = useTranslation()

  const cards = [
    {
      key: 'address',
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />,
      value: SITE.address,
    },
    {
      key: 'hours',
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
      value: SITE.hours,
    },
    {
      key: 'email',
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.9 5.3a2 2 0 002.2 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
      value: SITE.contactEmail,
      href: `mailto:${SITE.contactEmail}`,
    },
    {
      key: 'whatsapp',
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 01-13.3 7.9L3 21l1.2-4.4A9 9 0 1121 12z" />,
      value: SITE.whatsappDisplay,
      href: whatsappLink(t('contact.whatsappMessage')),
    },
  ]

  return (
    <section id="contact" className="relative bg-navy-950 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-amber-brand">
              {t('contact.badge')}
            </span>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-5xl">{t('contact.title')}</h2>
            <p className="mt-4 text-slate-400">{t('contact.subtitle')}</p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {cards.map((card, index) => (
            <Reveal key={card.key} delay={index * 0.08}>
              <div className="flex h-full items-start gap-4 rounded-2xl border border-white/8 bg-navy-900 p-6 transition hover:border-amber-brand/40">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-brand text-navy-950">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    {card.icon}
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t(`contact.${card.key}`)}
                  </div>
                  {card.href ? (
                    <a
                      href={card.href}
                      target={card.href.startsWith('http') ? '_blank' : undefined}
                      rel="noreferrer"
                      className="mt-1 block break-words font-semibold text-white hover:text-amber-brand"
                    >
                      {card.value}
                    </a>
                  ) : (
                    <div className="mt-1 font-semibold leading-relaxed text-white">{card.value}</div>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-col items-center justify-between gap-6 rounded-2xl border border-amber-brand/25 bg-gradient-to-r from-navy-900 to-navy-800 p-8 sm:flex-row">
            <div>
              <div className="text-xl font-black text-white">{t('contact.cta.title')}</div>
              <div className="mt-1 text-sm text-slate-400">{t('contact.cta.desc')}</div>
            </div>
            <a
              href={whatsappLink(t('contact.whatsappMessage'))}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 font-bold text-navy-950 shadow-lg shadow-[#25D366]/25 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.5 14.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.11 3.22 5.1 4.51.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.76-.72 2-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35zM12.05 21.8h-.01a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 01-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.82 9.82 0 016.99 2.9 9.82 9.82 0 012.9 7c0 5.45-4.45 9.88-9.9 9.88zm8.42-18.3A11.8 11.8 0 0012.04 0C5.5 0 .16 5.33.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.9 11.9 0 005.68 1.45h.01c6.55 0 11.89-5.33 11.89-11.89 0-3.18-1.24-6.16-3.47-8.4z" />
              </svg>
              {t('contact.cta.button')}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
