import { sql } from "drizzle-orm";
import { db } from "../src/db/client";
import { services } from "../src/services";
import { logger } from "../src/lib/logger";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function withRateLimitRetry<T>(
  label: string,
  fn: () => Promise<T>,
  tries = 8,
  waitMs = 30_000,
): Promise<T | null> {
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (/rate-limit/i.test(message) && attempt < tries) {
        logger.warn(
          { label, attempt },
          `Rate-limited; waiting ${waitMs / 1000}s before retry`,
        );
        await sleep(waitMs);
        continue;
      }
      logger.error({ err, label }, "Matching failed (non-retryable)");
      return null;
    }
  }
  return null;
}

async function main() {
  const rows = await db.execute<{ id: string }>(
    sql`SELECT id FROM briefs WHERE status = 'open'`,
  );

  logger.info({ count: rows.length }, "Re-matching open briefs");

  for (const { id } of rows) {
    const result = await withRateLimitRetry(id, () =>
      services.matching.matchBriefToVenues(id),
    );
    logger.info(
      { briefId: id, matches: result?.length ?? "failed" },
      "Brief re-matched",
    );
  }

  process.exit(0);
}

main();
