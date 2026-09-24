import { getRate, listLocations, type ServiceType } from '../lib/engine'

const SERVICE_TYPES: ServiceType[] = ['FCL', 'LCL', 'AIR', 'LAND_FTL', 'LAND_LCL']

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const onRequestGet: PagesFunction = async ({ request, env }) => {
  const url = new URL(request.url)
  const origin = url.searchParams.get('origin')
  const destination = url.searchParams.get('destination')
  const type = (url.searchParams.get('type') || 'FCL').toUpperCase() as ServiceType
  const currency = url.searchParams.get('currency') === 'USD' ? 'USD' : 'MYR'

  if (!origin || !destination) {
    return json({ error: 'origin and destination are required' }, 400)
  }
  if (!SERVICE_TYPES.includes(type)) {
    return json({ error: `type must be one of ${SERVICE_TYPES.join(', ')}` }, 400)
  }

  const num = (name: string) => {
    const raw = url.searchParams.get(name)
    return raw ? parseFloat(raw) : undefined
  }
  const int = (name: string) => {
    const raw = url.searchParams.get(name)
    return raw ? parseInt(raw, 10) : undefined
  }

  try {
    const result = getRate(
      {
        origin,
        destination,
        type,
        currency,
        weight: num('weight'),
        volume: num('volume'),
        containerType: url.searchParams.get('containerType') || undefined,
        vehicleType: url.searchParams.get('vehicleType') || undefined,
        pieces: int('pieces'),
        length: num('length'),
        width: num('width'),
        height: num('height'),
        date: url.searchParams.get('date') || undefined,
      },
      env,
    )
    return json(result)
  } catch (err: any) {
    return json({ error: err?.message || 'Failed to calculate rate' }, 400)
  }
}

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })

export { listLocations }
