# dsh-liquid-glass

English | [中文](README.zh.md)

[![npm](https://img.shields.io/npm/v/dsh-liquid-glass?logo=npm)](https://www.npmjs.com/package/dsh-liquid-glass)
[![license](https://img.shields.io/github/license/Ultronen/dsh-liquid-glass)](LICENSE)
[![DeepSeek Harness](https://img.shields.io/badge/DeepSeek%20Harness-plugin-4b68ff)](https://github.com/deepseek-ai/deepseek-harness)

**Liquid glass for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)** — one toggle, and the whole interface turns to glass.

Translucency built for DeepSeek Harness: the page base, cards, panels and chat bubbles all go see-through over your own background image, with a single slider for exactly how much glass you want. Nothing else — the best tools are the simple ones.

## Install

```sh
dsh plugin --profile web add dsh-liquid-glass
```

Open **Settings → General** — a **Liquid Glass** row appears. It is ON by default; restart once after install.

## Preview

| Settings | Glass shell | Wallpaper |
| --- | --- | --- |
| ![Liquid Glass settings](assets/screenshots/1-settings.png) | ![Translucent DeepSeek Harness shell](assets/screenshots/2-glass-shell.png) | ![Custom wallpaper controls](assets/screenshots/3-settings-wallpaper.png) |

## What you get

- **Full-shell transparency**: every surface the shell paints — page base, cards, panels, sidebar, chat bubbles, code blocks — goes translucent through the official ThemeRuntime token-override layer. Neutral white on the light scheme, near-black on dark.
- **One master transparency slider** (3%–95%): higher values reveal more of the background.
- **Full-page custom background**: upload a local image (auto-compressed for localStorage) or paste a URL. It spans the whole page behind the glass.

## Privacy and compatibility

- Settings and uploaded backgrounds stay in this browser's `localStorage`; the plugin has no server component and sends no telemetry.
- The UI integrates through DeepSeek Harness's public client runtime, locale, slot and theme APIs.
- Light and dark color schemes are supported. A DSH restart is required once after installation so the client bundle can be loaded.

## Verify from source

The smoke test runs the published client bundle inside a mocked DSH browser runtime and exercises registration, lifecycle, settings, persistence, wallpaper controls and slider bounds:

```sh
node test/smoke.test.mjs
```

## Uninstall

```sh
dsh plugin --profile web remove dsh-liquid-glass
```

Preferences live in this browser's localStorage and are left behind harmlessly.

## License

MIT
