import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { fetchLocations, fetchRate, submitQuoteLead, type Rate, type ServiceType } from '../lib/api'
import { formatMoney, whatsappLink } from '../config'
import Reveal from './Reveal'

type Mode = 'FCL' | 'LCL' | 'AIR' | 'LAND'

const MODES: Array<{ key: Mode; types: ServiceType[] }> = [
  { key: 'FCL', types: ['FCL'] },
  { key: 'LCL', types: ['LCL'] },
  { key: 'AIR', types: ['AIR'] },
  { key: 'LAND', types: ['LAND_FTL', 'LAND_LCL'] },
]

const CONTAINER_TYPES = ["20' Standard", "40' Standard", "40' High Cube"]
const VEHICLE_TYPES = ['1T VAN', '3T BOX TRUCK', '10T LORRY', '40FT TRAILER']

export default function QuoteCalculator() {
  const { t } = useTranslation()

  const [mode, setMode] = useState<Mode>('FCL')
  const [landLoad, setLandLoad] = useState<'FTL' | 'LCL'>('FTL')
  const [locations, setLocations] = useState<string[]>([])
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [currency, setCurrency] = useState<'MYR' | 'USD'>('MYR')

  const [containerType, setContainerType] = useState(CONTAINER_TYPES[0])
  const [vehicleType, setVehicleType] = useState(VEHICLE_TYPES[1])
  const [weight, setWeight] = useState('')
  const [volume, setVolume] = useState('')
  const [pieces, setPieces] = useState('1')
  const [length, setLength] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rate, setRate] = useState<Rate | null>(null)
  const [reference, setReference] = useState('')

  const [lead, setLead] = useState({ name: '', email: '', phone: '', company: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const serviceType: ServiceType = mode === 'LAND' ? `LAND_${landLoad}` : mode

  useEffect(() => {
    let cancelled = false
    fetchLocations(serviceType).then((list) => {
      if (!cancelled) setLocations(list)
    })
    return () => {
      cancelled = true
    }
  }, [serviceType])

  const volumetricWeight = useMemo(() => {
    const l = parseFloat(length)
    const w = parseFloat(width)
    const h = parseFloat(height)
    const p = parseInt(pieces) || 1
    if (!l || !w || !h) return 0
    return (l * w * h * p) / 6000
  }, [length, width, height, pieces])

  const cbmFromDims = useMemo(() => {
    const l = parseFloat(length)
    const w = parseFloat(width)
    const h = parseFloat(height)
    const p = parseInt(pieces) || 1
    if (!l || !w || !h) return 0
    return (l * w * h * p) / 1_000_000
  }, [length, width, height, pieces])

  const swap = () => {
    const tmp = origin
    setOrigin(destination)
    setDestination(tmp)
  }

  const calculate = async () => {
    setError('')
    setRate(null)
    setSubmitted(false)
    if (!origin || !destination) {
      setError(t('quote.errorLocations'))
      return
    }
    if (origin === destination) {
      setError(t('quote.errorSame'))
      return
    }
    setLoading(true)
    try {
      const params: any = { origin, destination, type: serviceType, currency }
      if (mode === 'FCL') params.containerType = containerType
      if (mode === 'LAND' && landLoad === 'FTL') params.vehicleType = vehicleType
      if (mode === 'LCL' || (mode === 'LAND' && landLoad === 'LCL')) {
        params.weight = parseFloat(weight) || 0
        params.volume = parseFloat(volume) || undefined
      }
      if (mode === 'AIR') {
        params.weight = parseFloat(weight) || 0
        params.pieces = parseInt(pieces) || 1
        if (parseFloat(length) && parseFloat(width) && parseFloat(height)) {
          params.length = parseFloat(length)
          params.width = parseFloat(width)
          params.height = parseFloat(height)
        }
      }
      const result = await fetchRate(params)
      setRate(result)
    } catch (err: any) {
      setError(err.message || t('quote.errorGeneric'))
    } finally {
      setLoading(false)
    }
  }

  const lockRate = async () => {
    if (!rate) return
    setSubmitting(true)
    setError('')
    try {
      const res = await submitQuoteLead({
        ...lead,
        origin,
        destination,
        serviceType,
        price: rate.price,
        currency: rate.currency,
        transitTime: rate.transitTime,
        weight: parseFloat(weight) || undefined,
        volume: parseFloat(volume) || cbmFromDims || undefined,
        containerType: mode === 'FCL' ? containerType : undefined,
        vehicleType: mode === 'LAND' && landLoad === 'FTL' ? vehicleType : undefined,
      })
      setReference(res.reference)
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || t('quote.errorGeneric'))
    } finally {
      setSubmitting(false)
    }
  }

  const whatsappMessage = rate
    ? `${t('quote.waGreeting')} ${reference ? `[${reference}] ` : ''}${origin} → ${destination} (${serviceType}) — ${formatMoney(
        rate.price,
        rate.currency,
      )}, ${t('quote.transitLabel')} ${rate.transitTime} ${t('quote.days')}. ${lead.name ? `${t('quote.waName')}: ${lead.name}.` : ''}`
    : ''

  const inputCls =
    'w-full rounded-xl border border-white/10 bg-navy-800/80 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-amber-brand/60 focus:ring-2 focus:ring-amber-brand/20'
  const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400'

  return (
    <section id="quote" className="relative overflow-hidden bg-navy-900 py-24">
      <div className="grid-pattern absolute inset-0 opacity-60" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-amber-brand">
              {t('quote.badge')}
            </span>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-5xl">{t('quote.title')}</h2>
            <p className="mt-4 text-slate-400">{t('quote.subtitle')}</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-navy-950/80 shadow-2xl shadow-black/40 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5">
              <div className="flex flex-wrap gap-2">
                {MODES.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => {
                      setMode(m.key)
                      setRate(null)
                    }}
                    className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
                      mode === m.key
                        ? 'bg-amber-brand text-navy-950 shadow-lg shadow-amber-brand/25'
                        : 'border border-white/10 text-slate-300 hover:border-amber-brand/50 hover:text-amber-brand'
                    }`}
                  >
                    {t(`quote.modes.${m.key}`)}
                  </button>
                ))}
              </div>
              <div className="flex overflow-hidden rounded-full border border-white/15 text-xs font-bold">
                {(['MYR', 'USD'] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`px-3.5 py-1.5 transition ${currency === c ? 'bg-amber-brand text-navy-950' : 'text-slate-300 hover:bg-white/10'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {mode === 'LAND' && (
              <div className="flex gap-2 border-b border-white/10 px-5 py-3">
                {(['FTL', 'LCL'] as const).map((load) => (
                  <button
                    key={load}
                    onClick={() => {
                      setLandLoad(load)
                      setRate(null)
                    }}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                      landLoad === load ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t(`quote.land.${load}`)}
                  </button>
                ))}
              </div>
            )}

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
              <div>
                <label className={labelCls}>{t('quote.origin')}</label>
                <input
                  list="arg-locations"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder={t('quote.originPlaceholder')}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>{t('quote.destination')}</label>
                <div className="flex gap-2">
                  <input
                    list="arg-locations"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder={t('quote.destinationPlaceholder')}
                    className={inputCls}
                  />
                  <button
                    onClick={swap}
                    className="shrink-0 rounded-xl border border-white/10 px-3 text-slate-300 transition hover:border-amber-brand/50 hover:text-amber-brand"
                    aria-label="Swap"
                    title={t('quote.swap')}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </button>
                </div>
              </div>
              <datalist id="arg-locations">
                {locations.map((loc) => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>

              {mode === 'FCL' && (
                <div className="sm:col-span-2">
                  <label className={labelCls}>{t('quote.container')}</label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {CONTAINER_TYPES.map((c) => (
                      <button
                        key={c}
                        onClick={() => setContainerType(c)}
                        className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                          containerType === c
                            ? 'border-amber-brand bg-amber-brand/10 text-amber-brand'
                            : 'border-white/10 text-slate-300 hover:border-white/30'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mode === 'LAND' && landLoad === 'FTL' && (
                <div className="sm:col-span-2">
                  <label className={labelCls}>{t('quote.vehicle')}</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {VEHICLE_TYPES.map((v) => (
                      <button
                        key={v}
                        onClick={() => setVehicleType(v)}
                        className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                          vehicleType === v
                            ? 'border-amber-brand bg-amber-brand/10 text-amber-brand'
                            : 'border-white/10 text-slate-300 hover:border-white/30'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(mode === 'LCL' || mode === 'AIR' || (mode === 'LAND' && landLoad === 'LCL')) && (
                <>
                  <div>
                    <label className={labelCls}>{t('quote.weight')}</label>
                    <input
                      type="number"
                      min="0"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="e.g. 250"
                      className={inputCls}
                    />
                  </div>
                  {(mode === 'LCL' || (mode === 'LAND' && landLoad === 'LCL')) && (
                    <div>
                      <label className={labelCls}>{t('quote.volume')}</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(e.target.value)}
                        placeholder="e.g. 1.5"
                        className={inputCls}
                      />
                    </div>
                  )}
                </>
              )}

              {(mode === 'AIR' || mode === 'LCL') && (
                <>
                  <div>
                    <label className={labelCls}>{t('quote.pieces')}</label>
                    <input
                      type="number"
                      min="1"
                      value={pieces}
                      onChange={(e) => setPieces(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>
                      {t('quote.dimensions')} <span className="normal-case text-slate-500">(L × W × H, cm)</span>
                    </label>
                    <div className="flex gap-2">
                      <input type="number" min="0" value={length} onChange={(e) => setLength(e.target.value)} placeholder="L" className={inputCls} />
                      <input type="number" min="0" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="W" className={inputCls} />
                      <input type="number" min="0" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="H" className={inputCls} />
                    </div>
                  </div>
                </>
              )}
            </div>

            {(volumetricWeight > 0 || cbmFromDims > 0) && mode !== 'FCL' && (
              <div className="mx-5 mb-4 flex flex-wrap gap-3 rounded-xl bg-white/5 px-4 py-3 text-xs text-slate-300 sm:mx-7">
                {volumetricWeight > 0 && (
                  <span>
                    {t('quote.volumetric')}: <strong className="text-amber-brand">{volumetricWeight.toFixed(1)} kg</strong>
                  </span>
                )}
                {cbmFromDims > 0 && (
                  <span>
                    {t('quote.cbmFromDims')}: <strong className="text-amber-brand">{cbmFromDims.toFixed(2)} CBM</strong>
                  </span>
                )}
              </div>
            )}

            <div className="px-5 pb-7 sm:px-7">
              <button
                onClick={calculate}
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-amber-brand to-orange-500 py-4 text-sm font-black uppercase tracking-widest text-navy-950 shadow-xl shadow-amber-brand/25 transition hover:brightness-110 disabled:opacity-60"
              >
                {loading ? t('quote.calculating') : t('quote.calculate')}
              </button>
              {error && <p className="mt-3 text-center text-sm text-red-400">{error}</p>}
            </div>

            <AnimatePresence>
              {rate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden border-t border-amber-brand/20 bg-gradient-to-b from-amber-brand/5 to-transparent"
                >
                  <div className="p-5 sm:p-7">
                    {!submitted ? (
                      <div className="grid gap-8 lg:grid-cols-2">
                        <div>
                          <div className="flex items-baseline justify-between">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                              {t('quote.estimate')}
                            </span>
                            <span className="rounded-full bg-amber-brand/15 px-3 py-1 text-[11px] font-bold text-amber-brand">
                              {t('quote.indicative')}
                            </span>
                          </div>
                          <div className="mt-2 text-5xl font-black text-white">
                            {formatMoney(rate.price, rate.currency)}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
                            <span className="rounded-full bg-white/5 px-3 py-1">
                              {t('quote.transitLabel')} <strong className="text-white">{rate.transitTime} {t('quote.days')}</strong>
                            </span>
                            <span className="rounded-full bg-white/5 px-3 py-1">
                              {t('quote.validUntil')} <strong className="text-white">{rate.cutoff}</strong>
                            </span>
                          </div>

                          <div className="mt-6 space-y-2 rounded-2xl border border-white/10 bg-navy-900/60 p-5 text-sm">
                            <div className="flex justify-between text-slate-400">
                              <span>{t('quote.breakdown.base')}</span>
                              <span className="text-white">{formatMoney(rate.breakdown.base, rate.currency)}</span>
                            </div>
                            {rate.breakdown.chargeableWeightKg !== undefined && (
                              <div className="flex justify-between text-slate-400">
                                <span>{t('quote.breakdown.chargeable')}</span>
                                <span className="text-white">{rate.breakdown.chargeableWeightKg} kg</span>
                              </div>
                            )}
                            {rate.breakdown.volumeCbm !== undefined && (
                              <div className="flex justify-between text-slate-400">
                                <span>{t('quote.breakdown.volume')}</span>
                                <span className="text-white">{rate.breakdown.volumeCbm} CBM</span>
                              </div>
                            )}
                            <div className="flex justify-between text-slate-400">
                              <span>{t('quote.breakdown.distance')}</span>
                              <span className="text-white">{rate.breakdown.distanceKm.toLocaleString()} km</span>
                            </div>
                            {rate.breakdown.fuelFactor > 1 && (
                              <div className="flex justify-between text-slate-400">
                                <span>{t('quote.breakdown.fuel')}</span>
                                <span className="text-white">×{rate.breakdown.fuelFactor.toFixed(2)}</span>
                              </div>
                            )}
                            {rate.breakdown.laneFactor !== 1 && (
                              <div className="flex justify-between text-slate-400">
                                <span>{t('quote.breakdown.lane')}</span>
                                <span className="text-white">×{rate.breakdown.laneFactor.toFixed(2)}</span>
                              </div>
                            )}
                            {rate.breakdown.seasonFactor !== 1 && (
                              <div className="flex justify-between text-slate-400">
                                <span>{t('quote.breakdown.season')}</span>
                                <span className="text-white">×{rate.breakdown.seasonFactor.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="border-t border-white/10 pt-2" />
                            <div className="flex justify-between text-slate-400">
                              <span>{t('quote.breakdown.subtotal')}</span>
                              <span className="text-white">{formatMoney(rate.breakdown.subtotal, rate.currency)}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>{t('quote.breakdown.service', { percent: rate.breakdown.markupPercent })}</span>
                              <span className="text-white">{formatMoney(rate.breakdown.markupAmount, rate.currency)}</span>
                            </div>
                            <div className="flex justify-between text-base font-black text-amber-brand">
                              <span>{t('quote.breakdown.total')}</span>
                              <span>{formatMoney(rate.price, rate.currency)}</span>
                            </div>
                          </div>
                          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">{t('quote.disclaimer')}</p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-navy-900/60 p-5">
                          <h3 className="text-lg font-bold text-white">{t('quote.lockTitle')}</h3>
                          <p className="mt-1 text-xs text-slate-400">{t('quote.lockSubtitle')}</p>
                          <div className="mt-4 space-y-3">
                            <input value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} placeholder={t('quote.form.name')} className={inputCls} />
                            <input value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} placeholder={t('quote.form.email')} type="email" className={inputCls} />
                            <input value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} placeholder={t('quote.form.phone')} type="tel" className={inputCls} />
                            <input value={lead.company} onChange={(e) => setLead({ ...lead, company: e.target.value })} placeholder={t('quote.form.company')} className={inputCls} />
                            <textarea value={lead.message} onChange={(e) => setLead({ ...lead, message: e.target.value })} placeholder={t('quote.form.message')} rows={3} className={inputCls} />
                            <button
                              onClick={lockRate}
                              disabled={submitting || !lead.name || !lead.email || !lead.phone}
                              className="w-full rounded-xl bg-amber-brand py-3.5 text-sm font-black uppercase tracking-widest text-navy-950 transition hover:bg-amber-brand-light disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {submitting ? t('quote.form.submitting') : t('quote.form.submit')}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-brand/15">
                          <svg className="h-8 w-8 text-amber-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h3 className="mt-4 text-2xl font-black text-white">{t('quote.successTitle')}</h3>
                        <p className="mt-2 text-sm text-slate-400">
                          {t('quote.successSubtitle')} <span className="font-bold text-amber-brand">{reference}</span>
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                          <a
                            href={whatsappLink(whatsappMessage)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-green-500/25 transition hover:brightness-110"
                          >
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            {t('quote.successWhatsapp')}
                          </a>
                          <button
                            onClick={() => {
                              setRate(null)
                              setSubmitted(false)
                              setLead({ name: '', email: '', phone: '', company: '', message: '' })
                            }}
                            className="rounded-full border border-white/20 px-7 py-3 text-sm font-bold text-slate-300 transition hover:border-amber-brand hover:text-amber-brand"
                          >
                            {t('quote.successNew')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
