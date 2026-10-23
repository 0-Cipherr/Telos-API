//flow for selecting ehich bridge to se is a adapter interfaces of different bridges
//  all following same standard and functioins like wr doing on solifity
//but instead we doing in typescript
//index.ts
import "dotenv/config";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { Application, Request, Response } from "express";
import express from "express";
import { chatRouter } from "./llm/chatProxy.js";
import { registryRouter } from "./vaults/registryRouter.js";

const app: Application = express();

// The chat/audit proxy is independent of Postgres. A database outage should
// degrade the registry endpoints, not kill the process and the UI with it.
process.on("unhandledRejection", (reason) => {
  console.error("[api] unhandled rejection:", reason);
});

// Strategy chat + ETHSKILLS audit proxy. Keeps the OpenRouter key server-side.
app.use("/api/chat", chatRouter);

app.use("/registry", registryRouter);
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ ok: true });
});

// Serve the built frontend from the same origin as the API. In production the
// browser calls `/api/chat` with no CORS dance and no separate static host.
const frontendDist = resolve(
  process.env.FRONTEND_DIST || "../Telos-Frontend/telos/dist",
);

if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist, { index: false, maxAge: "1h" }));

  // Client-side routes (/, /vaults, ...) all resolve to index.html. Anything
  // under /api is left alone so missing endpoints return a real 404.
  app.use((req: Request, res: Response, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    if (req.path.startsWith("/api/") || req.path === "/registry") return next();
    if (!req.accepts("html")) return next();
    res.sendFile(resolve(frontendDist, "index.html"));
  });
} else {
  console.warn(
    `[web] frontend build not found at ${frontendDist}; serving API only.`,
  );
}

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World the api works !");
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});
//set up classses for bridge follwinf interface standard

// every thing mus have a type thats why we using ts
//micro services

export default app;
