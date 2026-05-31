import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { csrf } from "hono/csrf";
import {prettyJSON} from "hono/pretty-json";

const app = new Hono();

// Logger middleware
app.use(logger());

// CORS middleware
app.use(cors()); // Default for now

// CSRF protection middleware
app.use(csrf());


// Pretty JSON middleware
app.use(prettyJSON());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
