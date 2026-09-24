/**
 * ARG Logistics pricing engine.
 * Ported from the proven vcanfreight distance-based estimator (lib/rates.ts)
 * and localized for Malaysia: MYR rate cards, Malaysian ports/cities, and a
 * land-trucking mode for West Malaysia / Singapore. No external rate API —
 * estimates are indicative; ARG confirms the official quotation per shipment.
 *
 * All location keys are UPPERCASE with SPACE separators. Inputs are
 * normalized (first segment before comma, underscores→spaces, aliases) per mode.
 */

export type ServiceType = 'FCL' | 'LCL' | 'AIR' | 'LAND_FTL' | 'LAND_LCL'

export interface RateBreakdown {
  base: number
  distanceKm: number
  chargeableWeightKg?: number
  volumeCbm?: number
  fuelFactor: number
  laneFactor: number
  seasonFactor: number
  subtotal: number
  markupPercent: number
  markupAmount: number
}

export interface RateResult {
  price: number
  currency: 'MYR' | 'USD'
  transitTime: number
  carrier: string
  validUntil: string
  isEstimate: boolean
  needsPartnerQuote: boolean
  breakdown: RateBreakdown
}

export interface RateQuoteOptions {
  volume?: number
  containerType?: string
  vehicleType?: string
  pieces?: number
  dimensions?: { length: number; width: number; height: number }
  date?: string
}

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

const KM_TO_NM = 0.539956803
const FUEL_ADJUSTMENT_FACTOR = 1.2
const PEAK_SEASON_MONTHS = [7, 8, 9, 10]
const MYR_PER_USD = 4.7

const SEA_PORTS: Record<string, { lat: number; lng: number }> = {
  // Malaysia
  'PORT KLANG': { lat: 3.0, lng: 101.39 },
  PENANG: { lat: 5.42, lng: 100.34 },
  'PASIR GUDANG': { lat: 1.47, lng: 103.9 },
  'TANJUNG PELEPAS': { lat: 1.37, lng: 103.55 },
  KUCHING: { lat: 1.62, lng: 110.39 },
  BINTULU: { lat: 3.17, lng: 113.03 },
  'KOTA KINABALU': { lat: 5.98, lng: 116.07 },
  LABUAN: { lat: 5.28, lng: 115.24 },
  // Regional
  SINGAPORE: { lat: 1.26, lng: 103.82 },
  SHANGHAI: { lat: 31.4, lng: 121.5 },
  NINGBO: { lat: 29.87, lng: 121.56 },
  SHENZHEN: { lat: 22.55, lng: 114.06 },
  GUANGZHOU: { lat: 23.13, lng: 113.26 },
  QINGDAO: { lat: 36.07, lng: 120.38 },
  'HONG KONG': { lat: 22.3, lng: 114.17 },
  BUSAN: { lat: 35.18, lng: 129.08 },
  KAOHSIUNG: { lat: 22.57, lng: 120.28 },
  TOKYO: { lat: 35.65, lng: 139.84 },
  YOKOHAMA: { lat: 35.44, lng: 139.64 },
  BANGKOK: { lat: 13.76, lng: 100.5 },
  'LAEM CHABANG': { lat: 13.08, lng: 100.88 },
  'HO CHI MINH': { lat: 10.8, lng: 106.7 },
  'TANJUNG PRIOK': { lat: -6.1, lng: 106.87 },
  JAKARTA: { lat: -6.1, lng: 106.87 },
  MANILA: { lat: 14.58, lng: 120.97 },
  COLOMBO: { lat: 6.94, lng: 79.84 },
  CHENNAI: { lat: 13.1, lng: 80.29 },
  MUMBAI: { lat: 18.95, lng: 72.84 },
  'NHAVA SHEVA': { lat: 18.95, lng: 72.95 },
  KARACHI: { lat: 24.86, lng: 67.0 },
  JEDDAH: { lat: 21.49, lng: 39.19 },
  DUBAI: { lat: 25.25, lng: 55.27 },
  HAMBURG: { lat: 53.55, lng: 9.97 },
  ROTTERDAM: { lat: 51.92, lng: 4.48 },
  ANTWERP: { lat: 51.35, lng: 4.4 },
  FELIXSTOWE: { lat: 51.96, lng: 1.35 },
  SOUTHAMPTON: { lat: 50.9, lng: -1.4 },
  'LE HAVRE': { lat: 49.49, lng: 0.11 },
  BARCELONA: { lat: 41.35, lng: 2.17 },
  GENOA: { lat: 44.41, lng: 8.93 },
  PIRAEUS: { lat: 37.94, lng: 23.63 },
  ISTANBUL: { lat: 41.01, lng: 28.98 },
  LAGOS: { lat: 6.45, lng: 3.39 },
  DURBAN: { lat: -29.87, lng: 31.03 },
  'CAPE TOWN': { lat: -33.9, lng: 18.43 },
  SYDNEY: { lat: -33.86, lng: 151.21 },
  MELBOURNE: { lat: -37.84, lng: 144.94 },
  AUCKLAND: { lat: -36.84, lng: 174.77 },
  'LOS ANGELES': { lat: 33.72, lng: -118.28 },
  'LONG BEACH': { lat: 33.75, lng: -118.19 },
  OAKLAND: { lat: 37.8, lng: -122.3 },
  SEATTLE: { lat: 47.6, lng: -122.34 },
  'NEW YORK': { lat: 40.67, lng: -74.04 },
  SAVANNAH: { lat: 32.08, lng: -81.09 },
  HOUSTON: { lat: 29.76, lng: -95.27 },
  MIAMI: { lat: 25.77, lng: -80.17 },
  VANCOUVER: { lat: 49.29, lng: -123.11 },
  MONTREAL: { lat: 45.5, lng: -73.55 },
  SANTOS: { lat: -23.95, lng: -46.3 },
  'BUENOS AIRES': { lat: -34.59, lng: -58.37 },
}

