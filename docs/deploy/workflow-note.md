# Workflow note

The current platform workflow needs review before it is used for web-only production releases.

A safe web release path should be scoped to `apps/web` and `sovv-web` only. It should not redeploy unrelated Workers or agents.

Required follow-up:

- split broad platform deployment from web-only release work, or
- add explicit manual target selection, or
- use a dedicated manual web-only workflow.
