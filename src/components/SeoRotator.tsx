import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const PHRASES = [
  'Sea Freight Malaysia',
  'Air Freight Kuala Lumpur',
  'Customs Clearance Port Klang',
  'Amazon FBA Prep Selangor',
  'LCL Shipping Penang',
  'FCL Container Shipping',
  'Door to Door Delivery Malaysia',
  'Freight Forwarder Puchong',
  'Land Transport Malaysia',
  'Warehouse Storage Selangor',
  'Import Export Malaysia',
  'Shipping Agent Johor Bahru',
  'Cargo Insurance Malaysia',
  'Express Air Cargo KLIA',
  'Sea Freight East Malaysia',
  'Project Cargo Handling',
  'Palletised Distribution',
  'Last Mile Delivery Klang Valley',
  'Freight Quote Online',
  'Customs Broker Malaysia',
  'Reefer Container Shipping',
  'Dangerous Goods Freight',
  'Cross Border Trucking Thailand',
  'Ecommerce Logistics Malaysia',
]

export default function SeoRotator() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % PHRASES.length)
    }, 4000)
    return () => clearInterval(id)
  }, [])

  return (
    <section aria-label="Freight services keywords" className="border-y border-line/10 bg-panel py-5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-[13px] leading-7">
          <span className="mr-2 font-bold uppercase tracking-widest text-ink-soft">Trusted for</span>
          {PHRASES.map((phrase, i) => (
            <span key={phrase} className="inline">
              <motion.span
                animate={i === active ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className={`inline-block cursor-default rounded-full px-1.5 transition-colors duration-500 ${
                  i === active ? 'font-bold text-amber-brand' : 'text-ink-faint'
                }`}
              >
                {phrase}
              </motion.span>
              {i < PHRASES.length - 1 && <span className="text-ink-faint/40"> · </span>}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}