const AIRPORTS: Record<string, { lat: number; lng: number }> = {
  KUL: { lat: 2.75, lng: 101.71 },
  JHB: { lat: 1.64, lng: 103.67 },
  PEN: { lat: 5.3, lng: 100.28 },
  BKI: { lat: 5.94, lng: 116.05 },
  KCH: { lat: 1.48, lng: 110.34 },
  SIN: { lat: 1.36, lng: 103.99 },
  HKG: { lat: 22.31, lng: 113.92 },
  PVG: { lat: 31.14, lng: 121.81 },
  ICN: { lat: 37.46, lng: 126.44 },
  NRT: { lat: 35.77, lng: 140.39 },
  DXB: { lat: 25.25, lng: 55.36 },
  DOH: { lat: 25.26, lng: 51.57 },
  BOM: { lat: 19.09, lng: 72.87 },
  DEL: { lat: 28.56, lng: 77.1 },
  LHR: { lat: 51.47, lng: -0.46 },
  AMS: { lat: 52.31, lng: 4.77 },
  FRA: { lat: 50.04, lng: 8.57 },
  CDG: { lat: 49.01, lng: 2.55 },
  IST: { lat: 41.26, lng: 28.74 },
  JFK: { lat: 40.64, lng: -73.78 },
  ORD: { lat: 41.97, lng: -87.9 },
  ATL: { lat: 33.64, lng: -84.43 },
  MIA: { lat: 25.8, lng: -80.29 },
  LAX: { lat: 33.94, lng: -118.41 },
  GRU: { lat: -23.43, lng: -46.47 },
  SYD: { lat: -33.95, lng: 151.18 },
  MEL: { lat: -37.67, lng: 144.84 },
  AKL: { lat: -37.0, lng: 174.79 },
}

