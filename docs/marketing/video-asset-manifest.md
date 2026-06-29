# Video Asset Manifest

`video-asset-manifest.json` is the structured source for the seven-video Sovereign.os launch batch. Editors, designers, and AI-video tools can use it to keep scripts, on-screen text, end cards, CTAs, needed assets, and export formats aligned.

## How to use it

1. Choose a video by `id`.
2. Treat `voiceover`, `on_screen_text`, and `end_card` as the approved script inputs.
3. Gather or generate each item in `needed_assets` before editing.
4. Export every completed cut in the listed `export_formats`.
5. Keep `primary_cta` unchanged unless the campaign owner updates the manifest.
6. Update `production_status` as work moves from `script_ready` to later production states.

## Safe language standard

The manifest avoids therapy, diagnosis, treatment, cure, trauma-cure, destiny, and spiritual-authority claims. Future edits should stay grounded in observable language: pattern, pressure, loop, repair, baseline, alignment, and relational intelligence.

## Suggested future automation

- Validate JSON shape in CI.
- Generate production task lists from `needed_assets`.
- Generate caption drafts from `on_screen_text` and `primary_cta`.
- Feed approved scripts into video tools without changing the copy.
