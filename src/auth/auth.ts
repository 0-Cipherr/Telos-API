import type { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { findCreatorByApiKey, type Creator } from "../db/telos-queries.js";

declare global {
  namespace Express {
    interface Request {
      privyUserId?: string;
      creator?: Creator;
    }
  }
}

// Privy signs access tokens with rotating ES256 keys published at a public
// JWKS endpoint. Fetching it (and caching it) verifies tokens without any
// secret, and key rotation needs no config change.
const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function getJwks(appId: string) {
  let jwks = jwksCache.get(appId);
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`https://auth.privy.io/api/v1/apps/${appId}/jwks.json`));
    jwksCache.set(appId, jwks);
  }
  return jwks;
}

function bearer(req: Request): string {
  return (req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
}

// Used only by POST /creator/connect: proves the caller is a real Privy user.
export async function requirePrivyUser(req: Request, res: Response, next: NextFunction) {
  const token = bearer(req);
  const appId = process.env.PRIVY_APP_ID || "";
  if (!token || !appId) {
    res.status(401).json({ error: "missing Privy access token" });
    return;
  }
  try {
    const { payload } = await jwtVerify(token, getJwks(appId), {
      issuer: "privy.io",
      audience: appId,
    });
    req.privyUserId = String(payload.sub);
    next();
  } catch {
    res.status(401).json({ error: "invalid Privy access token" });
  }
}

// Every other route: the Telos API key that was issued on first connect.
export async function requireTelosKey(req: Request, res: Response, next: NextFunction) {
  const key = bearer(req);
  if (!key) {
    res.status(401).json({ error: "missing Telos API key" });
    return;
  }
  try {
    const creator = await findCreatorByApiKey(key);
    if (!creator) {
      res.status(401).json({ error: "unknown Telos API key" });
      return;
    }
    req.creator = creator;
    next();
  } catch (error) {
    console.error("[auth] key lookup failed:", error);
    res.status(500).json({ error: "auth lookup failed" });
  }
}
