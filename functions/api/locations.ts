import { listLocations, type ServiceType } from '../lib/engine'

const SERVICE_TYPES: ServiceType[] = ['FCL', 'LCL', 'AIR', 'LAND_FTL', 'LAND_LCL']

export const onRequestGet: PagesFunction = async ({ request }) => {
  const url = new URL(request.url)
  const type = (url.searchParams.get('type') || 'FCL').toUpperCase() as ServiceType
  const locations = SERVICE_TYPES.includes(type) ? listLocations(type) : []
  return new Response(JSON.stringify({ type, locations }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
