// dsh-theme-lab — browser half (client plugin bundle).
//
// Loaded by dsh-client-modules at /plugins/dsh-theme-lab/client.js and executed
// through the vendored cordis Loader's lazy-CJS module table
// (window.__ModuleLoader__.load). The factory body is plain CJS with require()
// resolved against the shell's module table — the same shape the shipped ui-*
// packages emit.
//
// Design notes:
// - All theming goes through the shell's built-in ThemeRuntime: curated themes
//   are registered as first-class themes, wallpaper/accent are layered token
//   overrides via ctx.theme.overrideTokens (same-source calls replace the
//   whole layer, per the ThemeRuntime contract).
// - Persistence is localStorage: the Host settings wire only exposes an
//   allowlisted set of namespaces to browser clients, so a third-party
//   namespace would answer `settings-not-exposed`.
window.__ModuleLoader__.load({
	id: "dsh-theme-lab",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let jsx = require("react/jsx-runtime");
		let _react = require("react");
		let _runtime_client = require("@deepseek-ai/dsh-client-runtime/client");

		//#region constants & storage
		const SETTINGS_NS = "settings.theme-lab";
		const KEY_THEME = "dsh-theme-lab:theme";
		const KEY_WALLPAPER = "dsh-theme-lab:wallpaper";
		const KEY_OPACITY = "dsh-theme-lab:wallpaper-opacity";
		const KEY_BLUR = "dsh-theme-lab:wallpaper-blur";
		const KEY_ACCENT = "dsh-theme-lab:accent";
		const KEY_GLASS = "dsh-theme-lab:glass";
		const KEY_GLASS_BLUR = "dsh-theme-lab:glass-blur";
		const KEY_GLASS_ALPHA = "dsh-theme-lab:glass-alpha";
		const DEFAULT_THEME = "system";
		const DEFAULT_OPACITY = 0.8;
		const DEFAULT_BLUR = 0;
		const DEFAULT_GLASS_BLUR = 18;
		const DEFAULT_GLASS_ALPHA = 0.62;
		const WALLPAPER_SOURCE = "dsh-theme-lab:wallpaper";
		const ACCENT_SOURCE = "dsh-theme-lab:accent";
		const GLASS_SOURCE = "dsh-theme-lab:glass";
		const GLASS_CSS_ID = "dsh-theme-lab-glass-css";
		const PACK_VERSION = 1;

		function readStorage(key) {
			try { return window.localStorage.getItem(key); } catch { return null; }
		}
		function writeStorage(key, value) {
			try {
				if (value === null || value === void 0) window.localStorage.removeItem(key);
				else window.localStorage.setItem(key, value);
			} catch { /* quota exceeded — ignore */ }
		}
		const readTheme = () => readStorage(KEY_THEME);
		const readWallpaper = () => readStorage(KEY_WALLPAPER);
		const readOpacity = () => {
			const raw = Number(readStorage(KEY_OPACITY));
			return Number.isFinite(raw) && raw > 0 ? Math.min(1, raw) : DEFAULT_OPACITY;
		};
		const readBlur = () => {
			const raw = Number(readStorage(KEY_BLUR));
			return Number.isFinite(raw) && raw >= 0 ? Math.min(60, raw) : DEFAULT_BLUR;
		};
		const readAccent = () => readStorage(KEY_ACCENT);
		const readGlass = () => readStorage(KEY_GLASS) === "on";
		const readGlassBlur = () => {
			const raw = Number(readStorage(KEY_GLASS_BLUR));
			return Number.isFinite(raw) && raw > 0 ? Math.min(40, raw) : DEFAULT_GLASS_BLUR;
		};
		const readGlassAlpha = () => {
			const raw = Number(readStorage(KEY_GLASS_ALPHA));
			return Number.isFinite(raw) && raw > 0 ? Math.min(0.92, raw) : DEFAULT_GLASS_ALPHA;
		};
		//#endregion

		//#region color utils
		function hexToRgb(hex) {
			const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
			if (!m) return null;
			const n = parseInt(m[1], 16);
			return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
		}
		function toRgba(hex, alpha) {
			const rgb = hexToRgb(hex);
			if (!rgb) return hex;
			return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
		}
		function mix(hexA, hexB, weightB) {
			const a = hexToRgb(hexA); const b = hexToRgb(hexB);
			if (!a || !b) return hexA;
			const w = Math.min(1, Math.max(0, weightB));
			const r = Math.round(a.r * (1 - w) + b.r * w);
			const g = Math.round(a.g * (1 - w) + b.g * w);
			const bl = Math.round(a.b * (1 - w) + b.b * w);
			return `#${((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1)}`;
		}
		/** Relative luminance — pick readable text on the accent color. */
		function readableText(hex) {
			const rgb = hexToRgb(hex);
			if (!rgb) return "#ffffff";
			const lum = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
			return lum > 0.55 ? "#101012" : "#ffffff";
		}
		//#endregion

		//#region theme catalog
		/**
		 * The curated catalog. Every theme is a first-class theme for the shell's
		 * ThemeRuntime: an id, a colorScheme (drives body[data-ds-dark-theme]),
		 * and --dsw-alias-* token overrides applied by the ThemePresenter.
		 * Light and dark families are both represented; values are concrete CSS
		 * colors tuned per theme for readable contrast.
		 */
		const THEMES = [
			{
				id: "paper",
				colorScheme: "light",
				tokens: {
					"--dsw-alias-bg-base": "#fafaf7",
					"--dsw-alias-bg-layer-1": "#f3f3ef",
					"--dsw-alias-bg-layer-2": "#ecece7",
					"--dsw-alias-bg-layer-3": "#e3e3dd",
					"--dsw-alias-bg-overlay": "#ffffff",
					"--dsw-alias-border-l1": "rgba(60, 60, 67, 0.1)",
					"--dsw-alias-border-l2": "rgba(60, 60, 67, 0.18)",
					"--dsw-alias-label-primary": "#1d1d1f",
					"--dsw-alias-label-secondary": "#5c5c60",
					"--dsw-alias-label-tertiary": "#8a8a8e",
					"--dsw-alias-brand-primary": "#4d6bfe",
					"--dsw-alias-brand-text": "#ffffff",
					"--dsw-alias-button-primary-hover": "#6b85fe",
					"--dsw-alias-button-primary-dimmed": "#e3e9ff",
					"--dsw-alias-state-business-primary": "#4d6bfe",
					"--dsw-alias-state-business-tertiary": "#e3e9ff",
					"--dsw-alias-interactive-bg-hover": "rgba(77, 107, 254, 0.08)",
					"--dsw-alias-interactive-bg-active": "rgba(77, 107, 254, 0.14)",
					"--dsw-alias-markdown-code-block": "#efefea",
					"--dsw-alias-markdown-inline-code": "#e8e8e2",
					"--dsw-specific-sidebar-fill": "#f1f1ec",
					"--dsw-specific-sidebar-nav-item-active": "#e6e6e0",
					"--dsw-specific-sidebar-nav-item-hover": "#ebebe5",
					"--dsw-alias-scrollbar-bg-l1": "#dcdcd6",
					"--dsw-alias-scrollbar-bg-l2": "#cfcfc8",
					"--dsw-alias-scrollbar-hover-l1": "#c2c2ba",
					"--dsw-alias-scrollbar-hover-l2": "#c2c2ba"
				}
			},
			{
				id: "linen",
				colorScheme: "light",
				tokens: {
					"--dsw-alias-bg-base": "#f7f4ee",
					"--dsw-alias-bg-layer-1": "#f0ece3",
					"--dsw-alias-bg-layer-2": "#e8e2d6",
					"--dsw-alias-bg-layer-3": "#ded7c8",
					"--dsw-alias-bg-overlay": "#fffdf8",
					"--dsw-alias-border-l1": "rgba(92, 72, 48, 0.12)",
					"--dsw-alias-border-l2": "rgba(92, 72, 48, 0.2)",
					"--dsw-alias-label-primary": "#2b2118",
					"--dsw-alias-label-secondary": "#6b5d4c",
					"--dsw-alias-label-tertiary": "#98897a",
					"--dsw-alias-brand-primary": "#b4713c",
					"--dsw-alias-brand-text": "#ffffff",
					"--dsw-alias-button-primary-hover": "#c6884f",
					"--dsw-alias-button-primary-dimmed": "#f0e2d2",
					"--dsw-alias-state-business-primary": "#b4713c",
					"--dsw-alias-state-business-tertiary": "#f0e2d2",
					"--dsw-alias-interactive-bg-hover": "rgba(180, 113, 60, 0.08)",
					"--dsw-alias-interactive-bg-active": "rgba(180, 113, 60, 0.15)",
					"--dsw-alias-markdown-code-block": "#ece5d8",
					"--dsw-alias-markdown-inline-code": "#e5dccb",
					"--dsw-specific-sidebar-fill": "#efe9dd",
					"--dsw-specific-sidebar-nav-item-active": "#e5dccb",
					"--dsw-specific-sidebar-nav-item-hover": "#eae2d4",
					"--dsw-alias-scrollbar-bg-l1": "#d8d0c0",
					"--dsw-alias-scrollbar-bg-l2": "#c9bfab",
					"--dsw-alias-scrollbar-hover-l1": "#b8ad96",
					"--dsw-alias-scrollbar-hover-l2": "#b8ad96"
				}
			},
			{
				id: "daybreak",
				colorScheme: "light",
				tokens: {
					"--dsw-alias-bg-base": "#f3f8fc",
					"--dsw-alias-bg-layer-1": "#ebf2f9",
					"--dsw-alias-bg-layer-2": "#e1ebf5",
					"--dsw-alias-bg-layer-3": "#d5e2f0",
					"--dsw-alias-bg-overlay": "#ffffff",
					"--dsw-alias-border-l1": "rgba(40, 80, 130, 0.1)",
					"--dsw-alias-border-l2": "rgba(40, 80, 130, 0.18)",
					"--dsw-alias-label-primary": "#16222e",
					"--dsw-alias-label-secondary": "#4a5d6e",
					"--dsw-alias-label-tertiary": "#7d8fa0",
					"--dsw-alias-brand-primary": "#3a7bd5",
					"--dsw-alias-brand-text": "#ffffff",
					"--dsw-alias-button-primary-hover": "#5a93df",
					"--dsw-alias-button-primary-dimmed": "#dbe9fa",
					"--dsw-alias-state-business-primary": "#3a7bd5",
					"--dsw-alias-state-business-tertiary": "#dbe9fa",
					"--dsw-alias-interactive-bg-hover": "rgba(58, 123, 213, 0.08)",
					"--dsw-alias-interactive-bg-active": "rgba(58, 123, 213, 0.14)",
					"--dsw-alias-markdown-code-block": "#e4edf6",
					"--dsw-alias-markdown-inline-code": "#dbe7f2",
					"--dsw-specific-sidebar-fill": "#e9f1f8",
					"--dsw-specific-sidebar-nav-item-active": "#dce8f3",
					"--dsw-specific-sidebar-nav-item-hover": "#e2edf6",
					"--dsw-alias-scrollbar-bg-l1": "#cfddec",
					"--dsw-alias-scrollbar-bg-l2": "#bccfe2",
					"--dsw-alias-scrollbar-hover-l1": "#a9c1d9",
					"--dsw-alias-scrollbar-hover-l2": "#a9c1d9"
				}
			},
			{
				id: "ocean",
				colorScheme: "dark",
				tokens: {
					"--dsw-alias-bg-base": "#0a101f",
					"--dsw-alias-bg-layer-1": "#101a30",
					"--dsw-alias-bg-layer-2": "#16233e",
					"--dsw-alias-bg-layer-3": "#1c2c4d",
					"--dsw-alias-bg-overlay": "#1e2c49",
					"--dsw-alias-border-l1": "rgba(148, 163, 184, 0.14)",
					"--dsw-alias-border-l2": "rgba(148, 163, 184, 0.26)",
					"--dsw-alias-label-primary": "#e9eef9",
					"--dsw-alias-label-secondary": "#a5b3cc",
					"--dsw-alias-label-tertiary": "#7e8da8",
					"--dsw-alias-brand-primary": "#4d86f8",
					"--dsw-alias-brand-text": "#ffffff",
					"--dsw-alias-button-primary-hover": "#6d9dfa",
					"--dsw-alias-button-primary-dimmed": "#16233e",
					"--dsw-alias-state-business-primary": "#4d86f8",
					"--dsw-alias-state-business-tertiary": "#16233e",
					"--dsw-alias-interactive-bg-hover": "rgba(77, 134, 248, 0.12)",
					"--dsw-alias-interactive-bg-active": "rgba(77, 134, 248, 0.2)",
					"--dsw-alias-markdown-code-block": "#0d1426",
					"--dsw-alias-markdown-inline-code": "#16233e",
					"--dsw-specific-sidebar-fill": "#0d1426",
					"--dsw-specific-sidebar-nav-item-active": "#16233e",
					"--dsw-specific-sidebar-nav-item-hover": "#121c31",
					"--dsw-alias-scrollbar-bg-l1": "#1c2c4d",
					"--dsw-alias-scrollbar-bg-l2": "#23365e",
					"--dsw-alias-scrollbar-hover-l1": "#2a3f6d",
					"--dsw-alias-scrollbar-hover-l2": "#2a3f6d"
				}
			},
			{
				id: "graphite",
				colorScheme: "dark",
				tokens: {
					"--dsw-alias-bg-base": "#0f0f11",
					"--dsw-alias-bg-layer-1": "#17171a",
					"--dsw-alias-bg-layer-2": "#1e1e22",
					"--dsw-alias-bg-layer-3": "#26262b",
					"--dsw-alias-bg-overlay": "#27272c",
					"--dsw-alias-border-l1": "rgba(255, 255, 255, 0.07)",
					"--dsw-alias-border-l2": "rgba(255, 255, 255, 0.14)",
					"--dsw-alias-label-primary": "#ededf0",
					"--dsw-alias-label-secondary": "#a2a2ab",
					"--dsw-alias-label-tertiary": "#82828c",
					"--dsw-alias-brand-primary": "#b9bdc8",
					"--dsw-alias-brand-text": "#101012",
					"--dsw-alias-button-primary-hover": "#d2d5de",
					"--dsw-alias-button-primary-dimmed": "#26262b",
					"--dsw-alias-state-business-primary": "#b9bdc8",
					"--dsw-alias-state-business-tertiary": "#26262b",
					"--dsw-alias-interactive-bg-hover": "rgba(255, 255, 255, 0.08)",
					"--dsw-alias-interactive-bg-active": "rgba(255, 255, 255, 0.14)",
					"--dsw-alias-markdown-code-block": "#141417",
					"--dsw-alias-markdown-inline-code": "#1e1e22",
					"--dsw-specific-sidebar-fill": "#141417",
					"--dsw-specific-sidebar-nav-item-active": "#1e1e22",
					"--dsw-specific-sidebar-nav-item-hover": "#1a1a1e",
					"--dsw-alias-scrollbar-bg-l1": "#2e2e34",
					"--dsw-alias-scrollbar-bg-l2": "#383840",
					"--dsw-alias-scrollbar-hover-l1": "#45454e",
					"--dsw-alias-scrollbar-hover-l2": "#45454e"
				}
			},
			{
				id: "forest",
				colorScheme: "dark",
				tokens: {
					"--dsw-alias-bg-base": "#0a120d",
					"--dsw-alias-bg-layer-1": "#101a13",
					"--dsw-alias-bg-layer-2": "#17241a",
					"--dsw-alias-bg-layer-3": "#1e2e22",
					"--dsw-alias-bg-overlay": "#203024",
					"--dsw-alias-border-l1": "rgba(134, 239, 172, 0.1)",
					"--dsw-alias-border-l2": "rgba(134, 239, 172, 0.2)",
					"--dsw-alias-label-primary": "#e7f5eb",
					"--dsw-alias-label-secondary": "#9dc4a9",
					"--dsw-alias-label-tertiary": "#7ba68a",
					"--dsw-alias-brand-primary": "#34d37b",
					"--dsw-alias-brand-text": "#04120a",
					"--dsw-alias-button-primary-hover": "#5ae295",
					"--dsw-alias-button-primary-dimmed": "#17241a",
					"--dsw-alias-state-business-primary": "#34d37b",
					"--dsw-alias-state-business-tertiary": "#17241a",
					"--dsw-alias-interactive-bg-hover": "rgba(52, 211, 123, 0.1)",
					"--dsw-alias-interactive-bg-active": "rgba(52, 211, 123, 0.18)",
					"--dsw-alias-markdown-code-block": "#0d1a10",
					"--dsw-alias-markdown-inline-code": "#17241a",
					"--dsw-specific-sidebar-fill": "#0d1a10",
					"--dsw-specific-sidebar-nav-item-active": "#17241a",
					"--dsw-specific-sidebar-nav-item-hover": "#122015",
					"--dsw-alias-scrollbar-bg-l1": "#1e2e22",
					"--dsw-alias-scrollbar-bg-l2": "#26402c",
					"--dsw-alias-scrollbar-hover-l1": "#2f5236",
					"--dsw-alias-scrollbar-hover-l2": "#2f5236"
				}
			},
			{
				id: "violet",
				colorScheme: "dark",
				tokens: {
					"--dsw-alias-bg-base": "#100a1c",
					"--dsw-alias-bg-layer-1": "#181026",
					"--dsw-alias-bg-layer-2": "#201632",
					"--dsw-alias-bg-layer-3": "#2a1d40",
					"--dsw-alias-bg-overlay": "#2c1f44",
					"--dsw-alias-border-l1": "rgba(196, 181, 253, 0.12)",
					"--dsw-alias-border-l2": "rgba(196, 181, 253, 0.22)",
					"--dsw-alias-label-primary": "#f0ebfb",
					"--dsw-alias-label-secondary": "#b6a8d4",
					"--dsw-alias-label-tertiary": "#8d80ac",
					"--dsw-alias-brand-primary": "#a78bfa",
					"--dsw-alias-brand-text": "#150a26",
					"--dsw-alias-button-primary-hover": "#bba5fc",
					"--dsw-alias-button-primary-dimmed": "#201632",
					"--dsw-alias-state-business-primary": "#a78bfa",
					"--dsw-alias-state-business-tertiary": "#201632",
					"--dsw-alias-interactive-bg-hover": "rgba(167, 139, 250, 0.12)",
					"--dsw-alias-interactive-bg-active": "rgba(167, 139, 250, 0.2)",
					"--dsw-alias-markdown-code-block": "#140d24",
					"--dsw-alias-markdown-inline-code": "#201632",
					"--dsw-specific-sidebar-fill": "#140d24",
					"--dsw-specific-sidebar-nav-item-active": "#201632",
					"--dsw-specific-sidebar-nav-item-hover": "#1a1229",
					"--dsw-alias-scrollbar-bg-l1": "#2a1d40",
					"--dsw-alias-scrollbar-bg-l2": "#352553",
					"--dsw-alias-scrollbar-hover-l1": "#422e68",
					"--dsw-alias-scrollbar-hover-l2": "#422e68"
				}
			},
			{
				id: "ember",
				colorScheme: "dark",
				tokens: {
					"--dsw-alias-bg-base": "#191612",
					"--dsw-alias-bg-layer-1": "#211c16",
					"--dsw-alias-bg-layer-2": "#2a231b",
					"--dsw-alias-bg-layer-3": "#342b21",
					"--dsw-alias-bg-overlay": "#352c22",
					"--dsw-alias-border-l1": "rgba(224, 178, 140, 0.1)",
					"--dsw-alias-border-l2": "rgba(224, 178, 140, 0.2)",
					"--dsw-alias-label-primary": "#f4ede4",
					"--dsw-alias-label-secondary": "#c2b3a1",
					"--dsw-alias-label-tertiary": "#96887a",
					"--dsw-alias-brand-primary": "#e08544",
					"--dsw-alias-brand-text": "#1d1207",
					"--dsw-alias-button-primary-hover": "#ea9c60",
					"--dsw-alias-button-primary-dimmed": "#2a231b",
					"--dsw-alias-state-business-primary": "#e08544",
					"--dsw-alias-state-business-tertiary": "#2a231b",
					"--dsw-alias-interactive-bg-hover": "rgba(224, 133, 68, 0.12)",
					"--dsw-alias-interactive-bg-active": "rgba(224, 133, 68, 0.2)",
					"--dsw-alias-markdown-code-block": "#161310",
					"--dsw-alias-markdown-inline-code": "#2a231b",
					"--dsw-specific-sidebar-fill": "#161310",
					"--dsw-specific-sidebar-nav-item-active": "#2a231b",
					"--dsw-specific-sidebar-nav-item-hover": "#211c16",
					"--dsw-alias-scrollbar-bg-l1": "#342b21",
					"--dsw-alias-scrollbar-bg-l2": "#413629",
					"--dsw-alias-scrollbar-hover-l1": "#4f4231",
					"--dsw-alias-scrollbar-hover-l2": "#4f4231"
				}
			}
		];
		const THEME_IDS = new Set(THEMES.map((theme) => theme.id));
		/** Base surface color per scheme, used to shade the wallpaper wash. */
		function baseColor(themeId, scheme) {
			const theme = THEMES.find((candidate) => candidate.id === themeId);
			if (theme) return theme.tokens["--dsw-alias-bg-base"];
			return scheme === "dark" ? "#151517" : "#ffffff";
		}
		//#endregion

		//#region locale
		const zh = {
			"row.title": "主题外观",
			"row.subtitle": "由 Theme Lab 提供 · 8 款精选主题，支持自定义壁纸与强调色",
			"theme.system": "跟随系统",
			"theme.paper": "纸白",
			"theme.linen": "亚麻",
			"theme.daybreak": "清晨",
			"theme.ocean": "深海",
			"theme.graphite": "石墨",
			"theme.forest": "森林",
			"theme.violet": "紫夜",
			"theme.ember": "暖木",
			"wallpaper.title": "壁纸",
			"wallpaper.choose": "选择图片…",
			"wallpaper.urlPlaceholder": "或粘贴图片 URL 后回车",
			"wallpaper.remove": "移除壁纸",
			"wallpaper.opacity": "遮罩透明度",
			"wallpaper.blur": "模糊半径",
			"wallpaper.hint": "壁纸保存在本浏览器 localStorage；过大的图片会自动压缩。",
			"accent.title": "强调色",
			"accent.reset": "重置",
			"accent.hint": "覆盖按钮与高亮的主色，立即生效。",
			"pack.export": "导出主题包",
			"pack.import": "导入",
			"pack.placeholder": "粘贴主题包 JSON…",
			"pack.exported": "主题包已复制到剪贴板",
			"pack.imported": "主题包已应用",
			"pack.invalid": "主题包格式无效",
			"glass.title": "液态玻璃",
			"glass.toggle": "启用玻璃质感",
			"glass.blur": "模糊强度",
			"glass.alpha": "玻璃透明度",
			"glass.hint": "iOS 风格半透明毛玻璃，可与任意主题叠加；搭配壁纸效果最佳。"
		};
		const en = {
			"row.title": "Appearance",
			"row.subtitle": "Powered by Theme Lab · 8 curated themes, custom wallpaper and accent color",
			"theme.system": "System",
			"theme.paper": "Paper",
			"theme.linen": "Linen",
			"theme.daybreak": "Daybreak",
			"theme.ocean": "Ocean",
			"theme.graphite": "Graphite",
			"theme.forest": "Forest",
			"theme.violet": "Violet",
			"theme.ember": "Ember",
			"wallpaper.title": "Wallpaper",
			"wallpaper.choose": "Choose image…",
			"wallpaper.urlPlaceholder": "…or paste an image URL and press Enter",
			"wallpaper.remove": "Remove wallpaper",
			"wallpaper.opacity": "Wash opacity",
			"wallpaper.blur": "Blur radius",
			"wallpaper.hint": "Wallpaper is stored in this browser's localStorage; large images are compressed automatically.",
			"accent.title": "Accent color",
			"accent.reset": "Reset",
			"accent.hint": "Overrides the primary color of buttons and highlights, effective immediately.",
			"pack.export": "Export theme pack",
			"pack.import": "Import",
			"pack.placeholder": "Paste a theme pack JSON…",
			"pack.exported": "Theme pack copied to clipboard",
			"pack.imported": "Theme pack applied",
			"pack.invalid": "Invalid theme pack",
			"glass.title": "Liquid Glass",
			"glass.toggle": "Enable glassmorphism",
			"glass.blur": "Blur intensity",
			"glass.alpha": "Glass opacity",
			"glass.hint": "iOS-style translucent frosted glass; stacks on any theme and pairs best with a wallpaper."
		};
		//#endregion

		//#region wallpaper & accent layers
		let wallpaperEl = null;
		let wallpaperDispose = null;
		let accentDispose = null;

		function ensureWallpaperEl() {
			if (wallpaperEl === null || !document.body.contains(wallpaperEl)) {
				wallpaperEl = document.createElement("div");
				wallpaperEl.style.cssText = "position:fixed;inset:0;z-index:-1;pointer-events:none;background-size:cover;background-position:center;background-repeat:no-repeat;";
				document.body.prepend(wallpaperEl);
			}
			return wallpaperEl;
		}

		/** Replace the wallpaper token layer: translucent base + sidebar. */
		function shadeTokens(ctx) {
			const snapshot = ctx.theme.getTheme();
			const activeId = snapshot.preference === DEFAULT_THEME ? null : snapshot.preference;
			const alpha = readOpacity();
			const sidebarAlpha = Math.min(1, alpha + 0.1);
			const overrides = {
				"--dsw-alias-bg-base": {
					light: toRgba(baseColor(activeId, "light"), alpha),
					dark: toRgba(baseColor(activeId, "dark"), alpha)
				},
				"--dsw-specific-sidebar-fill": {
					light: toRgba(baseColor(activeId, "light"), sidebarAlpha),
					dark: toRgba(baseColor(activeId, "dark"), sidebarAlpha)
				}
			};
			wallpaperDispose?.();
			wallpaperDispose = ctx.theme.overrideTokens(WALLPAPER_SOURCE, overrides);
		}

		function applyWallpaper(ctx) {
			const url = readWallpaper();
			if (url === null) {
				wallpaperEl?.remove();
				wallpaperEl = null;
				wallpaperDispose?.();
				wallpaperDispose = null;
				return;
			}
			const el = ensureWallpaperEl();
			const blur = readBlur();
			el.style.backgroundImage = `url("${url}")`;
			el.style.filter = blur > 0 ? `blur(${blur}px)` : "none";
			shadeTokens(ctx);
		}

		function teardownWallpaper() {
			wallpaperEl?.remove();
			wallpaperEl = null;
			wallpaperDispose?.();
			wallpaperDispose = null;
		}

		/** Accent layer: override the brand family with the picked color. */
		function applyAccent(ctx) {
			const accent = readAccent();
			accentDispose?.();
			accentDispose = null;
			if (!accent || !hexToRgb(accent)) return;
			const hover = mix(accent, "#ffffff", 0.18);
			const overrides = {
				"--dsw-alias-brand-primary": { light: accent, dark: accent },
				"--dsw-alias-brand-text": { light: readableText(accent), dark: readableText(accent) },
				"--dsw-alias-button-primary-hover": { light: hover, dark: hover },
				"--dsw-alias-state-business-primary": { light: accent, dark: accent },
				"--dsw-alias-interactive-bg-hover": { light: toRgba(accent, 0.1), dark: toRgba(accent, 0.14) },
				"--dsw-alias-interactive-bg-active": { light: toRgba(accent, 0.16), dark: toRgba(accent, 0.22) }
			};
			accentDispose = ctx.theme.overrideTokens(ACCENT_SOURCE, overrides);
		}

		function teardownAccent() {
			accentDispose?.();
			accentDispose = null;
		}

		//#region liquid glass layer
		/**
		 * Liquid Glass (iOS-style): translucent surfaces + backdrop blur. Two
		 * cooperating layers — a ThemeRuntime token override that makes the
		 * surface tokens translucent, and a `data-plugin-css` stylesheet that
		 * applies backdrop-filter to the shell's surface containers. Surfaces
		 * keep their hue; only the alpha channel drops, so the layer composes
		 * cleanly with any theme and with the wallpaper layer.
		 */
		let glassDispose = null;

		/** Surface token keys that become translucent in glass mode. */
		const GLASS_SURFACE_TOKENS = [
			"--dsw-alias-bg-layer-1",
			"--dsw-alias-bg-layer-2",
			"--dsw-alias-bg-layer-3",
			"--dsw-alias-bg-overlay",
			"--dsw-specific-sidebar-fill",
			"--dsw-alias-markdown-code-block",
			"--dsw-alias-markdown-inline-code"
		];

		function glassCss(blurPx) {
			const blur = `blur(${blurPx}px) saturate(1.5)`;
			return [
				"/* dsh-theme-lab liquid glass */",
				'[class*="bubble"],[class*="card"],[class*="composer"],[class*="panel"],[class*="sidebar"]{',
				`backdrop-filter:${blur};-webkit-backdrop-filter:${blur};`,
				"}",
				'[class*="bubble"],[class*="card"],[class*="composer"],[class*="panel"]{',
				"box-shadow:inset 0 1px 0 rgba(255,255,255,0.09),0 8px 32px rgba(0,0,0,0.10);",
				"}"
			].join("\n");
		}

		function applyGlass(ctx) {
			teardownGlass();
			if (!readGlass()) return;
			const snapshot = ctx.theme.getTheme();
			const activeId = snapshot.preference === DEFAULT_THEME ? null : snapshot.preference;
			const theme = THEMES.find((candidate) => candidate.id === activeId);
			const alpha = readGlassAlpha();
			const overrides = {};
			for (const key of GLASS_SURFACE_TOKENS) {
				const light = theme ? theme.tokens[key] : null;
				const dark = theme ? theme.tokens[key] : null;
				overrides[key] = {
					light: toRgba(light || "#f4f4f6", alpha),
					dark: toRgba(dark || "#1b1b1f", alpha)
				};
			}
			glassDispose = ctx.theme.overrideTokens(GLASS_SOURCE, overrides);
			const style = document.createElement("style");
			style.id = GLASS_CSS_ID;
			style.setAttribute("data-plugin-css", "dsh-theme-lab");
			style.textContent = glassCss(readGlassBlur());
			document.head.appendChild(style);
		}

		function teardownGlass() {
			glassDispose?.();
			glassDispose = null;
			document.getElementById(GLASS_CSS_ID)?.remove();
		}
		//#endregion

		/** Downscale an image to a JPEG data URL (localStorage quota friendly). */
		function compressImage(image, maxSide, quality) {
			const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
			const canvas = document.createElement("canvas");
			canvas.width = Math.max(1, Math.round(image.width * scale));
			canvas.height = Math.max(1, Math.round(image.height * scale));
			const context = canvas.getContext("2d");
			context.drawImage(image, 0, 0, canvas.width, canvas.height);
			return canvas.toDataURL("image/jpeg", quality);
		}
		//#endregion

		//#region stores
		function createThemeStore() {
			return (0, _runtime_client.defineStore)({
				init: () => ({ theme: DEFAULT_THEME, revision: -1 }),
				actions: {
					sync: (d, theme, revision) => {
						if (revision <= d.revision) return;
						d.theme = theme;
						d.revision = revision;
					}
				}
			});
		}
		function createStudioStore() {
			return (0, _runtime_client.defineStore)({
				init: () => ({
					url: null,
					opacity: DEFAULT_OPACITY,
					blur: DEFAULT_BLUR,
					accent: null,
					glass: false,
					glassBlur: DEFAULT_GLASS_BLUR,
					glassAlpha: DEFAULT_GLASS_ALPHA,
					notice: "",
					revision: -1
				}),
				actions: {
					sync: (d, url, opacity, blur, accent, glass, glassBlur, glassAlpha, notice, revision) => {
						if (revision <= d.revision) return;
						d.url = url;
						d.opacity = opacity;
						d.blur = blur;
						d.accent = accent;
						d.glass = glass;
						d.glassBlur = glassBlur;
						d.glassAlpha = glassAlpha;
						d.notice = notice;
						d.revision = revision;
					}
				}
			});
		}
		//#endregion

		//#region styles
		const styles = {
			group: {
				borderBottom: "1px solid var(--dsw-alias-border-l2)",
				display: "flex",
				flexDirection: "column",
				gap: "10px",
				padding: "16px 0"
			},
			title: { color: "var(--dsw-alias-label-primary)", fontSize: "14px", fontWeight: 400, lineHeight: "22px" },
			subtitle: { color: "var(--dsw-alias-label-tertiary)", fontSize: "12px", lineHeight: "18px" },
			hint: { color: "var(--dsw-alias-label-tertiary)", fontSize: "12px", lineHeight: "18px" },
			grid: { display: "flex", flexWrap: "wrap", gap: "10px" },
			card: {
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: "6px",
				width: "96px",
				padding: "3px",
				borderRadius: "10px",
				border: "2px solid transparent",
				background: "transparent",
				cursor: "pointer",
				font: "inherit",
				boxSizing: "border-box"
			},
			cardSelected: { borderColor: "var(--dsw-alias-brand-primary)" },
			cardLabel: { color: "var(--dsw-alias-label-secondary)", fontSize: "12px", lineHeight: "16px" },
			cardLabelSelected: { color: "var(--dsw-alias-label-primary)", fontWeight: 500 },
			swatch: {
				width: "88px",
				height: "56px",
				borderRadius: "8px",
				border: "1px solid var(--dsw-alias-border-l1)",
				overflow: "hidden",
				display: "flex",
				boxSizing: "border-box"
			},
			sectionLabel: { color: "var(--dsw-alias-label-secondary)", fontSize: "12px", lineHeight: "18px", marginTop: "4px" },
			row: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
			sliderRow: { display: "flex", alignItems: "center", gap: "10px" },
			sliderLabel: { color: "var(--dsw-alias-label-secondary)", fontSize: "12px", width: "72px", flexShrink: 0 },
			slider: { flex: 1, minWidth: "120px" },
			sliderValue: { color: "var(--dsw-alias-label-tertiary)", fontSize: "12px", width: "40px", textAlign: "right" },
			button: {
				padding: "5px 12px",
				borderRadius: "8px",
				border: "1px solid var(--dsw-alias-border-l2)",
				background: "var(--dsw-alias-bg-layer-1)",
				color: "var(--dsw-alias-label-primary)",
				fontSize: "12px",
				cursor: "pointer",
				font: "inherit"
			},
			buttonPrimary: {
				padding: "5px 12px",
				borderRadius: "8px",
				border: "none",
				background: "var(--dsw-alias-brand-primary)",
				color: "var(--dsw-alias-brand-text)",
				fontSize: "12px",
				cursor: "pointer",
				font: "inherit"
			},
			textInput: {
				flex: 1,
				minWidth: "180px",
				padding: "5px 10px",
				borderRadius: "8px",
				border: "1px solid var(--dsw-alias-border-l2)",
				background: "var(--dsw-alias-bg-layer-1)",
				color: "var(--dsw-alias-label-primary)",
				fontSize: "12px",
				font: "inherit",
				boxSizing: "border-box"
			},
			colorInput: { width: "36px", height: "28px", padding: 0, border: "1px solid var(--dsw-alias-border-l2)", borderRadius: "6px", background: "transparent", cursor: "pointer" },
			notice: { color: "var(--dsw-alias-brand-primary)", fontSize: "12px", lineHeight: "18px", minHeight: "18px" }
		};

		/** A 4-color live swatch rendered straight from the theme's tokens. */
		function Swatch({ tokens }) {
			const bg = tokens["--dsw-alias-bg-base"];
			const layer = tokens["--dsw-alias-bg-layer-2"];
			const brand = tokens["--dsw-alias-brand-primary"];
			const text = tokens["--dsw-alias-label-primary"];
			return (0, jsx.jsxs)("div", {
				style: { ...styles.swatch, background: bg },
				children: [
					(0, jsx.jsx)("div", { style: { width: "22%", background: layer } }),
					(0, jsx.jsxs)("div", {
						style: { flex: 1, display: "flex", flexDirection: "column" },
						children: [
							(0, jsx.jsx)("div", { style: { flex: 1, background: text, opacity: 0.85 } }),
							(0, jsx.jsx)("div", { style: { flex: 1, background: brand } })
						]
					})
				]
			});
		}
		function DefaultSwatch() {
			return (0, jsx.jsxs)("div", {
				style: styles.swatch,
				children: [
					(0, jsx.jsx)("div", { style: { flex: 1, background: "#ffffff" } }),
					(0, jsx.jsx)("div", { style: { flex: 1, background: "#151517" } })
				]
			});
		}
		//#endregion

		//#region components
		function ThemeCard({ theme, selected, onSelect, t }) {
			return (0, jsx.jsxs)("button", {
				type: "button",
				onClick: onSelect,
				"aria-pressed": selected,
				style: { ...styles.card, ...(selected ? styles.cardSelected : {}) },
				children: [
					(0, jsx.jsx)(Swatch, { tokens: theme.tokens }),
					(0, jsx.jsx)("span", {
						style: { ...styles.cardLabel, ...(selected ? styles.cardLabelSelected : {}) },
						children: t(`theme.${theme.id}`)
					})
				]
			});
		}

		/** Row 1: theme picker, registered into Settings → General. */
		function ThemeRow({ t, setTheme, useStore }) {
			const theme = useStore((s) => s.theme);
			const selected = THEME_IDS.has(theme) ? theme : null;
			return (0, jsx.jsxs)("div", {
				style: styles.group,
				children: [
					(0, jsx.jsx)("div", { style: styles.title, children: t("row.title") }),
					(0, jsx.jsx)("div", { style: styles.subtitle, children: t("row.subtitle") }),
					(0, jsx.jsxs)("div", {
						style: styles.grid,
						children: [
							(0, jsx.jsxs)("button", {
								type: "button",
								onClick: () => setTheme(DEFAULT_THEME),
								"aria-pressed": selected === null,
								style: { ...styles.card, ...(selected === null ? styles.cardSelected : {}) },
								children: [
									(0, jsx.jsx)(DefaultSwatch, {}),
									(0, jsx.jsx)("span", {
										style: { ...styles.cardLabel, ...(selected === null ? styles.cardLabelSelected : {}) },
										children: t("theme.system")
									})
								]
							}),
							THEMES.map((themeDef) => (0, jsx.jsx)(ThemeCard, {
								theme: themeDef,
								selected: selected === themeDef.id,
								onSelect: () => setTheme(themeDef.id),
								t
							}, themeDef.id))
						]
					})
				]
			});
		}

		function Slider({ label, value, min, max, step, format, onChange }) {
			return (0, jsx.jsxs)("div", {
				style: styles.sliderRow,
				children: [
					(0, jsx.jsx)("span", { style: styles.sliderLabel, children: label }),
					(0, jsx.jsx)("input", { type: "range", min, max, step, value, style: styles.slider, onChange: (e) => onChange(Number(e.target.value)) }),
					(0, jsx.jsx)("span", { style: styles.sliderValue, children: format(value) })
				]
			});
		}

		/** Row 2: wallpaper + accent + liquid glass + theme-pack import/export. */
		function StudioRow({ t, useStore, setWallpaper, setOpacity, setBlur, setAccent, setGlass, setGlassBlur, setGlassAlpha, exportPack, importPack }) {
			const url = useStore((s) => s.url);
			const opacity = useStore((s) => s.opacity);
			const blur = useStore((s) => s.blur);
			const accent = useStore((s) => s.accent);
			const glass = useStore((s) => s.glass);
			const glassBlur = useStore((s) => s.glassBlur);
			const glassAlpha = useStore((s) => s.glassAlpha);
			const notice = useStore((s) => s.notice);
			const fileRef = _react.useRef(null);
			const urlRef = _react.useRef(null);
			const packRef = _react.useRef(null);
			return (0, jsx.jsxs)("div", {
				style: styles.group,
				children: [
					(0, jsx.jsx)("div", { style: styles.sectionLabel, children: t("wallpaper.title") }),
					(0, jsx.jsxs)("div", {
						style: styles.row,
						children: [
							(0, jsx.jsx)("button", { type: "button", style: styles.button, onClick: () => fileRef.current?.click(), children: t("wallpaper.choose") }),
							(0, jsx.jsx)("input", {
								ref: fileRef,
								type: "file",
								accept: "image/*",
								style: { display: "none" },
								onChange: (e) => {
									const file = e.target.files?.[0];
									if (!file) return;
									const reader = new FileReader();
									reader.onload = () => {
										const img = new Image();
										img.onload = () => setWallpaper(compressImage(img, 1920, 0.85));
										img.src = String(reader.result);
									};
									reader.readAsDataURL(file);
									e.target.value = "";
								}
							}),
							(0, jsx.jsx)("input", {
								ref: urlRef,
								style: styles.textInput,
								placeholder: t("wallpaper.urlPlaceholder"),
								onKeyDown: (e) => {
									if (e.key !== "Enter") return;
									const value = urlRef.current?.value?.trim();
									if (value) { setWallpaper(value); urlRef.current.value = ""; }
								}
							}),
							url !== null && (0, jsx.jsx)("button", { type: "button", style: styles.button, onClick: () => setWallpaper(null), children: t("wallpaper.remove") })
						]
					}),
					url !== null && (0, jsx.jsxs)(_react.Fragment, {
						children: [
							(0, jsx.jsx)(Slider, { label: t("wallpaper.opacity"), value: Math.round(opacity * 100), min: 10, max: 100, step: 5, format: (v) => `${v}%`, onChange: setOpacity }),
							(0, jsx.jsx)(Slider, { label: t("wallpaper.blur"), value: blur, min: 0, max: 40, step: 1, format: (v) => `${v}px`, onChange: setBlur })
						]
					}),
					(0, jsx.jsx)("div", { style: styles.hint, children: t("wallpaper.hint") }),
					(0, jsx.jsx)("div", { style: styles.sectionLabel, children: t("accent.title") }),
					(0, jsx.jsxs)("div", {
						style: styles.row,
						children: [
							(0, jsx.jsx)("input", {
								type: "color",
								style: styles.colorInput,
								value: accent || "#4d6bfe",
								onChange: (e) => setAccent(e.target.value)
							}),
							accent !== null && (0, jsx.jsx)("button", { type: "button", style: styles.button, onClick: () => setAccent(null), children: t("accent.reset") }),
							(0, jsx.jsx)("span", { style: styles.hint, children: t("accent.hint") })
						]
					}),
					(0, jsx.jsx)("div", { style: styles.sectionLabel, children: t("glass.title") }),
					(0, jsx.jsxs)("div", {
						style: styles.row,
						children: [
							(0, jsx.jsxs)("label", {
								style: { ...styles.row, gap: "6px", cursor: "pointer", color: "var(--dsw-alias-label-primary)", fontSize: "12px" },
								children: [
									(0, jsx.jsx)("input", { type: "checkbox", checked: glass, onChange: (e) => setGlass(e.target.checked) }),
									t("glass.toggle")
								]
							}),
							(0, jsx.jsx)("span", { style: styles.hint, children: t("glass.hint") })
						]
					}),
					glass && (0, jsx.jsxs)(_react.Fragment, {
						children: [
							(0, jsx.jsx)(Slider, { label: t("glass.blur"), value: glassBlur, min: 4, max: 40, step: 1, format: (v) => `${v}px`, onChange: setGlassBlur }),
							(0, jsx.jsx)(Slider, { label: t("glass.alpha"), value: Math.round(glassAlpha * 100), min: 30, max: 92, step: 2, format: (v) => `${v}%`, onChange: setGlassAlpha })
						]
					}),
					(0, jsx.jsx)("div", { style: styles.sectionLabel, children: "Theme pack" }),
					(0, jsx.jsxs)("div", {
						style: styles.row,
						children: [
							(0, jsx.jsx)("button", { type: "button", style: styles.buttonPrimary, onClick: exportPack, children: t("pack.export") }),
							(0, jsx.jsx)("input", { ref: packRef, style: styles.textInput, placeholder: t("pack.placeholder") }),
							(0, jsx.jsx)("button", {
								type: "button",
								style: styles.button,
								onClick: () => {
									const value = packRef.current?.value?.trim();
									if (value) { importPack(value); packRef.current.value = ""; }
								},
								children: t("pack.import")
							})
						]
					}),
					(0, jsx.jsx)("div", { style: styles.notice, children: notice })
				]
			});
		}
		//#endregion

		//#region plugin body
		const inject = ["slots", "locale", "theme"];

		function apply(ctx) {
			// Register the curated catalog into the shell's ThemeRuntime.
			const disposers = THEMES.map((themeDef) => ctx.theme.register(themeDef));
			ctx.effect(() => () => { for (const dispose of disposers) dispose(); }, "theme-lab: theme registration");

			// Restore saved theme once.
			const saved = readTheme();
			if (typeof saved === "string" && saved !== DEFAULT_THEME && THEME_IDS.has(saved)) {
				if (ctx.theme.getTheme().preference !== saved) ctx.theme.setTheme(saved);
			}

			// Theme row store sync.
			const themeStore = createThemeStore();
			let themeBound;
			const syncTheme = (snapshot) => {
				themeBound?.sync(snapshot.preference, snapshot.revision);
				// Scheme change alters the base color; re-shade dependent layers.
				if (readWallpaper() !== null) applyWallpaper(ctx);
				if (readGlass()) applyGlass(ctx);
			};
			ctx.on("theme/change", syncTheme);

			// Studio row store sync.
			const studioStore = createStudioStore();
			let studioBound;
			let studioRevision = 0;
			let studioNotice = "";
			const syncStudio = () => {
				studioRevision += 1;
				studioBound?.sync(readWallpaper(), readOpacity(), readBlur(), readAccent(), readGlass(), readGlassBlur(), readGlassAlpha(), studioNotice, studioRevision);
			};
			const setStudioNotice = (text) => {
				studioNotice = text;
				syncStudio();
			};

			applyWallpaper(ctx);
			applyAccent(ctx);
			applyGlass(ctx);
			syncStudio();
			ctx.effect(() => () => { teardownWallpaper(); teardownAccent(); teardownGlass(); }, "theme-lab: layer cleanup");

			ctx.effect(() => ctx.locale.register(SETTINGS_NS, { zh, en }), "theme-lab: dictionaries");

			// Row 1 — theme picker.
			const themeInjected = (actions) => {
				themeBound = actions;
				syncTheme(ctx.theme.getTheme());
				return {
					setTheme: (id) => {
						ctx.theme.setTheme(id);
						writeStorage(KEY_THEME, id);
					}
				};
			};
			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: "theme-lab",
				order: 20,
				store: themeStore,
				locale: SETTINGS_NS,
				inject: themeInjected
			}, ThemeRow));

			// Row 2 — wallpaper / accent / theme packs.
			const studioInjected = (actions) => {
				studioBound = actions;
				syncStudio();
				return {
					setWallpaper: (url) => {
						writeStorage(KEY_WALLPAPER, url);
						applyWallpaper(ctx);
						setStudioNotice("");
					},
					setOpacity: (percent) => {
						const value = Math.min(1, Math.max(0.1, percent / 100));
						writeStorage(KEY_OPACITY, String(value));
						applyWallpaper(ctx);
						syncStudio();
					},
					setBlur: (px) => {
						const value = Math.min(40, Math.max(0, px));
						writeStorage(KEY_BLUR, String(value));
						applyWallpaper(ctx);
						syncStudio();
					},
					setAccent: (hex) => {
						writeStorage(KEY_ACCENT, hex);
						applyAccent(ctx);
						syncStudio();
					},
					setGlass: (on) => {
						writeStorage(KEY_GLASS, on ? "on" : null);
						applyGlass(ctx);
						syncStudio();
					},
					setGlassBlur: (px) => {
						const value = Math.min(40, Math.max(4, px));
						writeStorage(KEY_GLASS_BLUR, String(value));
						applyGlass(ctx);
						syncStudio();
					},
					setGlassAlpha: (percent) => {
						const value = Math.min(0.92, Math.max(0.3, percent / 100));
						writeStorage(KEY_GLASS_ALPHA, String(value));
						applyGlass(ctx);
						syncStudio();
					},
					exportPack: () => {
						const pack = {
							version: PACK_VERSION,
							theme: readTheme() || DEFAULT_THEME,
							wallpaper: readWallpaper() ? { url: readWallpaper(), opacity: readOpacity(), blur: readBlur() } : null,
							accent: readAccent()
						};
						const text = JSON.stringify(pack);
						try {
							navigator.clipboard.writeText(text);
							setStudioNotice(ctx.locale.get(SETTINGS_NS, "pack.exported") || "exported");
						} catch {
							setStudioNotice(text);
						}
					},
					importPack: (text) => {
						const t = (key) => ctx.locale.get(SETTINGS_NS, key) || key;
						try {
							const pack = JSON.parse(text);
							if (!pack || typeof pack !== "object" || pack.version !== PACK_VERSION) {
								setStudioNotice(t("pack.invalid"));
								return;
							}
							if (typeof pack.theme === "string" && pack.theme !== DEFAULT_THEME && THEME_IDS.has(pack.theme)) {
								ctx.theme.setTheme(pack.theme);
								writeStorage(KEY_THEME, pack.theme);
							}
							if (pack.wallpaper && typeof pack.wallpaper.url === "string") {
								writeStorage(KEY_WALLPAPER, pack.wallpaper.url);
								if (typeof pack.wallpaper.opacity === "number") writeStorage(KEY_OPACITY, String(Math.min(1, Math.max(0.1, pack.wallpaper.opacity))));
								if (typeof pack.wallpaper.blur === "number") writeStorage(KEY_BLUR, String(Math.min(40, Math.max(0, pack.wallpaper.blur))));
							}
							if (typeof pack.accent === "string" && hexToRgb(pack.accent)) writeStorage(KEY_ACCENT, pack.accent);
							applyWallpaper(ctx);
							applyAccent(ctx);
							setStudioNotice(t("pack.imported"));
						} catch {
							setStudioNotice(t("pack.invalid"));
						}
					}
				};
			};
			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: "theme-lab-studio",
				order: 30,
				store: studioStore,
				locale: SETTINGS_NS,
				inject: studioInjected
			}, StudioRow));
		}
		//#endregion

		exports.SETTINGS_NS = SETTINGS_NS;
		exports.THEMES = THEMES;
		exports.DEFAULT_THEME = DEFAULT_THEME;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
