# Defrag Workspace Architecture Map

Sprint: Defrag Workspace Stabilization  
Task: 1.1 Architecture Review  
Surface: `apps/web/app/apps/defrag/workspace/page.tsx`

This document maps the current Defrag workspace so future refactors can improve the flagship experience without redistributing complexity or breaking runtime behavior.

## 1. System topology

```text
DefragWorkspacePage
├── Query prefill
├── Baseline context
│   ├── Baseline fetch
│   ├── Baseline compilation polling
│   └── Derived profile statements
├── Memory and history context
│   ├── Pattern memory fetch
│   └── Recent thread continuity
├── Main Defrag orchestration
│   ├── Standard explain request
│   ├── Streaming explain request
│   ├── Message mode request
│   └── Depth re-submit request
├── Composer
│   ├── Primary input
│   ├── Compare mode
│   └── Read-a-message mode
├── Result presentation
│   ├── ResultCard
│   ├── Save to history
│   ├── Invite modal trigger
│   └── Step-deeper actions
├── Audio overview
│   ├── Audio generation request
│   ├── Object URL lifecycle
│   └── Audio playback
├── Library context panel
│   ├── Saved result fetch
│   └── Saved result links
├── Navigation
│   ├── Back to Defrag
│   ├── Alignment handoff
│   └── Covenant handoff
└── SpaceShell integration
    ├── Sidebar
    ├── Main thread
    ├── Right context panel
    └── Mobile tabs
```

### Node summary

| Node | Purpose | Inputs | Outputs | External dependencies |
| --- | --- | --- | --- | --- |
| Query prefill | Seeds the composer from `?prompt=` for onboarding and cross-space handoff. | `window.location.search` | `input` state | Browser URL APIs |
| Baseline context | Loads and displays the private Baseline Design layer. | Auth cookie, `/api/baseline`, `/api/baseline/status`, `/api/derive-profile` | `baseline`, `datasetStatus`, `baselineStatements` | Next API routes, auth session |
| Memory/history context | Adds continuity from prior sessions. | `/api/memory`, local `thread` | `recurringPattern`, `sessionCount`, `priorPatterns` | Next API routes |
| Main Defrag orchestration | Submits user input and receives pattern analysis. | `input`, mode flags, thread context | `result`, `streamingText`, `error`, `thread` | `/api/explain`, `/api/explain/stream`, `/api/defrag/message` |
| Composer | Captures the user's current moment and mode. | User typing and mode toggles | `input`, `compareMode`, `compareName`, `messageMode` | DOM keyboard events |
| Result presentation | Shows structured output and next actions. | `result`, `input`, save state | UI, save requests, invite modal, cross-space routes | `ResultCard`, `/api/history`, `InviteModal` |
| Audio overview | Converts a result into audio when available. | `result.media`, `result` text | `audioUrl`, playback | `/api/audio`, browser `URL.createObjectURL` |
| Library panel | Shows saved Defrag results. | `saveSuccess`, auth cookie | `library`, saved links | `/api/library?workspace_source=DEFRAG` |
| Navigation | Connects Defrag to other spaces. | result flow / alignment fields | route changes | Next/anchor navigation |
| SpaceShell integration | Composes desktop and mobile workspace layout. | sidebar/main/context JSX | responsive shell | `SpaceShell` |

## 2. Responsibility classification

| Area | UI | State container | Side effects | Orchestration | Derived data |
| --- | --- | --- | --- | --- | --- |
| `DefragWorkspacePage` root | ✅ | ✅ | ✅ | ✅ | ✅ |
| Sidebar baseline panel | ✅ | ❌ | ❌ | ❌ | ✅ |
| Context/library panel | ✅ | ❌ | ❌ | ❌ | ✅ |
| Main thread panel | ✅ | ❌ | ❌ | ✅ | ✅ |
| Composer | ✅ | ✅ | ✅ | ✅ | ❌ |
| Streaming block | ✅ | ❌ | ✅ | ✅ | ❌ |
| Result actions | ✅ | ✅ | ✅ | ✅ | ✅ |
| Audio block | ✅ | ✅ | ✅ | ✅ | ✅ |
| Flow suggestion cards | ✅ | ❌ | ❌ | ✅ | ✅ |

### Current architectural observation

`DefragWorkspacePage` is the primary hidden orchestrator. It renders the full workspace while also owning network lifecycle, streaming lifecycle, audio lifecycle, library refresh, memory context, save state, mode state, and cross-space routing.

That is acceptable for the current stabilization phase, but it should be reduced through deliberate extractions.

