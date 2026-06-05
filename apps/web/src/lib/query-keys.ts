export const qk = {
  me: ['me'] as const,
  briefs: {
    list: (cursor?: string, status?: string) =>
      ['briefs', 'list', cursor ?? null, status ?? null] as const,
    detail: (id: string) => ['briefs', id] as const,
    analysis: (id: string) => ['briefs', id, 'analysis'] as const,
    proposals: (id: string) => ['briefs', id, 'proposals'] as const,
  },
  venues: {
    me: ['venues', 'me'] as const,
    feed: (cursor?: string, eventType?: string) =>
      ['venues', 'feed', cursor ?? null, eventType ?? null] as const,
    proposals: (cursor?: string, status?: string) =>
      ['venues', 'proposals', cursor ?? null, status ?? null] as const,
    proposalsForBrief: (briefId: string) =>
      ['venues', 'proposals', 'brief', briefId] as const,
    byId: (id: string) => ['venues', id] as const,
  },
  notifications: {
    list: (cursor?: string) => ['notifications', cursor ?? null] as const,
    all: (cursor?: string) => ['notifications', 'all', cursor ?? null] as const,
  },
} as const
