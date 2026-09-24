import { useTranslation } from 'react-i18next'
import Reveal from './Reveal'
import CountUp from './CountUp'

const MALAYSIA_PORTS = ['PORT KLANG', 'PENANG', 'PASIR GUDANG', 'TANJUNG PELEPAS', 'KUCHING', 'BINTULU', 'KOTA KINABALU', 'LABUAN']

export default function Coverage() {
  const { t } = useTranslation()

  const regions = [
    { key: 'sea', ports: ['SINGAPORE', 'SHANGHAI', 'NINGBO', 'SHENZHEN', 'BUSAN', 'HONG KONG', 'ROTTERDAM', 'HAMBURG', 'ANTWERP', 'DUBAI', 'JEDDAH', 'LOS ANGELES', 'NEW YORK', 'SYDNEY'] },
    { key: 'air', ports: ['SIN', 'HKG', 'PVG', 'DXB', 'LHR', 'FRA', 'AMS', 'NRT', 'ICN', 'JFK', 'ORD', 'SYD'] },
    { key: 'land', ports: ['KUALA LUMPUR', 'SELANGOR', 'PENANG', 'JOHOR BAHRU', 'IPOH', 'MALACCA', 'KUANTAN', 'KOTA BHARU', 'SEREMBAN', 'SINGAPORE'] },
  ]

  const stats = [
    { value: 60, suffix: '+', label: t('coverage.stat.ports') },
    { value: 38, suffix: '+', label: t('coverage.stat.cities') },
    { value: 180, suffix: '+', label: t('coverage.stat.countries') },
    { value: 120, suffix: '+', label: t('coverage.stat.weekly') },
  ]

  return (
    <section id="coverage" className="relative bg-surface py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-amber-brand">
              {t('coverage.badge')}
            </span>
            <h2 className="mt-3 text-3xl font-black text-ink sm:text-5xl">{t('coverage.title')}</h2>
            <p className="mt-4 text-ink-soft">{t('coverage.subtitle')}</p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.08}>
              <div className="rounded-2xl border border-line/8 bg-panel p-6 text-center transition hover:border-amber-brand/40">
                <div className="text-4xl font-black text-ink">
                  <CountUp end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="mt-2 text-sm text-ink-soft">{stat.label}</div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {regions.map((region, index) => (
            <Reveal key={region.key} delay={index * 0.08}>
              <div className="h-full rounded-2xl border border-line/8 bg-panel p-6">
                <h3 className="text-lg font-bold text-ink">{t(`coverage.${region.key}.title`)}</h3>
                <p className="mt-1 text-sm text-ink-soft">{t(`coverage.${region.key}.desc`)}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {region.ports.map((port) => (
                    <span
                      key={port}
                      className="rounded-full border border-line/10 bg-raised px-3 py-1 text-xs font-semibold text-ink-mid"
                    >
                      {port}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15}>
          <div className="mt-8 rounded-2xl border border-amber-brand/25 bg-gradient-to-r from-panel to-raised p-6">
            <h3 className="text-lg font-bold text-ink">{t('coverage.malaysia.title')}</h3>
            <p className="mt-1 text-sm text-ink-soft">{t('coverage.malaysia.desc')}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {MALAYSIA_PORTS.map((port) => (
                <span
                  key={port}
                  className="rounded-full border border-amber-brand/30 bg-amber-brand/10 px-3 py-1 text-xs font-bold text-amber-brand"
                >
                  {port}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
