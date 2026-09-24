export type QuoteMode = 'FCL' | 'LCL' | 'AIR' | 'LAND'

type Listener = (mode: QuoteMode) => void

const listeners = new Set<Listener>()

export function requestQuoteMode(mode: QuoteMode) {
  listeners.forEach((cb) => cb(mode))
}

export function onQuoteModeRequest(cb: Listener): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
