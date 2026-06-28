# Copilot repository instructions

## Working mode
When asked to implement work in this repository:
- do not stop at analysis
- inspect the actual code first
- edit files directly
- create missing files/helpers/tests when needed
- run verification after changes
- fix failures and continue iterating
- only stop when the requested work is complete or there is a concrete blocker

## Verification discipline
- detect the correct package manager and task runner from the repository
- prefer narrow verification first for touched packages/apps
- then run broader workspace checks where available
- if a command fails, debug and fix before stopping

## Change discipline
- preserve behavior unless the requested change intentionally alters it
- prefer focused, low-risk refactors over large rewrites
- reuse existing repo conventions for logging, testing, architecture, and file structure
- if a referenced path has moved, locate the current equivalent and continue

## Performance priorities
When asked to improve performance, prioritize:
1. realtime hot-path amplification
2. repeated request-path storage/context loads
3. retry-amplified AI/model calls
4. duplicated parsing/validation work
5. route-wide auth or middleware duplication
6. heavy client bundles only after backend hotspots are addressed unless explicitly requested otherwise

## Completion output
At the end of implementation, always report:
- files changed
- commands run
- results of commands
- remaining blockers if any
