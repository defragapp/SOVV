export default {
  async fetch(request, env, ctx) {
    const AUTH_TOKEN = env.AUTH_TOKEN;
    const GITHUB_TOKEN = env.GITHUB_TOKEN;
    const REPO_OWNER = "defragapp";
    const REPO_NAME = "SOVV";
    const GATEWAY_ID = env.GATEWAY_ID || "sovereign-code-agent";

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: { "Access-Control-Allow-Origin": "https://operator.defrag.app", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Authorization, Content-Type", "Vary": "Origin" } });
    }
    
    const auth = request.headers.get("Authorization");
    if (!auth || auth !== `Bearer ${AUTH_TOKEN}`) {
      return json({ error: "Unauthorized" }, 401);
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === "/health") {
        return json({ status: "online", agent: "sovereign-build-agent", repo: "defragapp/SOVV", ai_gateway: GATEWAY_ID });
      }

      if (path === "/repo/tree") {
        const filePath = url.searchParams.get("path") || "";
        const res = await githubFetch(`/contents/${filePath}`, GITHUB_TOKEN, REPO_OWNER, REPO_NAME);
        const data = await res.json();
        return json(data);
      }

      if (path === "/repo/file") {
        const filePath = url.searchParams.get("path");
        if (!filePath) return json({ error: "Missing ?path=" }, 400);
        const res = await githubFetch(`/contents/${filePath}`, GITHUB_TOKEN, REPO_OWNER, REPO_NAME);
        const data = await res.json();
        if (data.content) {
          const content = atob(data.content.replace(/\n/g, ""));
          return json({ path: filePath, content, sha: data.sha, url: data.html_url });
        }
        return json(data);
      }

      if (path === "/chat" && request.method === "POST") {
        const body = await request.json();
        const { message, fetchTree = true, model = "@cf/meta/llama-3.3-70b-instruct-fp8-fast" } = body;
        
        let repoContext = "";
        if (fetchTree) {
          try {
            const treeRes = await githubFetch("/git/trees/main?recursive=1", GITHUB_TOKEN, REPO_OWNER, REPO_NAME);
            const treeData = await treeRes.json();
            if (treeData.tree) {
              const files = treeData.tree.filter(t => t.type === "blob").map(t => t.path);
              repoContext = `Repository defragapp/SOVV file structure (${files.length} files):\n${files.slice(0, 100).join("\n")}`;
            }
          } catch (e) { repoContext = "Could not fetch repo tree."; }
        }

        const systemPrompt = `You are the Sovereign Build Agent. You are building the SOVV platform (Sovereign.os). You have full read access to the defragapp/SOVV GitHub repository. You can analyze code, suggest implementations, and generate Cloudflare Workers/Pages deployments. When asked for platform-build recommendations, always include a production-readiness checklist that covers consent banner/cookie preferences, privacy policy + terms links, analytics consent mode, and core security/accessibility hardening. Current repo context: ${repoContext}`;

        const messages = [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ];

        const result = await env.AI.run(model, { messages, max_tokens: 4096, temperature: 0.7 }, { gateway: { id: GATEWAY_ID } });
        
        return json({ 
          response: result.response || result,
          model,
          gateway: GATEWAY_ID,
          repo_context_length: repoContext.length
        });
      }

      if (path === "/deploy/worker" && request.method === "POST") {
        // AUDIT: log all deploy attempts
        console.log(JSON.stringify({ event: "deploy_attempt", path, timestamp: new Date().toISOString(), ip: request.headers.get("CF-Connecting-IP") || "unknown" }));
        // AUDIT: log all deploy attempts
        console.log(JSON.stringify({ event: "deploy_attempt", path, timestamp: new Date().toISOString(), ip: request.headers.get("CF-Connecting-IP") || "unknown" }));
        const body = await request.json();
        const { name, code, bindings = [] } = body;
        if (!name || !code) return json({ error: "Missing name or code" }, 400);
        
        const cfToken = request.headers.get("X-CF-Token") || env.CF_API_TOKEN;
        if (!cfToken) {
          return json({ error: "Missing Cloudflare API token. Pass X-CF-Token header or set CF_API_TOKEN secret." }, 400);
        }

        const deployRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/workers/scripts/${name}`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${cfToken}`,
            "Content-Type": "application/javascript"
          },
          body: code
        });
        const deployData = await deployRes.json();
        return json({ deployed: deployData.success, name, result: deployData });
      }

      if (path === "/repo/overview") {
        const res = await githubFetch("/readme", GITHUB_TOKEN, REPO_OWNER, REPO_NAME);
        const data = await res.json();
        if (data.content) {
          data.content = atob(data.content.replace(/\n/g, ""));
        }
        return json(data);
      }

      return json({
        agent: "sovereign-build-agent",
        repo: "defragapp/SOVV",
        authenticated: true,
        endpoints: [
          { method: "GET", path: "/health", desc: "Agent status" },
          { method: "GET", path: "/repo/tree?path=", desc: "List files" },
          { method: "GET", path: "/repo/file?path=", desc: "Read file" },
          { method: "GET", path: "/repo/overview", desc: "README" },
          { method: "POST", path: "/chat", body: { message: "string", fetchTree: "boolean" }, desc: "AI chat with repo context" },
          { method: "POST", path: "/deploy/worker", body: { name: "string", code: "string" }, desc: "Deploy Worker to CF" }
        ]
      });

    } catch (err) {
      return json({ error: err.message, stack: err.stack }, 500);
    }
  }
};

async function githubFetch(path, token, owner, repo) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}${path}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "Sovereign-Agent/1.0"
    }
  });
  return res;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "https://operator.defrag.app" } });
}
