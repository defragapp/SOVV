---
name: Sovereign.os mock data strings
description: Apostrophes inside single-quoted JS string literals in DefragPage mock data caused Babel parse failures — solution pattern documented here
---

## Rule
Any mock/fixture string in DefragPage.tsx (or similar files) that contains apostrophes or curly quotes must use double-quoted outer delimiters or unicode escape sequences — never single-quoted outer delimiters with an interior apostrophe.

**Why:** Babel's TSX parser treats the apostrophe in `'I'm back.'` as the closing quote, producing an unexpected-token error that is hard to spot when the string also contains double-quote characters.

**How to apply:** When writing natural-language mock text in TSX files:
- Prefer double-quoted strings: `"I'm back."` — unambiguous even with interior apostrophes.
- Or use unicode curly-quote escapes: `\u201CI\u2019m back.\u201D` — visually cleaner output, zero parse risk.
- Avoid template literals for static mock objects (no benefit, extra syntax noise).