## 3. State ownership map

| State | Owner | Mutators | Consumers | Shared? | Notes |
| --- | --- | --- | --- | --- | --- |
| `input` | Workspace root | composer, query prefill | submit handlers, ResultCard, cross-space handoff | No | Candidate to move into Composer later, but not during Phase 1. |
| `result` | Workspace root | submit handlers, depth submit, message mode | main panel, audio, save, flow cards, ResultCard | Yes within workspace | High-gravity state. Keep root-owned until orchestration is extracted. |
| `thread` | Workspace root | submit handlers | explain request priorPatterns | No | Small continuity buffer. Could become a hook with explain orchestration. |
| `isLoading` | Workspace root | submit handlers | composer, loading UI | Yes within workspace | Coupled to both streaming and non-streaming states. |
| `streamingText` | Workspace root | stream request | streaming UI | Yes within main | High-risk to move before stream lifecycle is isolated. |
| `error` | Workspace root | submit handlers | error UI | Yes within main | Can use shared UI safely without moving ownership. |
| `isSaving` | Workspace root | `handleSave` | ResultCard | No | Result action state. Candidate for `useSaveResult` hook. |
| `saveSuccess` | Workspace root | `handleSave` | ResultCard, library refresh effect | Yes | Couples ResultCard success and library reload. |
| `inviteOpen` | Workspace root | ResultCard invite action | InviteModal | No | Safe as root-owned modal state. |
| `baseline` | Workspace root | baseline fetch | sidebar, main state gating, effects | Yes | Important workspace prerequisite. |
| `baselineLoading` | Workspace root | baseline fetch | sidebar, main no-baseline state | Yes | Safe to keep with baseline hook later. |
| `baselineStatements` | Workspace root | derived profile fetch | sidebar | No | Candidate for `useBaselineContext`. |
| `statementsLoading` | Workspace root | derived profile fetch | sidebar | No | Candidate for `useBaselineContext`. |
| `datasetStatus` | Workspace root | status poll | sidebar footer | No | Polling belongs in `useBaselineContext`. |
| `recurringPattern` | Workspace root | memory fetch | sidebar | No | Candidate for `useMemoryContext`. |
| `sessionCount` | Workspace root | memory fetch | sidebar | No | Candidate for `useMemoryContext`. |
| `compareMode` | Workspace root | composer toggles | submit body, composer UI | No | Composer-owned later; keep root-owned until submit orchestration is extracted. |
| `compareName` | Workspace root | composer input | submit body, composer UI | No | Composer-owned later. |
| `messageMode` | Workspace root | composer toggles | submit path, composer UI | No | Controls endpoint selection; keep root-owned until submit orchestration is extracted. |
| `audioUrl` | Workspace root | audio generation, cleanup effect | context panel audio | No | Coupled to browser object URL lifecycle. |
| `isGeneratingAudio` | Workspace root | audio generation | audio button | No | Candidate for `useAudioOverview`. |
| `audioError` | Workspace root | audio generation | audio panel | No | Candidate for `useAudioOverview`. |
| `library` | Workspace root | library fetch | context panel | No | Candidate for `useLibraryPanel`. |
| `libraryLoading` | Workspace root | library fetch | context panel | No | Candidate for `useLibraryPanel`. |

## 4. Duplication index

### A. UI duplication

| Pattern | Current location | Severity | Suggested convergence |
| --- | --- | --- | --- |
| Panel headers | Sidebar, context panel, main panel | Medium | `PanelHeader` from `WorkspaceStates`. |
| Evidence chips | Local `EvidenceChip` duplicates shared primitive | Low | Use `SharedEvidenceChip tone="accent"`. |
| Empty states | No baseline, ready state, library empty | Medium | `PremiumEmptyState` and `OsHintCard`. |
| Loading states | Non-streaming result load, library spinner, skeletons | Medium | Shared loading for major states; keep small skeletons where useful. |
| Error states | Main error display and page error boundary | Medium | `PremiumErrorState`. |
| Flow suggestion cards | Alignment/Covenant cards inline | Low | Future `NextSpaceCard`. |
| Composer action buttons | Inline button styling | Medium | Future `ComposerToggle` / `PrimaryActionButton`. |

### B. Logic duplication

| Pattern | Current location | Severity | Suggested convergence |
| --- | --- | --- | --- |
| JSON fetch and fallback parsing | baseline, derive-profile, memory, library, explain | Medium | Future typed fetch helpers or hooks. |
| Error normalization | explain, message, audio, save | Medium | Future `normalizeApiError`. |
| Loading lifecycle | submit, depth submit, audio, save, library | Medium | Keep separate initially; later isolate per hook. |
| Result text construction | save and audio generation | Low | Future `getResultSummaryText`. |

