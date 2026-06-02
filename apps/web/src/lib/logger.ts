import { createLogger } from '@eventbid/logger'
import { env } from './env'

// Single browser logger instance — the only diagnostics sink in the web app
// (no error-monitoring SaaS in v1). Prefer `logger.debug` over `console.log`;
// it's level-filtered in production. Pass a fields object first, then the
// message: logger.error({ err, path }, 'API request failed').
export const logger = createLogger({
  name: 'eventbid-web',
  level: env.VITE_LOG_LEVEL,
})
