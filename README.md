# dsh-theme-lab

English | [中文](README.zh.md)

Theme studio for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) — 8 curated light/dark themes registered as first-class citizens of the shell's built-in ThemeRuntime, plus a custom wallpaper layer, an accent-color wheel, and shareable theme packs.

## Install

```sh
dsh plugin --profile web add dsh-theme-lab
```

Then open **Settings → General** — two new rows appear under the built-in Appearance row: **Appearance (Theme Lab)** and the studio row. No restart needed for theme switches; everything applies live.

## What you get

- **8 curated themes**, light and dark alike, registered into the shell's official ThemeRuntime (the same registry the built-in appearance uses — no style hacks, no CSS overrides):
  - Light: **Paper**, **Linen**, **Daybreak**
  - Dark: **Ocean**, **Graphite**, **Forest**, **Violet**, **Ember**
- **Live swatch previews** rendered straight from each theme's tokens — what you see is what you get.
- **Custom wallpaper**: upload a local image (auto-compressed to fit localStorage) or paste an image URL, with wash-opacity and blur-radius sliders. Surface tokens are shaded translucent so the wallpaper shows through while cards and bubbles stay readable.
- **Liquid Glass mode**: iOS-style glassmorphism — translucent surface tokens plus a `backdrop-filter` blur layer injected through the shell's `data-plugin-css` convention. Stacks on any theme; blur intensity and glass opacity are user-tunable, and it pairs beautifully with a wallpaper.
- **Accent-color wheel**: one native color picker overrides the whole brand family (buttons, highlights, interactive states) through a layered token override.
- **Theme packs**: export your current look (theme + wallpaper + accent) as a JSON snippet, share it, and import packs from others.

## How it works

- Themes are plain `{ id, colorScheme, tokens }` objects registered via `ctx.theme.register()` — the ThemePresenter applies the `--dsw-alias-*` custom properties on `<body>`.
- Wallpaper and accent are `ctx.theme.overrideTokens()` layers; re-calling with the same source replaces the layer, so repeated adjustments stay cheap.
- Preferences persist in `localStorage` (the Host settings wire only exposes an allowlisted namespace set to browser clients, so localStorage is the correct boundary for visual preferences).

## Theme pack format

```json
{
  "version": 1,
  "theme": "ocean",
  "wallpaper": { "url": "https://…/bg.jpg", "opacity": 0.8, "blur": 8 },
  "accent": "#34d37b"
}
```

`theme` is one of the catalog ids (or `system`); `wallpaper` and `accent` are optional.

## Uninstall

```sh
dsh plugin --profile web remove dsh-theme-lab
```

Your localStorage preferences are left behind harmlessly; clear them in DevTools if you want a full reset.

## License

MIT
