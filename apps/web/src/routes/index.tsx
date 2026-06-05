import { createFileRoute } from '@tanstack/react-router'
import { meQuery } from '#/server/auth'
import { redirectAuthenticatedHome } from '#/lib/auth-redirect'
import { SITE_URL, landingJsonLd, landingMeta } from '#/lib/seo'
import { Navbar } from '#/components/landing/Navbar'
import { HeroSection } from '#/components/landing/HeroSection'
import { EventTypes } from '#/components/landing/EventTypes'
import { BeforeAfter } from '#/components/landing/BeforeAfter'
import { HowItWorks } from '#/components/landing/HowItWorks'
import { FeatureGrid } from '#/components/landing/FeatureGrid'
import { ComparisonTable } from '#/components/landing/ComparisonTable'
import { AIAnalysis } from '#/components/landing/AIAnalysis'
import { StatsBar } from '#/components/landing/StatsBar'
import { Testimonials } from '#/components/landing/Testimonials'
import { ForVenues } from '#/components/landing/ForVenues'
import { CTABanner } from '#/components/landing/CTABanner'
import { FAQ } from '#/components/landing/FAQ'
import { Footer } from '#/components/landing/Footer'

export const Route = createFileRoute('/')({
  // Logged-in users don't belong on the marketing page — send them to the app.
  beforeLoad: async ({ context: { queryClient } }) => {
    const user = await queryClient.fetchQuery(meQuery)
    redirectAuthenticatedHome(user)
  },
  head: () => ({
    meta: landingMeta(),
    links: [{ rel: 'canonical', href: SITE_URL + '/' }],
    scripts: [
      { type: 'application/ld+json', children: landingJsonLd() },
    ],
  }),
  component: LandingPage,
})

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
