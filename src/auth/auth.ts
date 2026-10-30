import type { NextFunction, Request, Response } from "express";
import { jwtVerify, importSPKI } from "jose";
import { findCreatorByApiKey, type Creator } from "../db/telos-queries.js";

declare global {
  namespace Express {
    interface Request {
      privyUserId?: string;
      creator?: Creator;
    }
  }
}

let verificationKey: Promise<CryptoKey> | null = null;

// The Privy verification key (Dashboard > App settings) lets us check access
// tokens locally, without calling Privy or storing the app secret here.
function getVerificationKey(): Promise<CryptoKey> {
  const pem = (process.env.PRIVY_VERIFICATION_KEY || "").replace(/\\n/g, "\n");
  if (!pem) throw new Error("PRIVY_VERIFICATION_KEY is not set");
  verificationKey ??= importSPKI(pem, "ES256");
  return verificationKey;
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
    const { payload } = await jwtVerify(token, await getVerificationKey(), {
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
