import { Suspense } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Services from './components/Services'
import QuoteCalculator from './components/QuoteCalculator'
import Schedules from './components/Schedules'
import Coverage from './components/Coverage'
import WhyUs from './components/WhyUs'
import Contact from './components/Contact'
import Footer from './components/Footer'
import FloatingWhatsApp from './components/FloatingWhatsApp'

function Loader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-brand border-t-transparent" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <div className="min-h-screen bg-navy-950 font-sans text-white antialiased">
        <Navbar />
        <main>
          <Hero />
          <Services />
          <QuoteCalculator />
          <Schedules />
          <Coverage />
          <WhyUs />
          <Contact />
        </main>
        <Footer />
        <FloatingWhatsApp />
      </div>
    </Suspense>
  )
}
