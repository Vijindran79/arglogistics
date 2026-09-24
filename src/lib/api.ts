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

export interface Rate {
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
}

export interface QuoteParams {
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
  currency?: 'MYR' | 'USD'
}

export async function fetchLocations(type: ServiceType): Promise<string[]> {
  const res = await fetch(`/api/locations?type=${type}`)
  if (!res.ok) return []
  const data: any = await res.json()
  return data.locations || []
}

export async function fetchRate(params: QuoteParams): Promise<Rate> {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') qs.set(key, String(value))
  })
  const res = await fetch(`/api/rates?${qs.toString()}`)
  const data: any = await res.json()
  if (!res.ok) throw new Error(data.error || 'Rate calculation failed')
  return data.rates[0]
}

export interface QuoteLead {
  name: string
  email: string
  phone: string
  company?: string
  origin: string
  destination: string
  serviceType: string
  price?: number
  currency?: string
  transitTime?: number
  weight?: number
  volume?: number
  containerType?: string
  vehicleType?: string
  message?: string
}

export async function submitQuoteLead(lead: QuoteLead): Promise<{ ok: boolean; emailed: boolean; reference: string }> {
  const res = await fetch('/api/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead),
  })
  const data: any = await res.json()
  if (!res.ok) throw new Error(data.error || 'Submission failed')
  return data
}
