# dsh-liquid-glass

English | [中文](README.zh.md)

**Liquid glass for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)** — one toggle, and the whole interface turns to glass.

Translucency built for DeepSeek Harness: the page base, cards, panels and chat bubbles all go see-through over your own background image, with a single slider for exactly how much glass you want. Nothing else — the best tools are the simple ones.

## Install

```sh
dsh plugin --profile web add dsh-liquid-glass
```

Open **Settings → General** — a **Liquid Glass** row appears. It is ON by default; restart once after install.

## What you get

- **Full-shell transparency**: every surface the shell paints — page base, cards, panels, sidebar, chat bubbles, code blocks — goes translucent through the official ThemeRuntime token-override layer. Neutral white on the light scheme, near-black on dark.
- **One master transparency slider** (3%–95%): higher values reveal more of the background.
- **Full-page custom background**: upload a local image (auto-compressed for localStorage) or paste a URL. It spans the whole page behind the glass.

## Uninstall

```sh
dsh plugin --profile web remove dsh-liquid-glass
```

Preferences live in this browser's localStorage and are left behind harmlessly.

## License

MIT
