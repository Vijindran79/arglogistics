import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES } from '../i18n'

const NAV_LINKS = [
  { href: '#services', key: 'nav.services' },
  { href: '#quote', key: 'nav.quote' },
  { href: '#schedules', key: 'nav.schedules' },
  { href: '#coverage', key: 'nav.coverage' },
  { href: '#about', key: 'nav.about' },
  { href: '#contact', key: 'nav.contact' },
]

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const changeLanguage = (code: string) => {
    void i18n.changeLanguage(code)
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-lg shadow-black/30' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#home" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-brand to-orange-500 text-sm font-black text-navy-950">
            ARG
          </span>
          <span className="text-lg font-extrabold tracking-tight text-white">
            ARG <span className="text-gradient">Logistics</span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-300 transition hover:text-amber-brand"
            >
              {t(link.key)}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <div className="flex overflow-hidden rounded-full border border-white/15 text-xs font-semibold">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`px-3 py-1.5 transition ${
                  i18n.language.startsWith(lang.code)
                    ? 'bg-amber-brand text-navy-950'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                {lang.short}
              </button>
            ))}
          </div>
          <a
            href="#quote"
            className="rounded-full bg-amber-brand px-5 py-2 text-sm font-bold text-navy-950 shadow-lg shadow-amber-brand/25 transition hover:bg-amber-brand-light"
          >
            {t('nav.cta')}
          </a>
        </div>

        <button
          className="text-slate-200 lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="glass border-t border-white/10 px-4 pb-6 pt-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/5"
              >
                {t(link.key)}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex flex-wrap gap-2">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                  i18n.language.startsWith(lang.code)
                    ? 'bg-amber-brand text-navy-950'
                    : 'border border-white/15 text-slate-300'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
          <a
            href="#quote"
            onClick={() => setOpen(false)}
            className="mt-4 block rounded-full bg-amber-brand px-5 py-2.5 text-center text-sm font-bold text-navy-950"
          >
            {t('nav.cta')}
          </a>
        </div>
      )}
    </header>
  )
}
