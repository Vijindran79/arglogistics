import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import heroPort from '../assets/hero-port.png'
import CountUp from './CountUp'

export default function Hero() {
  const { t } = useTranslation()

  const stats = [
    { value: 180, suffix: '+', label: t('hero.statCountries') },
    { value: 2400, suffix: '+', label: t('hero.statShipments') },
    { value: 98, suffix: '%', label: t('hero.statOntime') },
    { value: 12, suffix: '', label: t('hero.statPorts') },
  ]

  return (
    <section id="home" className="relative flex min-h-screen flex-col justify-end overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroPort} alt="Container port at dusk" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/70 via-navy-950/40 to-surface" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/60 to-transparent" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-36 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-brand/30 bg-amber-brand/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-amber-brand-light">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-brand" />
            {t('hero.badge')}
          </span>
          <h1 className="text-4xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
            {t('hero.title')}
            <span className="text-gradient block">{t('hero.titleHighlight')}</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
            {t('hero.subtitle')}
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href="#quote"
              className="rounded-full bg-amber-brand px-8 py-3.5 text-sm font-bold text-navy-950 shadow-xl shadow-amber-brand/30 transition hover:-translate-y-0.5 hover:bg-amber-brand-light"
            >
              {t('hero.ctaQuote')}
            </a>
            <a
              href="#services"
              className="rounded-full border border-line/25 px-8 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:border-amber-brand hover:text-amber-brand"
            >
              {t('hero.ctaServices')}
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="glass mt-16 grid grid-cols-2 gap-6 rounded-2xl p-8 sm:grid-cols-4"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-black text-white sm:text-4xl">
                <CountUp end={stat.value} suffix={stat.suffix} />
              </div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-white/60">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
