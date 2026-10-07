# NwSSU Faculty Evaluation System: promotional video

A [Remotion](https://www.remotion.dev/) project that renders the promotional videos described in
[`../docs/promo-video-plan.md`](../docs/promo-video-plan.md):

| Composition | Size | Length | Output |
|---|---|---|---|
| `NwssuPromo` | 1920×1080 (16:9) | 90 s | `out/nwssu-promo-90s.mp4` |
| `NwssuShort` | 1080×1920 (9:16) | 30 s | `out/nwssu-promo-30s-vertical.mp4` |

Everything on screen is drawn in React (phone and admin mock-ups, captions, titles), so no screen
recordings are needed. All names, IDs and ratings are made up (`src/data.ts`).

## Commands

```bash
cd video
npm install
npm run studio          # preview and scrub in the browser
npm run render          # 90-second main video
npm run render:short    # 30-second vertical cut
```

On a machine without a Chrome download (for example a sandbox), point Remotion at a local
headless shell: `npx remotion render NwssuPromo out/nwssu-promo-90s.mp4 --browser-executable=/path/to/headless_shell`.

## Layout

- `src/Main.tsx`: the 90-second storyboard, one scene per row of the plan's script table.
- `src/Short.tsx`: the 30-second vertical cut with large burned-in captions.
- `src/screens/`: the mock app screens (sign-in, evaluate, SEF, offline, admin dashboard, reports).
- `src/components/`: phone and browser frames, captions, scene crossfades.
- `src/theme.ts`: the app palette (`#064E3B`, `#059669`) and the Sora font, bundled in `public/fonts`.
- `public/music.mp3`: background track, synthesised by `scripts/make-music.py` (royalty-free).

## Before publishing

- Add the team and adviser names to the closing scene (`Close` in `src/Main.tsx`).
- Add a voice-over if wanted: put `public/voice.mp3` in place and add an `<Audio>` next to `<Music>`;
  the captions already follow the script's narration and timing.