### C. State duplication / state gravity

| Concept | Current form | Risk | Suggested convergence |
| --- | --- | --- | --- |
| result lifecycle | `result`, `isLoading`, `streamingText`, `error` | High | Future `useDefragRun`. |
| baseline lifecycle | `baseline`, loading, statements, status | Medium | Future `useBaselineContext`. |
| library refresh | `saveSuccess` triggers fetch effect | Medium | Future explicit `refreshLibrary`. |
| mode state | compare and message modes in root | Medium | Future composer reducer after submit logic is isolated. |

## 5. Coupling and risk zones

| Zone | Risk | Reason | Guidance |
| --- | --- | --- | --- |
| Streaming request plus standard explain request | 🔴 High | Two requests run concurrently; stream is progressive UI while `/api/explain` provides structured final result. Altering timing can break perceived responsiveness or duplicate output. | Do not refactor until `useDefragRun` is designed and tested. |
| Audio object URL lifecycle | 🔴 High | Browser object URLs must be revoked correctly; audio playback is tied to generated result text. | Do not combine with streaming refactors. Extract only after UI is stable. |
| Message mode branch | 🟡 Medium | Uses `/api/defrag/message` and maps custom response fields into `DefragResult`. | Preserve shape mapping exactly during UI changes. |
| Depth resubmission | 🟡 Medium | Reuses current `input` and mutates `result` without changing thread consistently. | Avoid changing until result orchestration is isolated. |
| Save success and library refresh | 🟡 Medium | `saveSuccess` is both UI confirmation and refresh trigger. | Safe to extract later with explicit refresh. |
| Baseline status polling | 🟡 Medium | Polling lifecycle depends on `baseline` and active flag. | Safe candidate for hook after visual pass. |
| Panel header and empty/loading UI | 🟢 Low | Pure presentation; no state ownership changes needed. | Best Phase 1 target. |
| Encoding artifact cleanup | 🟢 Low | User-facing string cleanup only. | Safe Phase 1 target if scoped to strings/comments. |

## 6. Extraction candidates

### Phase 1 — Safe presentation extraction

These are Task 1.2 candidates. They should not change behavior or state ownership.

1. Replace local `EvidenceChip` with shared `WorkspaceStates.EvidenceChip`.
2. Replace sidebar/context/main header markup with `PanelHeader`.
3. Replace no-baseline and ready empty states with `PremiumEmptyState`.
4. Replace non-streaming loading state with `PremiumLoadingState` while preserving streaming UI.
5. Replace main error state with `PremiumErrorState`.
6. Clean visible mojibake in comments and user-facing strings.

### Phase 2 — Structured component extraction

These reduce file size without changing business logic.

1. Extract `BaselineSidebar` component with current props and no internal fetch yet.
2. Extract `SavedResultsPanel` component with current props and no internal fetch yet.
3. Extract `DefragComposer` component while keeping state owned by the page.
4. Extract `StreamingPreview` as a pure component.
5. Extract `NextSpaceSuggestion` for Alignment/Covenant handoffs.

### Phase 3 — Hook and orchestration extraction

These change ownership boundaries and require more verification.

1. `useBaselineContext` for baseline fetch, status polling, and derived statements.
2. `useDefragRun` for submit, stream, structured result, message mode, and depth handling.
3. `useLibraryResults` for saved result fetch and refresh.
4. `useAudioOverview` for audio generation, object URL lifecycle, playback, and error state.
5. Composer state reducer for compare/message modes and draft.

## Recommended Task 1.2

Start with Phase 1 only:

- Shared chip replacement.
- Panel header replacement.
- No-baseline, ready, non-streaming loading, and main error state replacement.
- Encoding artifact cleanup.

This is high-visibility, low-risk, and establishes the convergence path for later extraction.

## Explicit non-goals for Task 1.2

Do not:

- Move state.
- Change API routes.
- Change streaming timing.
- Touch audio lifecycle.
- Merge message mode with standard explain mode.
- Extract hooks.
- Change ResultCard props.
- Change SpaceShell layout.

## Completion status for Task 1.1

- Major modules mapped: complete.
- State ownership documented: complete.
- Safe extraction candidates identified: complete.
- High-risk areas marked: complete.
- Phased refactor plan created: complete.

Task 1.1 is complete once this document is committed and referenced before Task 1.2 implementation begins.
