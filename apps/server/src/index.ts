import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { csrf } from "hono/csrf";
import { prettyJSON } from "hono/pretty-json";
import { adapters } from "./adapters";
import { repositories } from "./db/repositories";
import { env } from "./lib/env";
import { logger } from "./lib/logger";
import { connectRedis, redis } from "./lib/redis";
import { initSentry } from "./lib/sentry";
import { JobEngine } from "./jobs/engine";
import { jobRegistry } from "./jobs/registry";
import { corsMiddleware } from "./middleware/cors.middleware";
import { errorHandler } from "./middleware/error.middleware";
import { requestLogger } from "./middleware/request-log.middleware";
import { briefAnalysisRoutes } from "./routes/analysis.routes";
import { authRoutes } from "./routes/auth.routes";
import { briefRoutes } from "./routes/brief.routes";
import { notificationRoutes } from "./routes/notification.routes";
import {
  briefProposalRoutes,
  venueProposalRoutes,
} from "./routes/proposal.routes";
import { sseRoutes } from "./routes/sse.routes";
import { venueRoutes } from "./routes/venue.routes";
import { services } from "./services";

export const API_BASE_PATH = "/api";

initSentry();

const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));

const api = new Hono().basePath(API_BASE_PATH);

api.onError(errorHandler);
api.use(requestLogger);
api.use("/*", corsMiddleware);
api.use(
  csrf({
    origin: env.FRONTEND_URL,
  }),
);
api.use(prettyJSON());

api.route("/", authRoutes);
api.route("/briefs", briefRoutes);
api.route("/briefs", briefProposalRoutes);
api.route("/briefs", briefAnalysisRoutes);
api.route("/venues", venueRoutes);
api.route("/venues", venueProposalRoutes);
api.route("/notifications", notificationRoutes);
api.route("/sse", sseRoutes);

app.route("/", api);

const jobEngine = new JobEngine(jobRegistry, redis, {
  services,
  repositories,
  adapters,
});

let jobsStarted = false;

async function start() {
  const redisReady = await connectRedis();

  if (redisReady) {
    jobEngine.start();
    jobsStarted = true;
    logger.info("Job workers started");
  } else if (env.NODE_ENV === "development") {
    logger.warn(
      "Redis unavailable — job workers not started. Run: docker compose up -d redis",
    );
  } else {
    logger.error("Redis connection failed in production");
    process.exit(1);
  }

  const server = serve(
    {
      fetch: app.fetch,
      port: env.PORT,
    },
    (info) => {
      logger.info(
        { port: info.port, basePath: API_BASE_PATH },
        "Server started",
      );
    },
  );

  async function shutdown(signal: string) {
    logger.info({ signal }, "Shutting down");
    if (jobsStarted) {
      await jobEngine.stop();
    }
    redis.disconnect();
    server.close();
    process.exit(0);
  }

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

void start();
