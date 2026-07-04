# AI Visual Production Playbook

Goal: produce intentional, modern, cinematic marketing visuals with single-shot depth and smooth motion.

## Recommended Models
- Video (best quality): Veo 3, Runway Gen-4, Kling 2.1 Master
- Image keyframes/stills: Midjourney v7, FLUX Pro 1.1 Ultra
- Upscale/cleanup: Topaz Video AI / Topaz Gigapixel / Magnific

## Shot Spec (Single-Shot Cinematic)
- Duration: 6-8 seconds
- Camera: slow dolly-in or lateral drift
- Motion: subtle atmospheric movement, no hard cuts
- Lens feel: 50mm, shallow depth, cinematic contrast
- Grade: warm charcoal base, amber practical highlights
- Output targets:
  - Hero: 2560x1440 MP4 (H.264) + WebM (VP9)
  - Backdrop loop: 1920x1080 MP4 + WebM

## Prompt Template (Video)
"Single-shot cinematic portrait environment for a premium emotional-intelligence app, slow dolly-in, shallow depth of field, volumetric light, warm amber practicals, charcoal-black atmosphere, elegant minimal composition, intentional negative space for headline text on left, filmic grain, soft diffusion, no text, no logos, no watermark, 24fps, high detail skin and fabric, stable camera motion"

## Prompt Template (Image)
"Cinematic still frame for modern premium web hero, dark charcoal palette with warm amber accent, intentional composition with left-side copy space, shallow depth, subtle haze, soft practical highlights, clean modern minimalism, editorial quality, no text, no watermark"

## Integration
Set these env vars for the current implementation:
- `VITE_HERO_VIDEO_MP4`
- `VITE_HERO_VIDEO_WEBM`
- `VITE_MARKETING_BG_VIDEO_MP4`
- `VITE_MARKETING_BG_VIDEO_WEBM`

Then run:
- `pnpm --filter @workspace/sovereign-os run dev`

## Quality Bar
- No jump cuts in loop
- No obvious AI artifacts on hands/edges
- Preserve copy legibility (left side contrast)
- Keep motion subtle and premium, never busy
