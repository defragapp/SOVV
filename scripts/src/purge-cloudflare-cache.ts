type CloudflarePurgeResponse = {
  success?: boolean;
  errors?: Array<{ code?: number; message?: string }>;
  messages?: Array<{ code?: number; message?: string }>;
  result?: { id?: string };
};

const defaultHosts = ["defrag.app", "www.defrag.app", "app.defrag.app", "sovereign.defrag.app"];

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function configuredHosts(): string[] {
  const raw = process.env.CLOUDFLARE_PURGE_HOSTS;
  if (!raw) return defaultHosts;

  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

async function main() {
  const token = requireEnv("CLOUDFLARE_API_TOKEN");
  const zoneId = requireEnv("CLOUDFLARE_ZONE_ID");
  const hosts = configuredHosts();

  const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ hosts }),
  });

  const payload = (await response.json()) as CloudflarePurgeResponse;

  console.log(
    JSON.stringify(
      {
        status: response.status,
        hosts,
        success: payload.success,
        messages: payload.messages ?? [],
        errors: payload.errors ?? [],
        result: payload.result ?? null,
      },
      null,
      2,
    ),
  );

  if (!response.ok || payload.success !== true) {
    throw new Error("Cloudflare cache purge failed");
  }

  console.log(`Cloudflare cache purge requested for ${hosts.join(", ")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
