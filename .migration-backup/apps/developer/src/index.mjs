const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DEVELOPER // SOVEREIGN.OS</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;font-family:monospace}
    body{background:#000;color:#fff;height:100vh;display:flex;flex-direction:column}
    #header{padding:12px 16px;border-bottom:1px solid #fff;display:flex;justify-content:space-between;align-items:center}
    #header .status{display:flex;align-items:center;gap:8px;font-size:12px;color:#888}
    #header .dot{width:8px;height:8px;background:#f00}
    #header .dot.on{background:#0f0}
    #toolbar{padding:8px 16px;border-bottom:1px solid #333;display:flex;gap:8px}
    .btn{background:#000;color:#fff;border:1px solid #fff;padding:6px 12px;font-size:11px;cursor:pointer}
    .btn:hover{background:#fff;color:#000}
    #chat{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}
    .msg{max-width:85%;padding:12px;font-size:13px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word;border:1px solid #fff}
    .msg.user{align-self:flex-end;background:#111}
    .msg.agent{align-self:flex-start;background:#000;color:#ccc;border-color:#555}
    .msg.data{align-self:flex-start;background:#000;color:#0f0;border-color:#0f0;font-size:12px}
    #input{padding:16px;border-top:1px solid #fff;display:flex;gap:8px}
    #prompt{flex:1;background:#000;color:#fff;border:1px solid #555;padding:12px;font-size:13px}
    #prompt:focus{outline:none;border-color:#fff}
    #go{background:#fff;color:#000;border:none;padding:0 20px;cursor:pointer;font-weight:700}
  </style>
</head>
<body>
  <div id="header">
    <div>DEVELOPER // SOVEREIGN.OS</div>
    <div class="status"><span id="st">OFFLINE</span><div id="dot" class="dot"></div></div>
  </div>
  <div id="toolbar">
    <button class="btn" onclick="q('health')">HEALTH</button>
    <button class="btn" onclick="q('read apps/web/app/page.tsx')">READ WEB</button>
    <button class="btn" onclick="q('read docs/03_AI_AGENT_GUARDRAILS.md')">GUARDRAILS</button>
    <button class="btn" onclick="q('check subscription default-user')">SUBSCRIPTION</button>
  </div>
  <div id="chat"></div>
  <div id="input">
    <input id="prompt" placeholder="Command..." autocomplete="off" />
    <button id="go" onclick="send()">EXECUTE</button>
  </div>
  <script>
    let ws=null
    function connect(){
      ws=new WebSocket('wss://'+location.host+'/default')
      ws.onopen=function(){document.getElementById('st').textContent='ONLINE';document.getElementById('dot').classList.add('on')}
      ws.onclose=function(){document.getElementById('st').textContent='OFFLINE';document.getElementById('dot').classList.remove('on');setTimeout(connect,2000)}
      ws.onmessage=function(e){
        var m=JSON.parse(e.data)
        if(m.type==='text')add('agent',m.content)
        if(m.type==='data')add('data',JSON.stringify(m.payload,null,2))
        if(m.type==='error')add('agent','ERROR: '+m.message)
      }
    }
    function add(role,text){
      var d=document.createElement('div')
      d.className='msg '+role
      d.textContent=text
      document.getElementById('chat').appendChild(d)
      document.getElementById('chat').scrollTop=document.getElementById('chat').scrollHeight
    }
    function send(){
      var i=document.getElementById('prompt')
      var v=i.value.trim()
      if(!v||!ws||ws.readyState!==1)return
      add('user',v)
      ws.send(JSON.stringify({cmd:v}))
      i.value=''
    }
    function q(t){document.getElementById('prompt').value=t;send()}
    document.getElementById('prompt').addEventListener('keypress',function(e){if(e.key==='Enter')send()})
    connect()
  </script>
</body>
</html>`;

export class DeveloperAgent {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    await this.state.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT,
        content TEXT,
        created DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    const url = new URL(request.url);
    
    if (request.headers.get("Upgrade") === "websocket") {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      this.handleWS(server);
      return new Response(null, { status: 101, webSocket: client });
    }
    
    if (url.pathname === "/api/history") {
      const rows = await this.state.storage.sql.exec(
        "SELECT role, content, created FROM messages ORDER BY created ASC LIMIT 100"
      ).toArray();
      return Response.json(rows);
    }
    
    return new Response(HTML, { headers: { "Content-Type": "text/html" } });
  }

  async handleWS(ws) {
    ws.accept();
    ws.addEventListener("message", async (e) => {
      try {
        const data = JSON.parse(e.data);
        const cmd = data.cmd.toLowerCase();
        let result;
        
        if (cmd === "health" || cmd.includes("status")) {
          result = { text: "HEALTH\nD1: " + !!this.env.DEVELOPER_DB + "\nR2: " + !!this.env.DEVELOPER_ASSETS + "\nAI: " + !!this.env.AI + "\nGitHub: " + !!this.env.GITHUB_TOKEN };
        } else if (cmd.startsWith("read ")) {
          const path = data.cmd.match(/(apps\/|docs\/)[\w\.\/\-]+/)?.[0] || "README.md";
          result = await this.readFile(path);
        } else if (cmd.includes("subscription")) {
          const uid = data.cmd.match(/[a-f0-9-]{36}/)?.[0] || "default-user";
          result = await this.checkSub(uid);
        } else {
          result = { text: "COMMANDS: health | read [path] | subscription [id]" };
        }
        
        await this.state.storage.sql.exec(
          "INSERT INTO messages (role, content) VALUES ('user', ?), ('agent', ?)",
          data.cmd, result.text
        );
        
        ws.send(JSON.stringify({ type: "text", content: result.text }));
        
      } catch (err) {
        ws.send(JSON.stringify({ type: "error", message: err.message }));
      }
    });
  }

  async readFile(path) {
    if (!this.env.GITHUB_TOKEN) return { text: "ERROR: No GITHUB_TOKEN" };
    const res = await fetch("https://api.github.com/repos/defragapp/SOVV/contents/" + path, {
      headers: { Authorization: "Bearer " + this.env.GITHUB_TOKEN, Accept: "application/vnd.github.v3+json", "User-Agent": "developer-agent" }
    });
    if (!res.ok) return { text: "ERROR: " + res.status };
    const data = await res.json();
    if (!data.content) return { text: "Not a file" };
    const content = atob(data.content.replace(/\n/g, ""));
    return { text: "FILE: " + path + "\n\n" + content.slice(0, 2000) };
  }

  async checkSub(userId) {
    try {
      const row = await this.env.DEVELOPER_DB.prepare(
        "SELECT u.id, u.role, s.status FROM users u LEFT JOIN subscriptions s ON u.id = s.user_id WHERE u.id = ?1 LIMIT 1"
      ).bind(userId).first();
      if (!row) return { text: "User not found" };
      return { text: "USER: " + row.id + "\nROLE: " + (row.role || "none") + "\nSTATUS: " + (row.status || "inactive") };
    } catch (e) {
      return { text: "DB ERROR: " + e.message };
    }
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.headers.get("Upgrade") === "websocket") {
      const id = env.AGENT_STATE.idFromName("default");
      return env.AGENT_STATE.get(id).fetch(request);
    }
    if (url.pathname === "/api/history") {
      const id = env.AGENT_STATE.idFromName("default");
      return env.AGENT_STATE.get(id).fetch(request);
    }
    return new Response(HTML, { headers: { "Content-Type": "text/html" } });
  }
};
