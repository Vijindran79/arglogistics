import { useTranslation } from 'react-i18next'
import { SITE, whatsappLink } from '../config'
import { SUPPORTED_LANGUAGES } from '../i18n'

export default function Footer() {
  const { t, i18n } = useTranslation()

  const links = [
    { href: '#services', key: 'nav.services' },
    { href: '#quote', key: 'nav.quote' },
    { href: '#schedules', key: 'nav.schedules' },
    { href: '#coverage', key: 'nav.coverage' },
    { href: '#about', key: 'nav.about' },
    { href: '#contact', key: 'nav.contact' },
  ]

  const services = ['services.sea.title', 'services.air.title', 'services.land.title', 'services.warehouse.title', 'services.customs.title', 'services.fba.title']

  return (
    <footer className="border-t border-white/8 bg-navy-950">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-brand text-lg font-black text-navy-950">
                A
              </div>
              <div>
                <div className="text-lg font-black leading-tight text-white">{SITE.name}</div>
                <div className="text-xs text-slate-500">{t('footer.tagline')}</div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">{t('footer.blurb')}</p>
          </div>

          <div>
            <div className="text-sm font-bold uppercase tracking-wider text-white">{t('footer.explore')}</div>
            <ul className="mt-4 space-y-2.5">
              {links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-slate-400 transition hover:text-amber-brand">
                    {t(link.key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-sm font-bold uppercase tracking-wider text-white">{t('footer.services')}</div>
            <ul className="mt-4 space-y-2.5">
              {services.map((service) => (
                <li key={service}>
                  <a href="#services" className="text-sm text-slate-400 transition hover:text-amber-brand">
                    {t(service)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-sm font-bold uppercase tracking-wider text-white">{t('footer.contact')}</div>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li className="leading-relaxed">{SITE.address}</li>
              <li>
                <a href={`mailto:${SITE.contactEmail}`} className="transition hover:text-amber-brand">
                  {SITE.contactEmail}
                </a>
              </li>
              <li>
                <a href={whatsappLink(t('contact.whatsappMessage'))} target="_blank" rel="noreferrer" className="transition hover:text-amber-brand">
                  {SITE.whatsappDisplay}
                </a>
              </li>
              <li>{SITE.hours}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-8 sm:flex-row">
          <div className="text-xs text-slate-500">
            © {new Date().getFullYear()} {SITE.name}. {t('footer.rights')}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{t('footer.language')}</span>
            {SUPPORTED_LANGUAGES.map((lng) => (
              <button
                key={lng.code}
                type="button"
                onClick={() => i18n.changeLanguage(lng.code)}
                className={`rounded-full px-3 py-1 font-bold transition ${
                  i18n.language === lng.code ? 'bg-amber-brand text-navy-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                {lng.short}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
