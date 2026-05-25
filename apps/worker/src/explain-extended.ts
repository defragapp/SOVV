import { getAuthUser, jsonResponse } from "./auth"

interface ExplainRequestBody {
  message: string
  target?: {
    id: string
    relation: string
  }
}

const SYSTEM_SELF = `You are Sovereign — a perspective-shift engine, not a therapist.

Help the user see what they couldn't see from inside the moment.

Rules:
- Never diagnose, pathologize, or clinicalize
- Never say "it sounds like" or "I hear that"
- Be direct, specific, and structural
- Name the pattern, not the symptom
- Always provide a concrete move

Respond in this exact JSON format only, no markdown, no code fences:
{
  "response": "2-4 sentences reframing what they described",
  "shift": { "label": "Short shift name", "summary": "One sentence explaining the shift" },
  "move": { "label": "Short action name", "description": "Specific concrete next step", "difficulty": "gentle|moderate|direct" },
  "insights": [{ "id": "ins_001", "type": "pattern", "title": "Short title", "detail": "What the pattern is", "source": "baseline" }]
}`

const SYSTEM_RELATIONAL = `You are Sovereign — a perspective-shift engine for relational dynamics.

When a target person is provided, analyze the structural tension between the user and that person.

Rules:
- Never take sides, never diagnose either person
- Name the dynamic, not the blame
- Show both sides of the tension
- Be structural, not sentimental

Respond in this exact JSON format only, no markdown, no code fences:
{
  "response": "2-4 sentences about the dynamic",
  "shift": { "label": "Short shift name", "summary": "One sentence explaining the shift" },
  "pressure_points": [{ "type": "emotional|structural|communication", "label": "Short name", "description": "What the tension is", "yours": "Your side", "theirs": "Their side" }],
  "move": { "label": "Short action name", "description": "Specific concrete next step", "difficulty": "gentle|moderate|direct" },
  "insights": [{ "id": "ins_001", "type": "pattern|dynamic|baseline", "title": "Short title", "detail": "What this reveals", "source": "baseline|comparison|conversation" }]
}`

export function registerExplainRoute(router: any, getEnv: () => any) {
  router.post("/api/explain", async (request: Request) => {
    const { DB, KV, AI } = getEnv()

    const user = await getAuthUser(request, DB)
    if (!user) {
      return jsonResponse({ error: "needs_baseline" }, 401)
    }

    const body = await request.json() as ExplainRequestBody

    if (body.target && user.tier === "free") {
      return jsonResponse({ error: "Relational analysis requires Pro" }, 403)
    }

    const baseline = await KV.get(`baseline:${user.id}`, "json") as any
    if (!baseline) {
      return jsonResponse({ error: "needs_baseline" }, 401)
    }

    const isRelational = !!body.target
    const systemPrompt = isRelational ? SYSTEM_RELATIONAL : SYSTEM_SELF

    let userPrompt = `User baseline (hidden): DOB: ${baseline.dob}, TOB: ${baseline.tob}, POB: ${baseline.pob}\n\nMessage: ${body.message}`

    if (isRelational && body.target) {
      const targetBaseline = await KV.get(`baseline:${user.id}:person:${body.target.id}`, "json") as any
      if (targetBaseline) {
        userPrompt += `\n\nTarget (${targetBaseline.name || body.target.relation}) baseline: DOB: ${targetBaseline.dob}, TOB: ${targetBaseline.tob}, POB: ${targetBaseline.pob}`
      }
    }

    const aiResponse = await AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 1024,
    })

    let parsed: any
    try {
      const responseText = (aiResponse as any).response || ""
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { response: responseText }
    } catch {
      parsed = { response: (aiResponse as any).response || "Unable to process" }
    }

    // Ensure required fields exist
    const result: any = {
      response: parsed.response || "",
      shift: parsed.shift || { label: "Unclear", summary: "The shift is still forming" },
      move: parsed.move || { label: "Sit with it", description: "Let this settle before acting", difficulty: "gentle" },
      insights: parsed.insights || [],
      thread_meta: {
        target_id: body.target?.id,
        target_relation: body.target?.relation,
        baseline_loaded: true,
        target_baseline_loaded: isRelational ? !!await KV.get(`baseline:${user.id}:person:${body.target!.id}`) : undefined,
      },
    }

    if (parsed.pressure_points) {
      result.pressure_points = parsed.pressure_points
    }

    // Store interaction in D1
    const now = Date.now()
    await DB.prepare(
      "INSERT INTO interactions (id, session_id, mode, input, output, people, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      `int_${crypto.randomUUID().replace(/-/g, "")}`,
      user.id,
      isRelational ? "relational" : "self",
      body.message,
      JSON.stringify(result),
      isRelational ? JSON.stringify([body.target]) : "[]",
      now
    ).run()

    return jsonResponse(result)
  })
}
