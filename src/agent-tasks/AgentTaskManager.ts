import {
  getDueAgentTasks,
  getStrategiesForVault,
  insertStrategy,
  markTaskRan,
  setCurrentStrategy,
  type DueTask,
} from "../db/telos-queries.js";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const POLL_MS = 30_000;
const BATCH_SIZE = 5;

type ProposedStrategy = {
  name: string;
  description: string;
  protocol: string;
  apy: number;
  riskLevel: number;
  entryPoint: string | null;
  exitPoint: string | null;
  configuration: Record<string, unknown>;
};

function buildPrompt(task: DueTask, history: unknown[]): string {
  return [
    `You manage the native ETH vault "${task.vault_name}" on chain ${task.chain_id}.`,
    "The vault holds only native ETH. To use another chain, the strategy must bridge ETH out through the vault's Stargate route.",
    "Every strategy you have already proposed for this vault is listed below. Do not repeat them; improve on them or explain why a new direction is better.",
    `Past strategies: ${JSON.stringify(history)}`,
    'Reply with ONLY a JSON object: {"name","description","protocol","apy","riskLevel" (1-5),"entryPoint","exitPoint","configuration"}.',
  ].join("\n");
}

function parseProposal(text: string): ProposedStrategy {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("agent reply contained no JSON object");
  const raw = JSON.parse(text.slice(start, end + 1)) as Partial<ProposedStrategy>;
  if (!raw.name || !raw.description || !raw.protocol) {
    throw new Error("agent strategy is missing name, description or protocol");
  }
  return {
    name: String(raw.name).slice(0, 100),
    description: String(raw.description),
    protocol: String(raw.protocol).slice(0, 100),
    apy: Number(raw.apy) || 0,
    riskLevel: Math.min(5, Math.max(1, Math.round(Number(raw.riskLevel) || 3))),
    entryPoint: raw.entryPoint ? String(raw.entryPoint).slice(0, 100) : null,
    exitPoint: raw.exitPoint ? String(raw.exitPoint).slice(0, 100) : null,
    configuration: raw.configuration && typeof raw.configuration === "object" ? raw.configuration : {},
  };
}

async function askAgent(task: DueTask, prompt: string): Promise<string> {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${task.openrouter_key}`,
      "Content-Type": "application/json",
      "X-Title": "Telos Agent",
    },
    body: JSON.stringify({
      model: task.model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1024,
    }),
    signal: AbortSignal.timeout(120_000),
  });
  const json = (await response.json().catch(() => ({}))) as {
    choices?: { message?: { content?: string } }[];
    error?: { message?: string };
  };
  if (!response.ok) {
    throw new Error(`openrouter ${response.status}: ${json.error?.message ?? "request failed"}`);
  }
  return json.choices?.[0]?.message?.content ?? "";
}

async function runTask(task: DueTask) {
  let error: string | null = null;
  try {
    const history = await getStrategiesForVault(task.vault_id);
    const reply = await askAgent(task, buildPrompt(task, history));
    const proposal = parseProposal(reply);
    const saved = (await insertStrategy({
      vaultId: task.vault_id,
      agentId: task.agent_id,
      name: proposal.name,
      description: proposal.description,
      protocol: proposal.protocol,
      chainId: task.chain_id,
      contractAddress: null,
      entryPoint: proposal.entryPoint,
      exitPoint: proposal.exitPoint,
      apy: proposal.apy,
      riskLevel: proposal.riskLevel,
      configuration: proposal.configuration,
    })) as { id: string };
    await setCurrentStrategy(task.vault_id, saved.id);
  } catch (caught) {
    error = caught instanceof Error ? caught.message : String(caught);
    console.error(`[agent-task ${task.task_id}]`, error);
  }
  await markTaskRan(task.task_id, task.rethink_interval_minutes, error);
}

let running = false;

async function tick() {
  if (running) return;
  running = true;
  try {
    for (const task of await getDueAgentTasks(BATCH_SIZE)) {
      await runTask(task);
    }
  } catch (error) {
    console.error("[agent-tasks] tick failed:", error);
  } finally {
    running = false;
  }
}

export function startAgentTaskManager() {
  setInterval(() => void tick(), POLL_MS);
  void tick();
}
