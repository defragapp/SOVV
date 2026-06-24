# Sovereign.os — Intelligence Layer Audit
**Date:** 2026-06-24  
**Scope:** Edge cases, output quality comparison, post-launch conversion risk

---

## 1. Intelligence Layer Edge Cases

### 1.1 Defrag

| Edge Case | Status |
|-----------|--------|
| Empty input | ✅ Blocked client-side |
| Very short input | ✅ AI returns 2-3 fields (OMIT rules) |
| No Baseline Design | ✅ needs_baseline error + CTA |
| Daily limit reached | ✅ upgrade CTA shown |
| AI returns empty JSON | ✅ Empty result guard added |
| AI returns malformed JSON | ✅ parseJsonFromText catches, guard fires |
| Input > 2000 chars | ✅ maxLength={2000} on textarea |
| Relational mode, no target baseline | ✅ Behavioral inference only |
| Guardrail violations | ✅ Logged, not blocked |

### 1.2 Alignment

| Edge Case | Status |
|-----------|--------|
| Daily limit reached | ✅ Upgrade CTA shown |
| No Baseline Design | ⚠️ Generic error (not specific) |
| AI omits theShift | ⚠️ Validator checks, no retry |
| Input references God/faith | ✅ Guardrails block |
| Input > 2000 chars | ✅ maxLength={2000} |
| Guardrail violations | ✅ Logged, not blocked |

### 1.3 Covenant

| Edge Case | Status |
|-----------|--------|
| Daily limit reached | ✅ Upgrade CTA shown |
| No Baseline Design | ⚠️ Generic error (not specific) |
| AI makes certainty claims | ✅ Guardrails block |
| AI omits forYou | ⚠️ Validator checks, no retry |
| Input > 2000 chars | ✅ maxLength={2000} |
| Guardrail violations | ✅ Logged, not blocked |

---

## 2. Output Quality Comparison

| Dimension | Defrag | Alignment | Covenant |
|-----------|--------|-----------|----------|
| Baseline Design visible | ✅ Chips in result | ⚠️ Sidebar only | ⚠️ Sidebar only |
| Output specificity | ✅ High | ✅ High | ⚠️ Figure-dependent |
| Actionability | ✅ "Next move" | ✅ "One move" | ⚠️ Varies |
| Guardrails | ✅ Active | ✅ Active | ✅ Strongest |
| Retry logic | ❌ Not wired | ❌ Not wired | ❌ Not wired |
| Flow to next space | ✅ Wired | ❌ No back-flow | ❌ No back-flow |
| Empty result guard | ✅ Added | ❌ Not added | ❌ Not added |

**Weakest fields by space:**
- Defrag: `giftUnderStrain` — often generic
- Alignment: `skyContext` — often generic when no live sky data
- Covenant: `reflectionPrompts` — often generic

---

## 3. Post-Launch Conversion Risk Points

### Critical (fix before scale)
1. ✅ Empty result on AI failure → blank screen → churn (FIXED)
2. ✅ No Baseline Design → confusing error (IMPROVED)
3. ✅ Free user hits 5-session limit → upgrade CTA (FIXED)
4. ✅ Brief input → thin result (IMPROVED placeholder)

### Medium (fix this week)
5. ✅ No Alignment/Covenant → Defrag back-flow (guidance added)
6. ⚠️ Library empty on first visit → dead end
7. ✅ Covenant Pro-gate not explained (FIXED in UpgradeBanner)
8. ✅ Flow suggestion unclear (FIXED with specific descriptions)

### Monitor post-launch
9. Audio generation failure rate (/api/audio errors)
10. Pattern history build rate (queue success)
11. Flow suggestion click-through (Defrag → Alignment/Covenant)
12. Session-to-save rate (Library saves per session)

---

## 4. Intelligence Integrity Checklist

| Check | Status |
|-------|--------|
| DEFRAG_REQUIRED matches prompt | ✅ Fixed |
| Empty result guard (Defrag) | ✅ Fixed |
| Input length limit (all spaces) | ✅ Fixed |
| Guardrails defined | ✅ All 3 spaces |
| Guardrails wired (Defrag) | ✅ Fixed |
| Guardrails wired (Alignment) | ✅ Fixed |
| Guardrails wired (Covenant) | ✅ Fixed |
| SECURITY_PREFIX exported | ✅ Fixed |
| Active signals all 3 spaces | ✅ |
| Pattern memory extraction | ✅ |
| Flow suggestion Defrag → Alignment/Covenant | ✅ |
| Retry logic for empty output | ❌ Not yet |
| Confidence scoring surfaced | ❌ Not yet |
| Back-flow Alignment/Covenant → Defrag | ⚠️ Guidance only |
| Empty result guard (Alignment/Covenant) | ❌ Not yet |
