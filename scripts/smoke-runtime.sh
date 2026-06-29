#!/usr/bin/env bash
set -euo pipefail

API_BASE_URL="${API_BASE_URL:-http://127.0.0.1:8787}"
AI_BASE_URL="${AI_BASE_URL:-http://127.0.0.1:8788}"

echo "Running runtime smoke checks..."

health_status="$(curl -sS -o /tmp/sovv-health.json -w "%{http_code}" "${API_BASE_URL}/health")"
if [[ "${health_status}" != "200" ]]; then
  echo "Health endpoint failed with status ${health_status}"
  exit 1
fi

ai_status="$(curl -sS -o /tmp/sovv-ai.json -w "%{http_code}" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"smoke-session","targetUserId":"smoke-user","transcriptChunk":"quick smoke test"}' \
  "${AI_BASE_URL}/emotional-drivers")"
if [[ "${ai_status}" != "200" ]]; then
  echo "AI endpoint failed with status ${ai_status}"
  exit 1
fi

billing_status="$(curl -sS -o /tmp/sovv-billing.json -w "%{http_code}" "${API_BASE_URL}/api/stripe/prices")"
if [[ "${billing_status}" != "200" ]]; then
  echo "Billing endpoint failed with status ${billing_status}"
  exit 1
fi

echo "Smoke checks passed."
