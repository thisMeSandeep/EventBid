import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { csrf } from "hono/csrf";
import { prettyJSON } from "hono/pretty-json";
import { env } from "./lib/env";
import { authRoutes } from "./routes/auth.routes";
import { errorHandler } from "./middleware/error.middleware";

const app = new Hono();

app.onError(errorHandler);

// Logger middleware
app.use(logger());

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

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
