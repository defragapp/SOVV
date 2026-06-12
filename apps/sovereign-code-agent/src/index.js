export default {
  async fetch(request, env, ctx) {
    const auth = request.headers.get('Authorization');
    if (auth !== `Bearer ${env.AUTH_TOKEN}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const url = new URL(request.url);
    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    const github = async (path) => {
      const res = await fetch(`https://api.github.com${path}`, {
        headers: {
          'Authorization': `token ${env.GITHUB_TOKEN}`,
          'User-Agent': 'Sovereign-Agent/1.0',
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      return { status: res.status, data: await res.json(), headers: Object.fromEntries(res.headers) };
    };

    if (url.pathname === '/repo' && request.method === 'GET') {
      const path = url.searchParams.get('path') || '';
      const result = await github(`/repos/defragapp/SOVV/contents/${path}`);
      return new Response(JSON.stringify(result, null, 2), { headers: { 'Content-Type': 'application/json', ...cors } });
    }

    if (url.pathname === '/file' && request.method === 'GET') {
      const path = url.searchParams.get('path');
      if (!path) return new Response(JSON.stringify({ error: 'Missing ?path=' }), { status: 400, headers: { 'Content-Type': 'application/json', ...cors } });
      const result = await github(`/repos/defragapp/SOVV/contents/${path}`);
      if (result.data.content) {
        result.data.decoded = atob(result.data.content.replace(/\s/g, ''));
      }
      return new Response(JSON.stringify(result, null, 2), { headers: { 'Content-Type': 'application/json', ...cors } });
    }

    if (url.pathname === '/task' && request.method === 'POST') {
      const { task, path, branch } = await request.json().catch(() => ({}));
      const repoPath = path || '';
      const repo = await github(`/repos/defragapp/SOVV/contents/${repoPath}?ref=${branch || 'main'}`);
      let fileContent = '';
      if (!Array.isArray(repo.data) && repo.data.content) {
        fileContent = atob(repo.data.content.replace(/\s/g, ''));
      }
      const context = Array.isArray(repo.data) 
        ? repo.data.map(f => ({ name: f.name, type: f.type, path: f.path }))
        : { name: repo.data.name, path: repo.data.path, size: repo.data.size };
      const aiRes = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
        messages: [
          { role: 'system', content: 'You are the Sovereign platform architect. You have full read access to the SOVV repo. Analyze code, suggest implementations, and provide deployment-ready outputs. Be concise and technical.' },
          { role: 'user', content: `Task: ${task || 'Analyze repo structure'}\n\nRepo path: ${repoPath || 'root'}\n\nFiles/context:\n${JSON.stringify(context, null, 2)}\n\nFile content (if applicable):\n${fileContent.substring(0, 12000)}` }
        ]
      });
      return Response.json({ 
        task: task || 'Analyze repo structure', 
        aiResponse: aiRes.response?.choices?.[0]?.message?.content || aiRes.response,
        repoPath: repoPath || 'root',
        context
      }, { headers: cors });
    }

    if (url.pathname === '/deploy' && request.method === 'POST') {
      const { scriptName, scriptCode, cfApiToken } = await request.json().catch(() => ({}));
      if (!scriptName || !scriptCode || !cfApiToken) {
        return Response.json({ error: 'Need scriptName, scriptCode, cfApiToken' }, { status: 400, headers: cors });
      }
      const deployRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/workers/scripts/${scriptName}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${cfApiToken}`,
          'Content-Type': 'application/javascript'
        },
        body: scriptCode
      });
      const deployData = await deployRes.json();
      return Response.json({ deployed: deployRes.ok, result: deployData }, { headers: cors });
    }

    return Response.json({ 
      status: 'Sovereign Agent active', 
      endpoints: [
        { method: 'GET', path: '/repo?path=', desc: 'List repo contents' },
        { method: 'GET', path: '/file?path=', desc: 'Get decoded file content' },
        { method: 'POST', path: '/task', body: '{task, path?, branch?}', desc: 'AI task with repo context' },
        { method: 'POST', path: '/deploy', body: '{scriptName, scriptCode, cfApiToken}', desc: 'Deploy a Worker script' }
      ],
      repo: 'https://github.com/defragapp/SOVV'
    }, { headers: cors });
  }
}