// Cities served by the land network (West Malaysia + Singapore).
const LAND_CITIES: Record<string, { lat: number; lng: number }> = {
  'KUALA LUMPUR': { lat: 3.14, lng: 101.69 },
  KLANG: { lat: 3.03, lng: 101.45 },
  'PORT KLANG': { lat: 3.0, lng: 101.39 },
  'SHAH ALAM': { lat: 3.07, lng: 101.52 },
  SUBANG: { lat: 3.06, lng: 101.58 },
  'PETALING JAYA': { lat: 3.11, lng: 101.6 },
  PUCHONG: { lat: 3.03, lng: 101.62 },
  PUTRAJAYA: { lat: 2.93, lng: 101.7 },
  CYBERJAYA: { lat: 2.92, lng: 101.65 },
  KAJANG: { lat: 2.99, lng: 101.79 },
  SEREMBAN: { lat: 2.73, lng: 101.94 },
  MELAKA: { lat: 2.19, lng: 102.25 },
  MUAR: { lat: 2.04, lng: 102.57 },
  'BATU PAHAT': { lat: 1.85, lng: 102.93 },
  'JOHOR BAHRU': { lat: 1.49, lng: 103.74 },
  'PASIR GUDANG': { lat: 1.47, lng: 103.9 },
  SENAI: { lat: 1.6, lng: 103.66 },
  KLUANG: { lat: 1.95, lng: 103.32 },
  IPOH: { lat: 4.6, lng: 101.07 },
  TAIPING: { lat: 4.85, lng: 100.73 },
  BUTTERWORTH: { lat: 5.42, lng: 100.34 },
  'GEORGE TOWN': { lat: 5.41, lng: 100.33 },
  PENANG: { lat: 5.42, lng: 100.34 },
  'BAYAN LEPAS': { lat: 5.28, lng: 100.26 },
  'SUNGAI PETANI': { lat: 5.65, lng: 100.49 },
  'ALOR SETAR': { lat: 6.12, lng: 100.37 },
  KANGAR: { lat: 6.44, lng: 100.2 },
  KUANTAN: { lat: 3.82, lng: 103.33 },
  KEMAMAN: { lat: 4.23, lng: 103.45 },
  'KOTA BHARU': { lat: 6.13, lng: 102.24 },
  'KUALA TERENGGANU': { lat: 5.33, lng: 103.14 },
  'KUALA LIPIS': { lat: 4.18, lng: 101.84 },
  RAUB: { lat: 3.79, lng: 101.86 },
  TEMERLOH: { lat: 3.45, lng: 102.42 },
  SINGAPORE: { lat: 1.35, lng: 103.82 },
}

const SEA_ALIASES: Record<string, string> = {
  KLANG: 'PORT KLANG',
  PORTKLANG: 'PORT KLANG',
  'KUALA LUMPUR': 'PORT KLANG',
  BUTTERWORTH: 'PENANG',
  PTP: 'TANJUNG PELEPAS',
  'JOHOR BAHRU': 'PASIR GUDANG',
  SENAI: 'PASIR GUDANG',
  KLIA: 'PORT KLANG',
}

const AIR_ALIASES: Record<string, string> = {
  'KUALA LUMPUR': 'KUL',
  KLIA: 'KUL',
  SEPANG: 'KUL',
  PENANG: 'PEN',
  BUTTERWORTH: 'PEN',
  'GEORGE TOWN': 'PEN',
  'JOHOR BAHRU': 'JHB',
  SENAI: 'JHB',
  'KOTA KINABALU': 'BKI',
  KUCHING: 'KCH',
  SINGAPORE: 'SIN',
  'HONG KONG': 'HKG',
  SHANGHAI: 'PVG',
}

const LAND_ALIASES: Record<string, string> = {
  'KOTA KINABALU': '',
  KUCHING: '',
  BINTULU: '',
  LABUAN: '',
}

const SYSTEM_CARRIER = 'ARG Logistics Estimated Service'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeLocation(value: string): string {
  const trimmed = value.trim()
  const firstPart = trimmed.split(',')[0].trim().toUpperCase().replace(/_/g, ' ').replace(/\s+/g, ' ')
  return firstPart
}

function lookupCoords(location: string, mode: ServiceType): { lat: number; lng: number } | null {
  const key = normalizeLocation(location)
  if (mode === 'LAND_FTL' || mode === 'LAND_LCL') {
    const landKey = LAND_ALIASES[key] !== undefined ? (LAND_ALIASES[key] || null) : key
    return landKey ? (LAND_CITIES[landKey] || null) : null
  }
  if (mode === 'AIR') {
    const airKey = AIR_ALIASES[key] || key
    return AIRPORTS[airKey] || SEA_PORTS[airKey] || null
  }
  const seaKey = SEA_ALIASES[key] || key
  return SEA_PORTS[seaKey] || null
}

export function listLocations(mode: ServiceType): string[] {
  const source = mode === 'AIR' ? AIRPORTS : mode === 'LAND_FTL' || mode === 'LAND_LCL' ? LAND_CITIES : SEA_PORTS
  return Object.keys(source).sort()
}

export function isValidLocation(location: string, mode: ServiceType): boolean {
  return lookupCoords(location, mode) !== null
}

