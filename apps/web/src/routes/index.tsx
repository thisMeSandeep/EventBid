import { createFileRoute } from '@tanstack/react-router'
import { meQuery } from '#/server/auth'
import { redirectAuthenticatedHome } from '#/lib/auth-redirect'
import { SITE_URL, landingJsonLd, landingMeta } from '#/lib/seo'
import { Navbar } from '#/components/landing/Navbar'
import { HeroSection } from '#/components/landing/HeroSection'
import { Lifecycle } from '#/components/landing/Lifecycle'
import { Compared } from '#/components/landing/Compared'
import { ForVenues } from '#/components/landing/ForVenues'
import { Proof } from '#/components/landing/Proof'
import { FAQ } from '#/components/landing/FAQ'
import { ClosingCTA } from '#/components/landing/ClosingCTA'
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
        <Lifecycle />
        <Compared />
        <ForVenues />
        <Proof />
        <FAQ />
        <ClosingCTA />
      </main>
      <Footer />
    </div>
  )
}
