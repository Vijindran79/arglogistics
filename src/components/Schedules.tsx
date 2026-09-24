import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Reveal from './Reveal'
import { fetchLocations } from '../lib/api'

const SEA_CARRIERS = ['Maersk', 'MSC', 'CMA CGM', 'ONE', 'Evergreen', 'COSCO', 'ZIM']
const AIR_CARRIERS = ['Malaysia Airlines', 'Emirates SkyCargo', 'Cathay Cargo', 'Singapore Airlines Cargo', 'DHL Aviation']
const SEA_VESSELS = ['MAERSK ESSEX', 'MSC GULSUN', 'CMA CGM JACQUES SAADE', 'ONE INFINITY', 'EVER GIVEN', 'COSCO UNIVERSE', 'ZIM MONACO']
const AIR_FLIGHTS = ['MH6143', 'EK366', 'CX086', 'SQ7921', 'DH114']

const DAYS = [0, 1, 2, 3, 4, 5, 6] // Sun..Sat

function hashString(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function nextDateForWeekday(weekday: number, weekOffset: number): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  const diff = (weekday - d.getDay() + 7) % 7
  d.setDate(d.getDate() + diff + weekOffset * 7)
  return d
}

interface SailingRow {
  carrier: string
  vessel: string
  departure: Date
  transitDays: number
  cutoff: Date
}

function buildSchedule(mode: 'SEA' | 'AIR', origin: string, destination: string): SailingRow[] {
  const carriers = mode === 'SEA' ? SEA_CARRIERS : AIR_CARRIERS
  const ids = mode === 'SEA' ? SEA_VESSELS : AIR_FLIGHTS
  const baseTransit = mode === 'SEA' ? 12 : 2
  const span = mode === 'SEA' ? 26 : 8
  const rows: SailingRow[] = []

  for (let i = 0; i < carriers.length; i++) {
    const seed = hashString(`${mode}|${origin}|${destination}|${carriers[i]}`)
    const weekday = DAYS[seed % 7]
    const weekOffset = (seed >>> 4) % 3
    const transit = baseTransit + ((seed >>> 3) % span)
    const departure = nextDateForWeekday(weekday, weekOffset)
    const cutoff = new Date(departure)
    cutoff.setDate(cutoff.getDate() - (mode === 'SEA' ? 2 : 1))
    rows.push({ carrier: carriers[i], vessel: ids[i], departure, transitDays: transit, cutoff })
  }
  return rows.sort((a, b) => a.departure.getTime() - b.departure.getTime())
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })
}

function fmtDay(d: Date): string {
  return d.toLocaleDateString('en-MY', { weekday: 'short' })
}

export default function Schedules() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<'SEA' | 'AIR'>('SEA')
  const [seaLocations, setSeaLocations] = useState<string[]>([])
  const [airLocations, setAirLocations] = useState<string[]>([])
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')

  useMemo(() => {
    fetchLocations('FCL').then(setSeaLocations).catch(() => setSeaLocations([]))
    fetchLocations('AIR').then(setAirLocations).catch(() => setAirLocations([]))
  }, [])

  const locations = mode === 'SEA' ? seaLocations : airLocations
  const effectiveOrigin = origin || (mode === 'SEA' ? 'PORT KLANG' : 'KUL')
  const effectiveDestination = destination || (mode === 'SEA' ? 'ROTTERDAM' : 'LHR')
  const rows = useMemo(
    () => buildSchedule(mode, effectiveOrigin.toUpperCase(), effectiveDestination.toUpperCase()),
    [mode, effectiveOrigin, effectiveDestination],
  )

  const selectCls =
    'w-full rounded-xl border border-white/10 bg-navy-800 px-4 py-2.5 text-sm text-white focus:border-amber-brand focus:outline-none'

  return (
    <section id="schedules" className="relative bg-navy-900 py-24">
      <div className="grid-pattern absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-amber-brand">
              {t('schedules.badge')}
            </span>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-5xl">{t('schedules.title')}</h2>
            <p className="mt-4 text-slate-400">{t('schedules.subtitle')}</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-white/8 bg-navy-950/70 p-5 backdrop-blur">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded-xl bg-navy-800 p-1">
                {(['SEA', 'AIR'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMode(m)
                      setOrigin('')
                      setDestination('')
                    }}
                    className={`rounded-lg px-5 py-2 text-sm font-bold transition ${
                      mode === m ? 'bg-amber-brand text-navy-950' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {t(`schedules.${m.toLowerCase()}`)}
                  </button>
                ))}
              </div>
              <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  list="sched-origin"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder={t('schedules.origin')}
                  className={selectCls}
                />
                <input
                  list="sched-destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder={t('schedules.destination')}
                  className={selectCls}
                />
                <datalist id="sched-origin">
                  {locations.map((loc) => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
                <datalist id="sched-destination">
                  {locations.map((loc) => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="mt-8 overflow-hidden rounded-2xl border border-white/8">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="bg-navy-800 text-xs uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-4">{t('schedules.table.carrier')}</th>
                    <th className="px-5 py-4">{t('schedules.table.vessel')}</th>
                    <th className="px-5 py-4">{t('schedules.table.departure')}</th>
                    <th className="px-5 py-4">{t('schedules.table.transit')}</th>
                    <th className="px-5 py-4">{t('schedules.table.cutoff')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-navy-950/80">
                  {rows.map((row) => (
                    <tr key={row.carrier} className="transition hover:bg-white/4">
                      <td className="px-5 py-4 font-bold text-white">{row.carrier}</td>
                      <td className="px-5 py-4 font-mono text-amber-brand">{row.vessel}</td>
                      <td className="px-5 py-4 text-slate-200">
                        {fmtDay(row.departure)}, {fmtDate(row.departure)}
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        {row.transitDays} {t('schedules.days')}
                      </td>
                      <td className="px-5 py-4 text-slate-400">{fmtDate(row.cutoff)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-slate-500">{t('schedules.disclaimer')}</p>
        </Reveal>
      </div>
    </section>
  )
}
