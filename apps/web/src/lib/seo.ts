// Central SEO config. Update SITE_URL to your production domain — it's used for
// canonical URLs, Open Graph, and the sitemap (absolute URLs are required there).
export const SITE_URL = 'https://eventbid.sandeepnayal.com'
export const SITE_NAME = 'EventBid'

export const SITE_TITLE =
  'EventBid — Get venues competing for your event'
export const SITE_DESCRIPTION =
  'Describe your event once and let venues bid for it. EventBid matches your brief to the right venues, gathers proposals, and uses AI to compare them — so you book the perfect venue, faster.'

// 1200×630 is ideal for social cards; we fall back to the 512 logo until a
// dedicated OG image is added at /og-image.png.
export const OG_IMAGE = `${SITE_URL}/og.png`

/** Meta tags that should appear on every indexable public page. */
export function landingMeta() {
  return [
    { title: SITE_TITLE },
    { name: 'description', content: SITE_DESCRIPTION },
    { name: 'robots', content: 'index, follow' },

    // Open Graph
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:title', content: SITE_TITLE },
    { property: 'og:description', content: SITE_DESCRIPTION },
    { property: 'og:url', content: SITE_URL + '/' },
    { property: 'og:image', content: OG_IMAGE },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: `${SITE_NAME} — venue bidding for events` },

    // Twitter
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: SITE_TITLE },
    { name: 'twitter:description', content: SITE_DESCRIPTION },
    { name: 'twitter:image', content: OG_IMAGE },
  ]
}

/** Keep non-landing public pages (auth, onboarding) out of search results. */
export function noindexMeta() {
  return [{ name: 'robots', content: 'noindex, nofollow' }]
}

/** Organization + WebSite structured data for the landing page. */
export function landingJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/og.png`,
      },
      {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
      },
    ],
  })
}
