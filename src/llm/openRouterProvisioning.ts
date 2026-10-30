// OpenRouter has no sign-up API, but a management key can mint per-user API
// keys with spending limits. Each agent gets its own sub-key, created here,
// so users never see or paste an OpenRouter key.
const KEYS_URL = "https://openrouter.ai/api/v1/keys";

export type ProvisionedKey = { key: string; hash: string };

export async function provisionAgentKey(label: string): Promise<ProvisionedKey> {
  const management = (process.env.OPEN_ROUTER_MANAGEMENT_KEY || "").trim();
  if (!management) {
    throw new Error("OPEN_ROUTER_MANAGEMENT_KEY is not set");
  }

  const limit = Number(process.env.OPEN_ROUTER_AGENT_LIMIT_USD || 5);
  const response = await fetch(KEYS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${management}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: `telos-agent-${label}`.slice(0, 120),
      limit,
      limit_reset: "monthly",
      include_byok_in_limit: true,
    }),
    signal: AbortSignal.timeout(20_000),
  });

  const json = (await response.json().catch(() => ({}))) as {
    key?: string;
    data?: { hash?: string };
    error?: { message?: string };
  };
  if (!response.ok || !json.key || !json.data?.hash) {
    throw new Error(
      `OpenRouter key provisioning failed (${response.status}): ${json.error?.message ?? "unexpected response"}`,
    );
  }
  return { key: json.key, hash: json.data.hash };
}
