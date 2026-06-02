# Product Boundaries — Sovereign.os / DEFRAG

## Purpose

Clear definition of what the product does and does not do. Use this to align support responses, marketing copy, feature decisions, and operator judgment.

---

## What the Product Does

| Capability | Description |
|---|---|
| Shows patterns | Identifies recurring loops, dynamics, and responses from baseline and thread context |
| Maps loops | Shows where a repeating pattern starts and what drives it |
| Highlights responses | Surfaces the Best Next Response based on available context |
| Helps practice decisions | Allows users to try out responses before acting |
| Organizes past insight | Saves threads, notes, and patterns in Your Space |
| Grounds the thread | Uses baseline, timing, and selected people to keep AI context consistent |
| Shows what got lit up | Identifies which part of the user's baseline is active in the moment |
| Shows the other side | Helps users see what may be active in another person when data is available and permitted |

---

## What the Product Does Not Do

| Claim | Reality |
|---|---|
| Predict future outcomes with certainty | DEFRAG shows patterns and options — not predictions |
| Know another person's private internal state | DEFRAG uses available baseline data only — never assumes private knowledge |
| Replace therapy | DEFRAG is a reflection tool, not clinical care |
| Make decisions for the user | DEFRAG shows structure — the user decides |
| Provide emergency help | DEFRAG is not a crisis service |
| Provide legal guidance | DEFRAG is not a legal tool |
| Diagnose behavior or conditions | DEFRAG does not label, diagnose, or pathologize |
| Guarantee relationship outcomes | DEFRAG shows patterns — outcomes depend on the user |
| Access another person's data without permission | DEFRAG uses only permitted, consented overlays |

---

## Safe Explanation Pattern

When a user asks "how does this work?":

**Use:**
> "It uses your baseline, what is active now, and the context you provide to organize the pattern and show the next response."

**Do not explain:**
- Mapping systems or symbolic frameworks
- Scoring or weighting logic
- Model structure or prompt chains
- Internal field names or data architecture

**Principle:** Show what helps the user use the answer. Not how the engine works under the hood.

---

## Feature Boundary Map

### Free Tier
- Baseline entry (DOB, TOB, POB)
- Self-only threads (up to 5 sessions/day)
- Core pattern recognition
- Best Next Response
- What got lit up
- Your Story (basic)

### Pro Tier
- Unlimited sessions
- People and group threads (Compare With Someone)
- Pattern memory across sessions
- Audio overview
- Watch It (when available)
- Priority processing

### Not Yet Built (do not promise)
- Live voice conflict resolution
- Real-time TTS
- Full cinematic video generation
- Multi-user live sessions
- Public sharing of sessions

---

## Confidence and Accuracy

DEFRAG outputs carry a confidence level (`low`, `medium`, `high`) based on available context.

**Always communicate:**
- Confidence is based on available data
- More context = better output
- Output is a structured view, not a final answer

**Never communicate:**
- "This is definitely what is happening"
- "This is accurate"
- "This is what they are thinking"

---

## Relational Data Rules

When another person's data is used:

1. Only use data that is available and permitted
2. Partial baseline = lower confidence, clearly marked
3. No unconsented inference about private internal states
4. Output focuses on the loop between people, not blame
5. Never expose another person's raw baseline to the requesting user

---

## Content Boundaries

DEFRAG will not generate output that:
- Assigns clinical diagnoses to users or others
- Recommends specific medical or psychiatric treatment
- Advises on legal matters
- Encourages harmful behavior
- Takes sides in a relationship dispute
- Makes predictions about another person's future behavior with certainty
- Exposes private data about another person without consent

---

## The Core Principle

```
Clarity > explanation depth

Show what helps the user use the answer.
Never show how the engine works.
Never claim more than the data supports.
Always keep the user in control.
```