function getPortRegion(coords: { lat: number; lng: number } | null): string {
  if (!coords) return 'unknown'
  const { lat, lng } = coords
  if (lat >= 35 && lat <= 72 && lng >= -12 && lng <= 42) return 'europe'
  if (lat >= -12 && lat <= 48 && lng >= 60 && lng <= 155) return 'asia'
  if (lat >= 15 && lat <= 55 && lng >= -135 && lng <= -55) return 'northAmerica'
  if (lat >= -38 && lat <= 38 && lng >= -85 && lng <= -32) return 'southAmerica'
  if (lat >= -45 && lat <= -10 && lng >= 110 && lng <= 180) return 'oceania'
  if (lat >= -36 && lat <= 38 && lng >= -20 && lng <= 55) return 'africa'
  if (lat >= 12 && lat <= 32 && lng >= 35 && lng <= 60) return 'middleEast'
  return 'unknown'
}

function getTradeLaneFactor(origin: string, destination: string, mode: ServiceType): number {
  if (mode === 'LAND_FTL' || mode === 'LAND_LCL') return 1.0
  const fromRegion = getPortRegion(lookupCoords(origin, mode))
  const toRegion = getPortRegion(lookupCoords(destination, mode))
  if (fromRegion === 'europe' && toRegion === 'asia') return 1.05
  if (fromRegion === 'asia' && toRegion === 'europe') return 0.9
  if (
    (fromRegion === 'asia' && toRegion === 'northAmerica') ||
    (fromRegion === 'northAmerica' && toRegion === 'asia')
  ) {
    return 1.15
  }
  if (fromRegion === 'asia' && toRegion === 'asia') return 0.8
  return 1.0
}

function getSeasonalFactor(date?: string): number {
  const month = new Date(`${date || new Date().toISOString().split('T')[0]}T00:00:00Z`).getMonth()
  return PEAK_SEASON_MONTHS.includes(month) ? 1.1 : 1.0
}

function roundToNearest(value: number, nearest = 50): number {
  return Math.round(value / nearest) * nearest
}

function getMarkupPercent(env?: any): number {
  const raw = env?.MARKUP_PERCENT ?? (globalThis as any).process?.env?.MARKUP_PERCENT
  const pct = raw ? parseFloat(String(raw)) : 8
  return Number.isFinite(pct) && pct > 0 ? pct : 8
}

function getMyrPerUsd(env?: any): number {
  const raw = env?.MYR_PER_USD ?? (globalThis as any).process?.env?.MYR_PER_USD
  const rate = raw ? parseFloat(String(raw)) : MYR_PER_USD
  return Number.isFinite(rate) && rate > 0 ? rate : MYR_PER_USD
}

