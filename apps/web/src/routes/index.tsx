import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '#/components/landing/Navbar'
import { HeroSection } from '#/components/landing/HeroSection'
import { EventTypes } from '#/components/landing/EventTypes'
import { BeforeAfter } from '#/components/landing/BeforeAfter'
import { HowItWorks } from '#/components/landing/HowItWorks'
import { FeatureGrid } from '#/components/landing/FeatureGrid'
// import { ProposalCards } from '#/components/landing/ProposalCards'
import { ComparisonTable } from '#/components/landing/ComparisonTable'
import { AIAnalysis } from '#/components/landing/AIAnalysis'
import { StatsBar } from '#/components/landing/StatsBar'
import { Testimonials } from '#/components/landing/Testimonials'
import { ForVenues } from '#/components/landing/ForVenues'
import { CTABanner } from '#/components/landing/CTABanner'
import { FAQ } from '#/components/landing/FAQ'
import { Footer } from '#/components/landing/Footer'

export const Route = createFileRoute('/')({ component: LandingPage })

function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <EventTypes />
        <BeforeAfter />
        <HowItWorks />
        <FeatureGrid />
        {/* <ProposalCards /> */}
        <ComparisonTable />
        <AIAnalysis />
        <StatsBar />
        <Testimonials />
        <ForVenues />
        <CTABanner />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
