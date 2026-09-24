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
  const [light, setLight] = useState(() => document.documentElement.classList.contains('light'))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggleTheme = () => {
    const next = !light
    setLight(next)
    document.documentElement.classList.toggle('light', next)
    try {
      localStorage.setItem('arg-theme', next ? 'light' : 'dark')
    } catch {
      // private mode
    }
  }

  const changeLanguage = (code: string) => {
    void i18n.changeLanguage(code)
  }

  const themeButton = (className: string) => (
    <button
      onClick={toggleTheme}
      aria-label={t('nav.theme')}
      title={t('nav.theme')}
      className={`flex items-center justify-center rounded-full border border-line/15 text-ink-mid transition hover:border-amber-brand/50 hover:text-amber-brand ${className}`}
    >
      {light ? (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="4" />
          <path strokeLinecap="round" d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4l1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4l1.4-1.4" />
        </svg>
      )}
    </button>
  )

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
          <span className="text-lg font-extrabold tracking-tight text-ink">
            ARG <span className="text-gradient">Logistics</span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-mid transition hover:text-amber-brand"
            >
              {t(link.key)}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {themeButton('h-8 w-8')}
          <div className="flex overflow-hidden rounded-full border border-line/15 text-xs font-semibold">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`px-3 py-1.5 transition ${
                  i18n.language.startsWith(lang.code)
                    ? 'bg-amber-brand text-navy-950'
                    : 'text-ink-mid hover:bg-ink/10'
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

        <div className="flex items-center gap-2 lg:hidden">
          {themeButton('h-9 w-9')}
          <button
            className="text-ink-mid"
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
      </div>

      {open && (
        <div className="glass border-t border-line/10 px-4 pb-6 pt-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-mid hover:bg-ink/5"
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
                    : 'border border-line/15 text-ink-mid'
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
