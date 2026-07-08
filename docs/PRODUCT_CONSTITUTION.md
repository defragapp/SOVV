# Sovereign Product Constitution

Sovereign.os is a personal operating system for human decision-making. It is not a chat app, a dashboard, or a collection of disconnected tools. Every implementation should move the platform toward a coherent, premium, stable environment where users can understand what is active, respond with clarity, and build continuity over time.

## Product thesis

Sovereign helps users move from reaction to clarity.

The product is organized around a private personal context layer and a set of focused spaces:

- **Baseline Design** establishes enduring personal context.
- **Defrag** reads what is active in the current moment.
- **Alignment** clarifies interpersonal dynamics and best next response.
- **Covenant** supports values, boundaries, faith-informed reflection, and commitment.
- **Library** preserves useful intelligence so clarity compounds.

These spaces must feel like rooms in the same operating system, not separate applications.

## Product standard

Every shipped feature should be:

- **Purposeful** — every element has a reason to exist.
- **Calm** — minimal visual noise, clear hierarchy, restrained motion.
- **Trustworthy** — sensitive moments are handled with privacy, sobriety, and care.
- **Premium** — quality is expressed through restraint, typography, spacing, and interaction craft.
- **Resilient** — loading, empty, error, offline, and permission states are designed experiences.
- **Accessible** — keyboard navigation, semantic structure, focus states, and contrast are part of done.
- **Extensible** — new work strengthens the system instead of creating one-off patterns.

## Operating loop

All development should follow this loop:

1. **Read** the real implementation.
2. **Understand** current behavior and constraints.
3. **Plan** the smallest coherent improvement.
4. **Improve** code, UX, architecture, or stability.
5. **Commit** a clean, reversible change.
6. **Verify** the change using available runtime and repository tools.
7. **Repeat** only after the task is complete.

Do not rewrite large surfaces speculatively. Refactor when it reduces complexity or improves stability, but preserve user-facing behavior unless the task explicitly changes it.

## Definition of done

A task is complete only when:

- The intended workflow works end to end.
- The UI matches the Sovereign visual language.
- Loading, empty, error, and success states are accounted for.
- Responsive behavior is considered.
- Accessibility basics are preserved or improved.
- TypeScript remains clear and maintainable.
- The change is committed and the commit result is confirmed.
- Any deployment or production status claims are verified through runtime tools.

Compiling is necessary but not sufficient.

## Visual language

Sovereign should feel cinematic, restrained, and intentional.

Preferred qualities:

- Deep black and zinc surfaces.
- Subtle glass and soft depth.
- Thin white borders with low opacity.
- Warm restrained accent: `#e0743a`.
- JetBrains Mono for labels, system text, metadata, and operational cues.
- Serif or refined display typography for emotional hierarchy where already established.
- Purposeful motion using the established easing curve `[0.16, 1, 0.3, 1]`.
- No noisy dashboards, novelty gradients, toy-like effects, or decorative animation without purpose.

Visual complexity should decrease as product capability increases.

## Architecture standard

Prefer systems over pages.

When building or modifying UI:

- Reuse existing primitives before inventing new ones.
- Extract shared components when two or more spaces need the same pattern.
- Keep API contracts stable unless the backend task explicitly changes them.
- Avoid broad rewrites of integrated files until responsibilities are understood.
- Split large files only when the extraction boundary is obvious and behavior can be preserved.
- Keep product spaces consistent through shared shells, panel headers, state components, and motion patterns.

Large files are acceptable temporarily. Unclear ownership is not.

## Stability standard

Sovereign must feel dependable.

Every sprint should reduce at least one of:

- duplicated UI
- inconsistent copy
- fragile state handling
- unhandled errors
- loading ambiguity
- visual drift
- unsupported edge cases
- unclear deployment status

No commit should knowingly degrade runtime behavior.

## Growth standard

Growth should come after trust.

The priority order is:

1. Activation: user reaches first meaningful Defrag.
2. Trust: product feels private, polished, and stable.
3. Retention: Library and memory make clarity compound.
4. Conversion: Alignment and Covenant justify Pro.
5. Growth: referrals, invites, and lifecycle flows scale what already works.

Do not optimize pricing, referrals, or acquisition before the core journey feels excellent.

## Current product priorities

1. Stabilize and polish Defrag as the flagship free space.
2. Make onboarding feel like one continuous journey into first Defrag.
3. Bring Alignment and Covenant to the same visual and interaction standard.
4. Complete Settings as a trust surface for billing, privacy, notifications, sessions, and account control.
5. Strengthen Library into the continuity layer.
6. Verify deployment health and monitoring.
7. Finish entitlement, retention, and security posture for Pro spaces.

## Release discipline

Follow the repository runbooks for deployment and rollback.

Before claiming production release:

- Confirm the branch and SHA.
- Confirm checks or available validation.
- Confirm the Cloudflare target.
- Confirm no unrelated workers were touched.
- Confirm no secrets were printed or committed.
- Confirm route or deployment status with runtime tools.

If deployment visibility is incomplete, report that directly.

## Agent behavior

An autonomous build agent should act as a product steward:

- Pick one active task.
- Complete it before moving on.
- Prefer small reversible commits.
- Keep the backlog current.
- Surface risks honestly.
- Never fabricate builds, deploys, tests, or runtime status.
- Move the platform toward coherence, stability, and growth-readiness with every cycle.

The goal is not to add more surface area. The goal is to make Sovereign feel complete.
