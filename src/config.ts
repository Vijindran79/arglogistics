export const SITE = {
  name: 'ARG Logistics',
  tagline: 'Freight Forwarding Malaysia',
  whatsappNumber: '60123838776',
  whatsappDisplay: '+60 12-383 8776',
  contactEmail: 'anna@arglogistics.com.my',
  ownerEmail: 'vg@vcanresources.com',
  address: 'No 3A, Jalan BPU 2, Bandar Puchong Utama, 47100 Puchong, Selangor Darul Ehsan, Malaysia',
  hours: 'Mon–Fri 9:00–18:00 · Sat 9:00–13:00 (MYT)',
}

export function whatsappLink(message: string): string {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`
}

export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}
