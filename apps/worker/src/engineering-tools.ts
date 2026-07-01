import type { Env } from "./types-env.js";
import { getCorsHeaders } from "./index.js";

type EngineeringToolName =
  | "audit_repository"
  | "implement_change"
  | "prepare_release"
  | "review_pull_request"
  | "deploy_worker"
  | "verify_production";

type ApprovalInput = {
  approved?: boolean;
  phrase?: string;
};

const TOOL_NAMES: EngineeringToolName[] = [
  "audit_repository",
  "implement_change",
  "prepare_release",
  "review_pull_request",
  "deploy_worker",
  "verify_production",
];

const APPROVAL_REQUIRED = new Set<EngineeringToolName>(["implement_change", "deploy_worker"]);
const DEPLOY_APPROVAL_PHRASE = "APPROVE_DEPLOY";

function json(request: Request, body: Record<string, unknown>, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...getCorsHeaders(request),
      ...(init.headers ?? {}),
    },
  });
}

function isAuthorized(request: Request, env: Env): boolean {
  if (!env.SOVV_TOOLS_SHARED_SECRET) return true;
  return request.headers.get("x-sovv-tools-secret") === env.SOVV_TOOLS_SHARED_SECRET;
}

function evaluateApproval(tool: EngineeringToolName, approval?: ApprovalInput) {
  if (!APPROVAL_REQUIRED.has(tool)) {
    return { approved: true, approvalRequired: false, message: "No approval required." };
  }

  if (tool === "deploy_worker") {
    const approved = approval?.approved === true && approval.phrase === DEPLOY_APPROVAL_PHRASE;
    return {
      approved,
      approvalRequired: !approved,
      phrase: DEPLOY_APPROVAL_PHRASE,
      message: approved
        ? "Deploy approval accepted."
        : `Deploy requires explicit approval phrase: ${DEPLOY_APPROVAL_PHRASE}`,
    };
  }

  const approved = approval?.approved === true;
  return {
    approved,
    approvalRequired: !approved,
    message: approved ? "Change approval accepted." : "Implementation changes require explicit approval.",
  };
}

async function writeAuditLog(env: Env, entry: Record<string, unknown>) {
  if (!env.KV) return;
  const key = `engineering:audit:${new Date().toISOString()}:${crypto.randomUUID()}`;
  await env.KV.put(key, JSON.stringify(entry));
}

function configured(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

async function executeTool(tool: EngineeringToolName, body: Record<string, unknown>, env: Env) {
  const requestText = typeof body.request === "string" ? body.request : "";

  switch (tool) {
    case "audit_repository":
      return {
        ok: true,
        tool,
        approvalRequired: false,
        summary: "Repository audit facade is online. Next implementation step is to connect GitHub App read operations inside this Worker route.",
        data: {
          request: requestText,
          repository: env.SOVV_REPOSITORY ?? "defragapp/SOVV",
          githubAppConfigured: configured(env.GITHUB_APP_ID) && configured(env.GITHUB_APP_INSTALLATION_ID) && configured(env.GITHUB_APP_PRIVATE_KEY),
        },
      };
    case "prepare_release":
      return {
        ok: true,
        tool,
        approvalRequired: false,
        summary: "Release preparation facade is online. It can produce gates before deploy_worker is allowed to run.",
        data: { request: requestText, deployTarget: env.SOVV_DEPLOY_TARGET ?? "sovv-web" },
      };
    case "review_pull_request":
      return {
        ok: true,
        tool,
        approvalRequired: false,
        summary: "Pull request review facade is online. GitHub App PR reads should be wired here next.",
        data: { request: requestText },
      };
    case "verify_production":
      return {
        ok: true,
        tool,
        approvalRequired: false,
        summary: "Production verification facade is online. Cloudflare scoped-token reads should be wired here next.",
        data: {
          request: requestText,
          cloudflareConfigured: configured(env.CLOUDFLARE_API_TOKEN) && configured(env.CLOUDFLARE_ACCOUNT_ID),
          deployTarget: env.SOVV_DEPLOY_TARGET ?? "sovv-web",
        },
      };
    case "implement_change":
      return {
        ok: true,
        tool,
        approvalRequired: true,
        summary: "Implementation facade accepted an approved change request. Actual branch and PR mutation is intentionally not enabled until GitHub App write operations are wired.",
        data: { request: requestText },
      };
    case "deploy_worker":
      return {
        ok: true,
        tool,
        approvalRequired: true,
        summary: "Deploy facade accepted explicit approval. Actual deploy execution is intentionally not enabled until release verification is complete.",
        data: { request: requestText, deployTarget: env.SOVV_DEPLOY_TARGET ?? "sovv-web" },
      };
  }
}

export function registerEngineeringToolRoutes(router: any, getEnv: () => Env) {
  for (const toolName of TOOL_NAMES) {
    router.post(`/tools/${toolName}`, async (request: Request) => {
      const env = getEnv();

      if (!isAuthorized(request, env)) {
        return json(request, { ok: false, error: "unauthorized" }, { status: 401 });
      }

      const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
      if (!body || typeof body.request !== "string") {
        return json(request, { ok: false, error: "invalid_request" }, { status: 400 });
      }

      const approval = evaluateApproval(toolName, body.approval as ApprovalInput | undefined);
      if (!approval.approved) {
        await writeAuditLog(env, {
          tool: toolName,
          status: "blocked",
          approvalRequired: approval.approvalRequired,
          createdAt: new Date().toISOString(),
        });
        return json(
          request,
          {
            ok: false,
            tool: toolName,
            approvalRequired: approval.approvalRequired,
            approval,
            summary: approval.message,
          },
          { status: 403 },
        );
      }

      const result = await executeTool(toolName, body, env);
      await writeAuditLog(env, {
        tool: toolName,
        status: "completed",
        approvalRequired: result.approvalRequired,
        createdAt: new Date().toISOString(),
      });
      return json(request, result);
    });
  }
}
