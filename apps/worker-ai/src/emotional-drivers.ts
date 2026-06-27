// @ts-nocheck
export interface EmotionalDriversRequest {
  sessionId: string;
  targetUserId: string;
  transcriptChunk: string;
}

export interface EmotionalDriversResponse {
  privateView: {
    headline: string;
    summary: string;
    suggestions: string[];
  };
  sharedView: {
    headline: string;
    summary: string;
  };
}

export async function handleEmotionalDrivers(
  request: Request,
  env: { AI: any }
): Promise<Response> {
  let body: Partial<EmotionalDriversRequest>;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { sessionId, targetUserId, transcriptChunk } = body;

  if (!sessionId || !targetUserId || !transcriptChunk) {
    return Response.json(
      {
        error:
          "Missing required fields: sessionId, targetUserId, transcriptChunk",
      },
      { status: 400 }
    );
  }

  const aiResponse = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
    messages: [
      { role: "system", content: "You are an emotional dynamics analyst..." },
      { role: "user", content: transcriptChunk }
    ]
  });

  const payload: EmotionalDriversResponse = {
    privateView: {
      headline: "Emotional driver detected",
      summary: aiResponse.response ?? "This moment may relate to wanting to feel seen or understood.",
      suggestions: [
        "Try expressing what you needed in that moment.",
        "Name what the moment represented emotionally before defending your position.",
        "Use one sentence that starts with: 'What mattered to me here was...'",
      ],
    },
    sharedView: {
      headline: "Shared perspective",
      summary: aiResponse.response ?? "It may help to explain what this moment represents emotionally, not only what happened.",
    },
  };

  return Response.json(payload);
}
