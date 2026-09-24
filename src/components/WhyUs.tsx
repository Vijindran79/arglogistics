import { useTranslation } from 'react-i18next'
import Reveal from './Reveal'

export default function WhyUs() {
  const { t } = useTranslation()

  const points = [
    { key: 'pricing' },
    { key: 'instant' },
    { key: 'owner' },
    { key: 'customs' },
    { key: 'door' },
    { key: 'whatsapp' },
  ]

  const icons: Record<string, JSX.Element> = {
    pricing: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-3.5 0-6 1.3-6 3s2.5 3 6 3 6 1.3 6 3-2.5 3-6 3m0-12c2 0 3.8.5 5 1.3M12 8V5m0 15v-3M12 5a9 9 0 100 18 9 9 0 000-18z" />,
    instant: <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />,
    owner: <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
    customs: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
    door: <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10" />,
    whatsapp: <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 01-13.3 7.9L3 21l1.2-4.4A9 9 0 1121 12z" />,
  }

  return (
    <section id="about" className="relative bg-navy-900 py-24">
      <div className="grid-pattern absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-amber-brand">
                {t('about.badge')}
              </span>
              <h2 className="mt-3 text-3xl font-black text-white sm:text-5xl">{t('about.title')}</h2>
              <p className="mt-5 leading-relaxed text-slate-300">{t('about.p1')}</p>
              <p className="mt-4 leading-relaxed text-slate-400">{t('about.p2')}</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {points.slice(0, 4).map((point) => (
                  <div key={point.key} className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-brand/15 text-amber-brand">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        {icons[point.key]}
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold text-white">{t(`about.${point.key}.title`)}</div>
                      <div className="mt-1 text-sm text-slate-400">{t(`about.${point.key}.desc`)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {points.slice(4).map((point, index) => (
              <Reveal key={point.key} delay={index * 0.08}>
                <div className="h-full rounded-2xl border border-white/8 bg-navy-950/70 p-6 transition hover:border-amber-brand/40">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-brand text-navy-950">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      {icons[point.key]}
                    </svg>
                  </div>
                  <div className="mt-4 font-bold text-white">{t(`about.${point.key}.title`)}</div>
                  <div className="mt-2 text-sm leading-relaxed text-slate-400">{t(`about.${point.key}.desc`)}</div>
                </div>
              </Reveal>
            ))}
            <Reveal delay={0.2} className="sm:col-span-2">
              <div className="rounded-2xl border border-amber-brand/30 bg-gradient-to-r from-amber-brand/15 to-transparent p-6">
                <div className="font-bold text-white">{t('about.promise.title')}</div>
                <div className="mt-2 text-sm leading-relaxed text-slate-300">{t('about.promise.desc')}</div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
