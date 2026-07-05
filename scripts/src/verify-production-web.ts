const DEFAULT_URLS = [
  "https://defrag.app/",
  "https://www.defrag.app/",
];

const expectedSignals = [
  "Sovereign.os",
  "Baseline Design",
  "Pattern-aware AI",
  "pattern-aware AI",
];

const forbiddenLegacySignals = [
  "You know what you meant. Defrag shows you what they may have heard.",
  "Defrag shows you what they may have heard",
  "Sends to chadowen93@gmail.com",
  "Return to your relational workspace",
];

type CheckResult = {
  url: string;
  finalUrl: string;
  status: number;
  ok: boolean;
  failures: string[];
  matchedExpected: string[];
  matchedForbidden: string[];
};

function configuredUrls(): string[] {
  const raw = process.env.PRODUCTION_WEB_URLS;
  if (!raw) return DEFAULT_URLS;

  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function cacheBust(url: string): string {
  const next = new URL(url);
  next.searchParams.set("sovv_live_smoke", String(Date.now()));
  return next.toString();
}

function compactHtml(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

async function checkUrl(url: string): Promise<CheckResult> {
  const target = cacheBust(url);
  const response = await fetch(target, {
    redirect: "follow",
    headers: {
      "user-agent": "SOVV production web smoke check",
      "cache-control": "no-cache",
      pragma: "no-cache",
    },
  });

  const body = compactHtml(await response.text());
  const matchedExpected = expectedSignals.filter((signal) => body.includes(signal));
  const matchedForbidden = forbiddenLegacySignals.filter((signal) => body.includes(signal));
  const failures: string[] = [];

  if (response.status < 200 || response.status >= 400) {
    failures.push(`Unexpected HTTP status ${response.status}`);
  }

  if (matchedForbidden.length > 0) {
    failures.push(`Legacy production copy is still present: ${matchedForbidden.join(" | ")}`);
  }

  if (matchedExpected.length === 0) {
    failures.push(`Current Sovereign.os signals not found. Expected one of: ${expectedSignals.join(" | ")}`);
  }

  return {
    url,
    finalUrl: response.url,
    status: response.status,
    ok: failures.length === 0,
    failures,
    matchedExpected,
    matchedForbidden,
  };
}

async function main() {
  const urls = configuredUrls();
  const results = await Promise.all(urls.map(checkUrl));

  console.log("Production web smoke results:");
  for (const result of results) {
    console.log(JSON.stringify(result, null, 2));
  }

  const failures = results.filter((result) => !result.ok);
  if (failures.length > 0) {
    console.error(`Production web smoke failed for ${failures.length} URL(s).`);
    process.exit(1);
  }

  console.log("Production web smoke passed. Current Sovereign.os build appears live.");
}

main().catch((error) => {
  console.error("Production web smoke crashed:", error);
  process.exit(1);
});
