# dsh-theme-lab

English | [中文](README.zh.md)

**Liquid glass for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)** — one toggle, and the whole interface turns to glass.

Translucency built for DeepSeek Harness: the page base, cards, panels and chat bubbles all go see-through over your own background image, with a single slider for exactly how much glass you want. Nothing else — the best tools are the simple ones.

## Install

```sh
dsh plugin --profile web add dsh-theme-lab
```

Open **Settings → General** — a **Liquid Glass** row appears. It is ON by default; restart once after install.

## What you get

- **Full-shell transparency**: every surface the shell paints — page base, cards, panels, sidebar, chat bubbles, code blocks — goes translucent through the official ThemeRuntime token-override layer. Neutral white on the light scheme, near-black on dark.
- **One master opacity slider** (30%–95%): lower values reveal more of the background.
- **Blur intensity slider** (0–40px): real `backdrop-filter` frosted glass on cards and panels, injected through the shell's `data-plugin-css` convention.
- **Full-page custom background**: upload a local image (auto-compressed for localStorage) or paste a URL. It spans the whole page behind the glass.

## Uninstall

```sh
dsh plugin --profile web remove dsh-theme-lab
```

Preferences live in this browser's localStorage and are left behind harmlessly.

## License

MIT
