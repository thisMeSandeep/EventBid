import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { prettyJSON } from "hono/pretty-json";
import { env } from "./lib/env";
import { logger } from "./lib/logger";
import { authRoutes } from "./routes/auth.routes";
import { venueRoutes } from "./routes/venue.routes";
import { errorHandler } from "./middleware/error.middleware";
import { requestLogger } from "./middleware/request-log.middleware";

const app = new Hono();

app.onError(errorHandler);

app.use(requestLogger);

// CORS middleware
app.use(
  "/auth/*",
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// CSRF protection middleware
app.use(csrf());

// Pretty JSON middleware
app.use(prettyJSON());

app.route("/", authRoutes);
app.route("/venues", venueRoutes);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    logger.info({ port: info.port }, "Server started");
  },
);
