#!/usr/bin/env bash

set -euo pipefail

MESSAGE="${1:-chore: sync main and deploy}"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "This script must be run from a Git repository." >&2
  exit 1
fi

git switch main
git pull --ff-only

git add .

if git diff --cached --quiet; then
  echo "No changes to commit. Only pushing current main state."
else
  git commit -m "$MESSAGE"
fi

git push origin main
