import { useTranslation } from 'react-i18next'
import airFreight from '../assets/air-freight.png'
import warehouse from '../assets/warehouse.png'
import trucking from '../assets/trucking.png'
import heroPort from '../assets/hero-port.png'
import Reveal from './Reveal'

export default function Services() {
  const { t } = useTranslation()

  const services = [
    {
      key: 'sea',
      image: heroPort,
      points: ['services.sea.p1', 'services.sea.p2', 'services.sea.p3'],
    },
    {
      key: 'air',
      image: airFreight,
      points: ['services.air.p1', 'services.air.p2', 'services.air.p3'],
    },
    {
      key: 'land',
      image: trucking,
      points: ['services.land.p1', 'services.land.p2', 'services.land.p3'],
    },
    {
      key: 'warehouse',
      image: warehouse,
      points: ['services.warehouse.p1', 'services.warehouse.p2', 'services.warehouse.p3'],
    },
    {
      key: 'customs',
      image: null,
      points: ['services.customs.p1', 'services.customs.p2', 'services.customs.p3'],
    },
    {
      key: 'fba',
      image: null,
      points: ['services.fba.p1', 'services.fba.p2', 'services.fba.p3'],
    },
  ]

  const icons: Record<string, JSX.Element> = {
    sea: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 17h18M5 17l1.5-8h11L19 17M12 9V5m0 0l-3 3m3-3l3 3M2 21c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 3-1 4.5 0" />
    ),
    air: <path strokeLinecap="round" strokeLinejoin="round" d="M2 16l20-9-6 9 6 2-20-2zm6 3.5c1.5 1.5 8.5 1.5 10 0" />,
    land: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h11v8H3zM14 10h4l3 3v2h-7M5.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm11 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
    ),
    warehouse: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V8l9-5 9 5v13M3 21h18M8 21v-6h8v6M8 12h.01M12 12h.01M16 12h.01" />
    ),
    customs: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    fba: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    ),
  }

  return (
    <section id="services" className="relative bg-navy-950 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-amber-brand">
              {t('services.badge')}
            </span>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-5xl">{t('services.title')}</h2>
            <p className="mt-4 text-slate-400">{t('services.subtitle')}</p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Reveal key={service.key} delay={index * 0.08}>
              <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/8 bg-navy-900 transition duration-300 hover:-translate-y-1.5 hover:border-amber-brand/40 hover:shadow-2xl hover:shadow-amber-brand/10">
                {service.image ? (
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={service.image}
                      alt={t(`services.${service.key}.title`)}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900 to-transparent" />
                    <div className="absolute bottom-4 left-5 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-brand text-navy-950 shadow-lg">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        {icons[service.key]}
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-44 items-center justify-center bg-gradient-to-br from-navy-800 to-navy-900">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-brand/15 text-amber-brand">
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                        {icons[service.key]}
                      </svg>
                    </div>
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-bold text-white">{t(`services.${service.key}.title`)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{t(`services.${service.key}.desc`)}</p>
                  <ul className="mt-4 space-y-2">
                    {service.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-slate-300">
                        <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {t(point)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
