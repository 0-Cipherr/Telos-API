import { Readable } from "node:stream";
import express, { type Request, type Response, type Router } from "express";
import { requireTelosKey } from "../auth/auth.js";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Free models are the default because the project is meant to run without a
// paid OpenRouter balance. They queue and rate-limit a lot, so every request
// walks a failover chain instead of hard-coding a single upstream. This mirrors
// the dev proxy in Telos-Frontend/telos/vite.config.ts.
const DEFAULT_MODELS = [
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "cohere/north-mini-code:free",
  "nvidia/nemotron-3.5-lightning:free",
];

// A model that rejects `reasoning: {enabled:false}` does so with a 400 whose
// message mentions mandatory reasoning. That is not a real failure: retry the
// same model without the hint.
const REASONING_REQUIRED = /reasoning[^.]*(mandatory|required|cannot be disabled)/i;

// These are safe to retry on another model. A 401 means the key itself is bad,
// so there is no point burning through the chain.
const FAILOVER_STATUSES = new Set([402, 404, 408, 409, 429, 500, 502, 503, 504]);

// Rate limits and upstream hiccups are temporary; wait a moment before trying
// the next model so free queues have a chance to drain.
const RETRY_DELAY_MS = 600;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function parseModels(value: string | undefined, fallback: string[]): string[] {
  const parsed = (value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : fallback;
}

const chatModels = parseModels(process.env.OPEN_ROUTER_MODELS || process.env.OPEN_ROUTER_MODEL, DEFAULT_MODELS);
const auditModels = parseModels(
  process.env.OPEN_ROUTER_AUDIT_MODELS || process.env.OPEN_ROUTER_AUDIT_MODEL,
  [],
);

function originAllowed(req: Request): boolean {
  const origin = req.headers.origin;
  // Non-browser clients (curl, health checks) send no Origin.
  if (!origin) return true;

  const allowed = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (allowed.includes(origin)) return true;
  if (allowed.includes("*")) return true;

  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "");
  try {
    // Same-origin deploy: the browser sends the host it is talking to.
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

type ChatPayload = {
  messages?: unknown;
  temperature?: unknown;
  max_tokens?: unknown;
  stream?: unknown;
  purpose?: unknown;
  plugins?: unknown;
};

export const chatRouter: Router = express.Router();

chatRouter.use(express.json({ limit: "2mb" }));

chatRouter.get("/", (_req: Request, res: Response) => {
  res.json({
    ok: Boolean(process.env.OPEN_ROUTER_SECRET),
    keyless: true,
    model: chatModels[0] ?? "",
    models: chatModels,
  });
});

// Every chat call must carry the Telos key issued on wallet connect. The key
// is what ties strategist usage to a creator; the OpenRouter key never leaves
// the server.
chatRouter.post("/", requireTelosKey, async (req: Request, res: Response) => {
  if (!originAllowed(req)) {
    res.status(403).json({ error: "forbidden origin" });
    return;
  }

  const secret = (process.env.OPEN_ROUTER_SECRET || "").trim();
  if (!secret) {
    res.status(503).json({
      error:
        "OPEN_ROUTER_SECRET is not set — running the local strategist instead.",
    });
    return;
  }

  const payload = (req.body ?? {}) as ChatPayload;
  if (!Array.isArray(payload.messages) || payload.messages.length === 0) {
    res.status(400).json({ error: "messages are required" });
    return;
  }

  // The strategy chat streams tokens; the ETHSKILLS audit asks for one JSON
  // verdict. The client's `stream` flag must be honoured end-to-end.
  const wantsStream = payload.stream !== false;
  // An audit gets its own (ideally stronger) reviewer chain, falling back to
  // the chat chain when OPEN_ROUTER_AUDIT_MODEL(S) is not set.
  const chain = payload.purpose === "audit" && auditModels.length > 0 ? auditModels : chatModels;

  const temperature = typeof payload.temperature === "number" ? payload.temperature : 0.7;
  const maxTokens = typeof payload.max_tokens === "number" ? payload.max_tokens : 4096;

  // Walk the failover chain. Each attempt either returns a usable upstream
  // response or a reason to try the next model.
  let lastError = { status: 502, message: "no model available" };

  type Upstream = Awaited<ReturnType<typeof fetch>>;
  let upstreamResponse: Upstream | undefined;

  for (const [index, candidate] of chain.entries()) {
    let reasoningHint = true;
    // At most two attempts per model: once with reasoning disabled, once
    // without the hint if the provider insists reasoning cannot be disabled.
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const body: Record<string, unknown> = {
        model: candidate,
        messages: payload.messages,
        temperature,
        max_tokens: maxTokens,
        stream: wantsStream,
      };
      // Big reasoning models spend 5-10s "thinking" before the first visible
      // token. The lab wants answers, not a monologue, so ask OpenRouter to
      // skip it. Providers without reasoning ignore this.
      if (reasoningHint) body.reasoning = { enabled: false };
      // Web lookups are opt-in per request (the chat asks only for current-info questions).
      if (Array.isArray(payload.plugins) && payload.plugins.length > 0) body.plugins = payload.plugins;

      let response: Upstream;
      try {
        response = await fetch(OPENROUTER_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${secret}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.PUBLIC_URL || "http://localhost:3000",
            "X-Title": "Telos Strategy Lab",
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(wantsStream ? 120_000 : 240_000),
        });
      } catch (error) {
        lastError = {
          status: 504,
          message: `${candidate}: ${error instanceof Error ? error.message : "upstream timeout"}`,
        };
        break;
      }

      if (response.ok && response.body) {
        upstreamResponse = response;
        break;
      }

      const detail = await response.text().catch(() => "");

      // Provider refuses the reasoning hint: retry the same model without it.
      if (reasoningHint && response.status === 400 && REASONING_REQUIRED.test(detail)) {
        reasoningHint = false;
        continue;
      }

      lastError = {
        status:
          response.status === 401 || FAILOVER_STATUSES.has(response.status)
            ? response.status
            : 502,
        message: `${candidate}: openrouter ${response.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`,
      };
      break;
    }

    if (upstreamResponse) break;
    // A bad key will fail for every model; stop early and surface it.
    if (lastError.status === 401) break;
    if (index < chain.length - 1) await sleep(RETRY_DELAY_MS);
  }

  if (!upstreamResponse || !upstreamResponse.body) {
    // Preserve auth/credit/rate-limit statuses so the chat can tell the user
    // "credits exhausted" instead of a generic provider hiccup.
    res.status(lastError.status).json({ error: lastError.message });
    return;
  }

  if (!wantsStream) {
    // Audits are single JSON responses; piping SSE into response.json()
    // would fail with a parse error.
    const body = await upstreamResponse.text();
    res.status(upstreamResponse.status);
    res.setHeader(
      "Content-Type",
      upstreamResponse.headers.get("content-type") ?? "application/json",
    );
    res.setHeader("Cache-Control", "no-store");
    res.end(body);
    return;
  }

  const stream = upstreamResponse.body;

  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  // Stop pumping if the browser goes away (modal closed, chat reset, etc.).
  res.on("close", () => {
    void stream.cancel().catch(() => undefined);
  });
  Readable.fromWeb(stream as Parameters<typeof Readable.fromWeb>[0]).pipe(res);
});