function haversineKm(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
  const R = 6371
  const dLat = ((to.lat - from.lat) * Math.PI) / 180
  const dLng = ((to.lng - from.lng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function estimateTransitTime(serviceType: ServiceType, distanceKm: number): number {
  if (serviceType === 'AIR') {
    if (distanceKm < 2000) return 2
    if (distanceKm < 6000) return 4
    if (distanceKm < 12000) return 7
    return 10
  }
  if (serviceType === 'LAND_FTL' || serviceType === 'LAND_LCL') {
    if (distanceKm < 150) return 1
    if (distanceKm < 450) return 2
    if (distanceKm < 800) return 3
    return 4
  }
  if (serviceType === 'LCL') {
    if (distanceKm < 2000) return 14
    if (distanceKm < 6000) return 24
    if (distanceKm < 12000) return 35
    return 45
  }
  if (distanceKm < 2000) return 10
  if (distanceKm < 6000) return 18
  if (distanceKm < 12000) return 28
  return 38
}

function buildResult(
  priceMyr: number,
  breakdown: Omit<RateBreakdown, 'subtotal' | 'markupAmount' | 'markupPercent'>,
  env: any,
  currency: 'MYR' | 'USD',
  transitTime: number,
): RateResult {
  const markupPercent = getMarkupPercent(env)
  const withMarkup = priceMyr * (1 + markupPercent / 100)
  const subtotal = roundToNearest(priceMyr)
  const totalMyr = roundToNearest(withMarkup)
  const rate = getMyrPerUsd(env)
  const price = currency === 'USD' ? roundToNearest(totalMyr / rate, 10) : totalMyr
  return {
    price,
    currency,
    transitTime,
    carrier: SYSTEM_CARRIER,
    validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isEstimate: true,
    needsPartnerQuote: true,
    breakdown: {
      ...breakdown,
      subtotal,
      markupPercent,
      markupAmount: totalMyr - subtotal,
    },
  }
}

// ---------------------------------------------------------------------------
// Mode calculators (prices in MYR)
// ---------------------------------------------------------------------------

function quoteFcl(origin: string, destination: string, options: RateQuoteOptions, env: any, currency: 'MYR' | 'USD'): RateResult {
  const from = lookupCoords(origin, 'FCL')!
  const to = lookupCoords(destination, 'FCL')!
  const distanceKm = haversineKm(from, to)
  const distanceNm = distanceKm * KM_TO_NM
  const is40 = (options.containerType || '').toUpperCase().includes('40')
  const baseRatePerNm = is40 ? 0.45 : 0.31
  const laneFactor = getTradeLaneFactor(origin, destination, 'FCL')
  const seasonFactor = getSeasonalFactor(options.date)
  const base = distanceNm * baseRatePerNm
  const price = base * FUEL_ADJUSTMENT_FACTOR * laneFactor * seasonFactor
  return buildResult(
    price,
    {
      base: roundToNearest(base),
      distanceKm: Math.round(distanceKm),
      fuelFactor: FUEL_ADJUSTMENT_FACTOR,
      laneFactor,
      seasonFactor,
    },
    env,
    currency,
    estimateTransitTime('FCL', distanceKm),
  )
}

function quoteLcl(origin: string, destination: string, weight: number, options: RateQuoteOptions, env: any, currency: 'MYR' | 'USD'): RateResult {
  const from = lookupCoords(origin, 'LCL')!
  const to = lookupCoords(destination, 'LCL')!
  const distanceKm = haversineKm(from, to)
  const volume = Math.max(options.volume || weight / 1000, 0.5)
  const laneFactor = getTradeLaneFactor(origin, destination, 'LCL')
  const seasonFactor = getSeasonalFactor(options.date)
  const base = Math.max(590, volume * 685 + weight * 3.5 + distanceKm * 0.055)
  const price = base * laneFactor * seasonFactor
  return buildResult(
    price,
    {
      base: roundToNearest(base),
      distanceKm: Math.round(distanceKm),
      volumeCbm: Math.round(volume * 100) / 100,
      fuelFactor: 1,
      laneFactor,
      seasonFactor,
    },
    env,
    currency,
    estimateTransitTime('LCL', distanceKm),
  )
}

function quoteAir(origin: string, destination: string, weight: number, options: RateQuoteOptions, env: any, currency: 'MYR' | 'USD'): RateResult {
  const from = lookupCoords(origin, 'AIR')!
  const to = lookupCoords(destination, 'AIR')!
  const distanceKm = haversineKm(from, to)
  const volumetric =
    options.dimensions && options.pieces
      ? ((options.dimensions.length * options.dimensions.width * options.dimensions.height) / 6000) * options.pieces
      : 0
  const chargeableWeight = Math.max(weight, volumetric, 45)
  const laneFactor = getTradeLaneFactor(origin, destination, 'AIR')
  const seasonFactor = getSeasonalFactor(options.date)
  const base = Math.max(2100, chargeableWeight * 21 + distanceKm * 0.07)
  const price = base * laneFactor * seasonFactor
  return buildResult(
    price,
    {
      base: roundToNearest(base),
      distanceKm: Math.round(distanceKm),
      chargeableWeightKg: Math.round(chargeableWeight * 10) / 10,
      fuelFactor: 1,
      laneFactor,
      seasonFactor,
    },
    env,
    currency,
    estimateTransitTime('AIR', distanceKm),
  )
}

const VEHICLE_RATES: Record<string, { ratePerKm: number; minimum: number }> = {
  '1T VAN': { ratePerKm: 3.0, minimum: 130 },
  '3T BOX TRUCK': { ratePerKm: 4.2, minimum: 220 },
  '10T LORRY': { ratePerKm: 6.5, minimum: 480 },
  '40FT TRAILER': { ratePerKm: 9.5, minimum: 850 },
}

function quoteLandFtl(origin: string, destination: string, options: RateQuoteOptions, env: any, currency: 'MYR' | 'USD'): RateResult {
  const from = lookupCoords(origin, 'LAND_FTL')!
  const to = lookupCoords(destination, 'LAND_FTL')!
  const distanceKm = haversineKm(from, to)
  const vehicle = VEHICLE_RATES[options.vehicleType || ''] || VEHICLE_RATES['3T BOX TRUCK']
  const seasonFactor = getSeasonalFactor(options.date)
  const base = Math.max(vehicle.minimum, distanceKm * vehicle.ratePerKm)
  const price = base * seasonFactor
  return buildResult(
    price,
    {
      base: roundToNearest(base),
      distanceKm: Math.round(distanceKm),
      fuelFactor: 1,
      laneFactor: 1,
      seasonFactor,
    },
    env,
    currency,
    estimateTransitTime('LAND_FTL', distanceKm),
  )
}

function quoteLandLcl(origin: string, destination: string, weight: number, options: RateQuoteOptions, env: any, currency: 'MYR' | 'USD'): RateResult {
  const from = lookupCoords(origin, 'LAND_LCL')!
  const to = lookupCoords(destination, 'LAND_LCL')!
  const distanceKm = haversineKm(from, to)
  const volume = Math.max(options.volume || weight / 250, 0.2)
  const seasonFactor = getSeasonalFactor(options.date)
  const base = Math.max(350, volume * 190 + weight * 2.5 + distanceKm * 0.9)
  const price = base * seasonFactor
  return buildResult(
    price,
    {
      base: roundToNearest(base),
      distanceKm: Math.round(distanceKm),
      volumeCbm: Math.round(volume * 100) / 100,
      fuelFactor: 1,
      laneFactor: 1,
      seasonFactor,
    },
    env,
    currency,
    estimateTransitTime('LAND_LCL', distanceKm),
  )
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface QuoteRequest {
  origin: string
  destination: string
  type: ServiceType
  weight?: number
  volume?: number
  containerType?: string
  vehicleType?: string
  pieces?: number
  length?: number
  width?: number
  height?: number
  date?: string
  currency?: 'MYR' | 'USD'
}

export interface QuoteResponse {
  rates: Array<{
    id: string
    carrier: string
    price: number
    currency: string
    transitTime: number
    cutoff: string
    serviceType: ServiceType
    isEstimate: boolean
    needsPartnerQuote: boolean
    breakdown: RateBreakdown
  }>
}

export function getRate(req: QuoteRequest, env?: any): QuoteResponse {
  const { origin, destination, type } = req
  const currency = req.currency === 'USD' ? 'USD' : 'MYR'
  const weight = req.weight || 0
  const options: RateQuoteOptions = {
    volume: req.volume,
    containerType: req.containerType,
    vehicleType: req.vehicleType,
    pieces: req.pieces,
    dimensions:
      req.length && req.width && req.height ? { length: req.length, width: req.width, height: req.height } : undefined,
    date: req.date,
  }

  if (!isValidLocation(origin, type) || !isValidLocation(destination, type)) {
    const kind = type === 'LAND_FTL' || type === 'LAND_LCL' ? 'city (West Malaysia & Singapore only)' : 'port/airport'
    throw new Error(`Unknown ${kind} for ${type}. Valid options: ${listLocations(type).join(', ')}`)
  }

  let result: RateResult
  switch (type) {
    case 'FCL':
      result = quoteFcl(origin, destination, options, env, currency)
      break
    case 'LCL':
      result = quoteLcl(origin, destination, weight, options, env, currency)
      break
    case 'AIR':
      result = quoteAir(origin, destination, weight, options, env, currency)
      break
    case 'LAND_FTL':
      result = quoteLandFtl(origin, destination, options, env, currency)
      break
    case 'LAND_LCL':
      result = quoteLandLcl(origin, destination, weight, options, env, currency)
      break
    default:
      throw new Error(`Unsupported service type: ${type}`)
  }

  return {
    rates: [
      {
        id: `arg_${Date.now()}`,
        carrier: result.carrier,
        price: result.price,
        currency: result.currency,
        transitTime: result.transitTime,
        cutoff: result.validUntil,
        serviceType: type,
        isEstimate: result.isEstimate,
        needsPartnerQuote: result.needsPartnerQuote,
        breakdown: result.breakdown,
      },
    ],
  }
}
