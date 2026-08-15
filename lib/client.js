// dsh-theme-lab — browser half (client plugin bundle).
//
// Loaded by dsh-client-modules at /plugins/dsh-theme-lab/client.js and executed
// through the vendored cordis Loader's lazy-CJS module table
// (window.__ModuleLoader__.load). The factory body is plain CJS with require()
// resolved against the shell's module table — the same shape the shipped ui-*
// packages emit.
//
// What this plugin is (0.3.0): exactly two things, done well —
//   1. Liquid glass: the whole shell goes translucent (every surface token,
//      including the page base) behind one master transparency slider.
//   2. A full-page custom wallpaper behind everything.
// No theme catalog, no accent colors, no packs. Preferences persist in
// localStorage, the correct boundary for third-party visual preferences (the
// Host settings wire only exposes an allowlisted namespace set to browser
// clients).
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
		const KEY_GLASS = "dsh-theme-lab:glass";
		const KEY_ALPHA = "dsh-theme-lab:glass-alpha";
		const KEY_WALLPAPER = "dsh-theme-lab:wallpaper";
		const DEFAULT_ALPHA = 0.62;
		const GLASS_SOURCE = "dsh-theme-lab:glass";
		const GLASS_CSS_ID = "dsh-theme-lab-glass-css";
		/** Glass defaults to ON: transparency is the whole point of the plugin. */
		const DEFAULT_GLASS_ON = true;

		function readStorage(key) {
			try { return window.localStorage.getItem(key); } catch { return null; }
		}
		function writeStorage(key, value) {
			try {
				if (value === null || value === void 0) window.localStorage.removeItem(key);
				else window.localStorage.setItem(key, value);
			} catch { /* quota exceeded — ignore */ }
		}
		const readGlassOn = () => {
			const raw = readStorage(KEY_GLASS);
			if (raw === null) return DEFAULT_GLASS_ON;
			return raw === "on";
		};
		const readAlpha = () => {
			const raw = readStorage(KEY_ALPHA);
			if (raw === null) return DEFAULT_ALPHA;
			const n = Number(raw);
			return Number.isFinite(n) && n > 0 ? Math.min(0.95, Math.max(0.3, n)) : DEFAULT_ALPHA;
		};
		const readWallpaper = () => readStorage(KEY_WALLPAPER);
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
		//#endregion

		//#region locale
		const zh = {
			"row.title": "液态玻璃",
			"row.subtitle": "由 Theme Lab 提供 · 全界面透明化 + 自定义背景图",
			"glass.toggle": "启用玻璃质感",
			"glass.alpha": "透明度",
			"glass.hint": "透明度越大越透，背景越清晰。",
			"wallpaper.title": "背景图",
			"wallpaper.choose": "选择图片…",
			"wallpaper.upload": "点击上传背景图",
			"wallpaper.formats": "支持 JPG / PNG / WebP / GIF",
			"wallpaper.badType": "仅支持 JPG / PNG / WebP / GIF 格式的图片",
			"wallpaper.urlPlaceholder": "或粘贴图片 URL",
			"wallpaper.remove": "移除背景",
			"wallpaper.replace": "更换背景",
			"wallpaper.previewHint": "点击图片全屏预览",
			"wallpaper.save": "保存",
			"wallpaper.unsaved": "有未保存的更改",
			"wallpaper.badUrl": "图片链接加载失败，请检查后重试",
			"wallpaper.checking": "校验中…",
			"wallpaper.hint": "背景铺满整个页面，保存在本浏览器；过大的图片会自动压缩。"
		};
		const en = {
			"row.title": "Liquid Glass",
			"row.subtitle": "Powered by Theme Lab · full-shell transparency + custom background",
			"glass.toggle": "Enable glassmorphism",
			"glass.alpha": "Opacity",
			"glass.hint": "Higher transparency reveals more of the background.",
			"wallpaper.title": "Background",
			"wallpaper.choose": "Choose image…",
			"wallpaper.upload": "Click to upload a background",
			"wallpaper.formats": "JPG / PNG / WebP / GIF",
			"wallpaper.badType": "Only JPG / PNG / WebP / GIF images are supported",
			"wallpaper.urlPlaceholder": "…or paste an image URL",
			"wallpaper.remove": "Remove background",
			"wallpaper.replace": "Replace",
			"wallpaper.previewHint": "Click image to preview fullscreen",
			"wallpaper.save": "Save",
			"wallpaper.unsaved": "Unsaved changes",
			"wallpaper.badUrl": "Image failed to load from this URL. Please check and retry.",
			"wallpaper.checking": "Checking…",
			"wallpaper.hint": "The background spans the whole page and stays in this browser; large images are compressed automatically."
		};
		//#endregion

		//#region wallpaper layer (full-page background)
		let wallpaperEl = null;

		function applyWallpaper() {
			const url = readWallpaper();
			if (url === null) {
				wallpaperEl?.remove();
				wallpaperEl = null;
				return;
			}
			if (wallpaperEl === null || !document.body.contains(wallpaperEl)) {
				wallpaperEl = document.createElement("div");
				wallpaperEl.style.cssText = "position:fixed;inset:0;z-index:-1;pointer-events:none;background-size:cover;background-position:center;background-repeat:no-repeat;";
				document.body.prepend(wallpaperEl);
			}
			wallpaperEl.style.backgroundImage = `url("${url}")`;
		}

		function teardownWallpaper() {
			wallpaperEl?.remove();
			wallpaperEl = null;
		}

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

		//#region liquid glass layer
		/**
		 * Every surface token the shell paints, page base included, goes
		 * translucent so the wallpaper shows through everywhere. Neutral white
		 * on light scheme, near-black on dark — the classic frosted-glass recipe.
		 */
		const GLASS_TOKENS = [
			"--dsw-alias-bg-base",
			"--dsw-alias-bg-layer-1",
			"--dsw-alias-bg-layer-2",
			"--dsw-alias-bg-layer-3",
			"--dsw-alias-bg-overlay",
			"--dsw-specific-sidebar-fill",
			"--dsw-alias-markdown-code-block",
			"--dsw-alias-markdown-inline-code"
		];
		const LIGHT_SURFACE = "#ffffff";
		const DARK_SURFACE = "#151517";

		let glassDispose = null;

		function glassCss() {
			// Transparency only — no backdrop-filter. It created containing-block
			// side effects that broke the settings dialog, and its value did not
			// justify the complexity. The glass look comes from the translucent
			// surface tokens plus the neutralized body background.
			return [
				"/* dsh-theme-lab liquid glass */",
				"body{background-color:transparent !important;}",
				"body > *{background-color:transparent !important;}"
			].join("\n");
		}

		let applyingGlass = false;

		function applyGlass(ctx) {
			if (applyingGlass) return;
			applyingGlass = true;
			try { applyGlassInner(ctx); } finally { applyingGlass = false; }
		}

		function applyGlassInner(ctx) {
			teardownGlass();
			if (!readGlassOn()) return;
			const alpha = readAlpha();
			const overrides = {};
			for (const key of GLASS_TOKENS) {
				overrides[key] = {
					light: toRgba(LIGHT_SURFACE, alpha),
					dark: toRgba(DARK_SURFACE, alpha)
				};
			}
			glassDispose = ctx.theme.overrideTokens(GLASS_SOURCE, overrides);
			const style = document.createElement("style");
			style.id = GLASS_CSS_ID;
			style.setAttribute("data-plugin-css", "dsh-theme-lab");
			style.textContent = glassCss();
			document.head.appendChild(style);
		}

		function teardownGlass() {
			glassDispose?.();
			glassDispose = null;
			document.getElementById(GLASS_CSS_ID)?.remove();
		}
		//#endregion

		//#region store
		function createGlassStore() {
			return (0, _runtime_client.defineStore)({
				init: () => ({
					on: DEFAULT_GLASS_ON,
					alpha: DEFAULT_ALPHA,
					wallpaper: null,
					revision: -1
				}),
				actions: {
					sync: (d, on, alpha, wallpaper, revision) => {
						if (revision <= d.revision) return;
						d.on = on;
						d.alpha = alpha;
						d.wallpaper = wallpaper;
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
			checkLabel: { display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", color: "var(--dsw-alias-label-primary)", fontSize: "12px" },
			headerRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" },
			previewWrap: {
				position: "relative",
				borderRadius: "10px",
				overflow: "hidden",
				border: "1px solid var(--dsw-alias-border-l1)",
				width: "140px",
				aspectRatio: "16 / 9",
				background: "var(--dsw-alias-bg-layer-1)",
				flexShrink: 0,
				cursor: "zoom-in"
			},
			previewImage: {
				position: "absolute",
				inset: 0,
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat"
			},
			actionRow: { display: "flex", gap: "8px", marginTop: "6px" },
			actionButton: {
				padding: "4px 10px",
				borderRadius: "8px",
				border: "1px solid var(--dsw-alias-border-l2)",
				background: "transparent",
				color: "var(--dsw-alias-label-secondary)",
				fontSize: "12px",
				lineHeight: "18px",
				cursor: "pointer",
				font: "inherit"
			},
			actionButtonDanger: {
				padding: "4px 10px",
				borderRadius: "8px",
				border: "1px solid rgba(229, 72, 77, 0.45)",
				background: "transparent",
				color: "#e5484d",
				fontSize: "12px",
				lineHeight: "18px",
				cursor: "pointer",
				font: "inherit"
			},
			buttonColumn: { display: "flex", flexDirection: "column", gap: "6px", justifyContent: "flex-start" },
			uploadBox: {
				width: "200px",
				aspectRatio: "16 / 9",
				borderRadius: "10px",
				border: "1.5px dashed var(--dsw-alias-border-l2)",
				background: "var(--dsw-alias-bg-layer-1)",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				gap: "4px",
				cursor: "pointer",
				font: "inherit",
				padding: 0
			},
			uploadPlus: { fontSize: "22px", lineHeight: "1", color: "var(--dsw-alias-label-tertiary)" },
			uploadText: { fontSize: "12px", color: "var(--dsw-alias-label-tertiary)" },
			saveButton: {
				padding: "4px 10px",
				borderRadius: "8px",
				border: "none",
				background: "#4d6bfe",
				color: "#ffffff",
				fontSize: "12px",
				lineHeight: "18px",
				cursor: "pointer",
				font: "inherit"
			},
			saveButtonDisabled: {
				padding: "4px 10px",
				borderRadius: "8px",
				border: "none",
				background: "var(--dsw-alias-bg-layer-2)",
				color: "var(--dsw-alias-label-tertiary)",
				fontSize: "12px",
				lineHeight: "18px",
				cursor: "default",
				font: "inherit"
			},
			dirtyHint: { color: "#e5484d", fontSize: "12px", lineHeight: "18px" },
			lightboxOverlay: {
				position: "fixed",
				inset: 0,
				background: "rgba(0, 0, 0, 0.85)",
				zIndex: 99999,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				cursor: "zoom-out"
			},
			lightboxImage: {
				maxWidth: "92vw",
				maxHeight: "92vh",
				objectFit: "contain",
				borderRadius: "8px",
				boxShadow: "0 8px 64px rgba(0, 0, 0, 0.5)"
			}
		};

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
		//#endregion

		//#region component
		/** Toggle switch, plain inline styles. */
		function Toggle({ checked, onChange }) {
			return (0, jsx.jsx)("button", {
				type: "button",
				role: "switch",
				"aria-checked": checked,
				onClick: () => onChange(!checked),
				style: {
					width: "40px",
					height: "22px",
					borderRadius: "11px",
					border: "none",
					background: checked ? "var(--dsw-alias-brand-primary)" : "var(--dsw-alias-bg-layer-3)",
					border: checked ? "1px solid transparent" : "1px solid var(--dsw-alias-border-l2)",
					position: "relative",
					cursor: "pointer",
					padding: 0,
					flexShrink: 0,
					transition: "background 0.2s",
					font: "inherit",
					boxSizing: "border-box"
				},
				children: (0, jsx.jsx)("span", {
					style: {
						position: "absolute",
						top: "2px",
						left: checked ? "20px" : "2px",
						width: "18px",
						height: "18px",
						borderRadius: "50%",
						background: "#ffffff",
						boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
						transition: "left 0.2s"
					}
				})
			});
		}

		/** Read a picked image file, compress it, and hand back a data URL. */
		const ACCEPTED_IMAGE_TYPES = /^image\/(jpeg|png|webp|gif)$/;

		function pickImageFile(file, onReady, onError) {
			if (!file) return;
			if (!ACCEPTED_IMAGE_TYPES.test(file.type)) {
				onError?.(file.type || "unknown");
				return;
			}
			const reader = new FileReader();
			reader.onload = () => {
				const img = new Image();
				img.onload = () => onReady(compressImage(img, 1920, 0.85));
				img.src = String(reader.result);
			};
			reader.readAsDataURL(file);
		}

		/**
		 * Wallpaper preview card: shows the full image, and on hover reveals a
		 * dimmed overlay with Replace / Remove actions — the standard image
		 * picker pattern. Replacing via URL stays available in the row below.
		 */
		function WallpaperSection({ url, onApply, t }) {
			const draftState = _react.useState(url);
			const draft = draftState[0];
			const setDraft = draftState[1];
			const urlTextState = _react.useState(typeof url === "string" && /^https?:/i.test(url) ? url : "");
			const urlText = urlTextState[0];
			const setUrlText = urlTextState[1];
			const lightboxState = _react.useState(false);
			const lightbox = lightboxState[0];
			const setLightbox = lightboxState[1];
			const checkingState = _react.useState(false);
			const checking = checkingState[0];
			const setChecking = checkingState[1];
			const errorState = _react.useState("");
			const error = errorState[0];
			const setError = errorState[1];
			const fileRef = _react.useRef(null);
			// Re-sync the draft whenever the applied wallpaper changes externally.
			_react.useEffect(() => {
				setDraft(url);
				setUrlText(typeof url === "string" && /^https?:/i.test(url) ? url : "");
				setError("");
			}, [url]);
			_react.useEffect(() => {
				if (!lightbox) return void 0;
				const onKey = (e) => { if (e.key === "Escape") setLightbox(false); };
				window.addEventListener("keydown", onKey);
				return () => window.removeEventListener("keydown", onKey);
			}, [lightbox]);
			const dirty = draft !== url;
			const handleSave = () => {
				if (!dirty || checking) return;
				setError("");
				// Local data-URLs always load; remote URLs get a load pre-check so
				// a bad link is rejected with a hint instead of a blank wallpaper.
				if (draft && /^https?:/i.test(draft)) {
					setChecking(true);
					const probe = new Image();
					probe.onload = () => { setChecking(false); onApply(draft); };
					probe.onerror = () => { setChecking(false); setError(t("wallpaper.badUrl")); };
					probe.src = draft;
				} else {
					onApply(draft);
				}
			};
			const saveButton = (0, jsx.jsx)("button", {
				type: "button",
				style: dirty && !checking ? styles.saveButton : styles.saveButtonDisabled,
				disabled: !dirty || checking,
				onClick: handleSave,
				children: checking ? t("wallpaper.checking") : t("wallpaper.save")
			});
			return (0, jsx.jsxs)("div", {
				children: [
					(0, jsx.jsxs)("div", {
						style: { display: "flex", alignItems: "flex-start", gap: "10px" },
						children: [
							draft !== null && (0, jsx.jsx)("div", {
								style: styles.previewWrap,
								title: t("wallpaper.previewHint"),
								onClick: () => setLightbox(true),
								children: (0, jsx.jsx)("div", { style: { ...styles.previewImage, backgroundImage: `url("${draft}")` } })
							}),
							draft === null && (0, jsx.jsxs)("button", {
								type: "button",
								style: styles.uploadBox,
								onClick: () => fileRef.current?.click(),
								children: [
									(0, jsx.jsx)("span", { style: styles.uploadPlus, children: "+" }),
									(0, jsx.jsx)("span", { style: styles.uploadText, children: t("wallpaper.upload") }),
									(0, jsx.jsx)("span", { style: styles.uploadText, children: t("wallpaper.formats") })
								]
							}),
							draft !== null && (0, jsx.jsxs)("div", {
								style: styles.buttonColumn,
								children: [
									(0, jsx.jsx)("button", {
										type: "button",
										style: styles.actionButton,
										onClick: () => fileRef.current?.click(),
										children: t("wallpaper.replace")
									}),
									(0, jsx.jsx)("button", {
										type: "button",
										style: styles.actionButtonDanger,
										onClick: () => { setDraft(null); setUrlText(""); setError(""); },
										children: t("wallpaper.remove")
									})
								]
							})
						]
					}),
					(0, jsx.jsx)("input", {
						ref: fileRef,
						type: "file",
						accept: "image/jpeg,image/png,image/webp,image/gif",
						style: { display: "none" },
						onChange: (e) => {
							pickImageFile(
								e.target.files?.[0],
								(dataUrl) => { setDraft(dataUrl); setUrlText(""); setError(""); },
								() => setError(t("wallpaper.badType"))
							);
							e.target.value = "";
						}
					}),
					(0, jsx.jsxs)("div", {
						style: { display: "flex", gap: "8px", marginTop: "6px", alignItems: "center" },
						children: [
							(0, jsx.jsx)("input", {
								style: styles.textInput,
								placeholder: t("wallpaper.urlPlaceholder"),
								value: urlText,
								onChange: (e) => {
									const value = e.target.value;
									setUrlText(value);
									setError("");
									setDraft(value.trim() === "" ? null : value.trim());
								}
							}),
							saveButton
						]
					}),
					error !== "" && (0, jsx.jsx)("div", { style: styles.dirtyHint, children: error }),
					error === "" && dirty && (0, jsx.jsx)("div", { style: styles.dirtyHint, children: t("wallpaper.unsaved") }),
					lightbox && (0, jsx.jsx)("div", {
						style: styles.lightboxOverlay,
						onClick: () => setLightbox(false),
						children: (0, jsx.jsx)("img", { src: draft, style: styles.lightboxImage, alt: "" })
					})
				]
			});
		}

		/** The single settings row: glass toggle, sliders, background picker. */
		function GlassRow({ t, useStore, setGlass, setAlpha, setWallpaper }) {
			const on = useStore((s) => s.on);
			const alpha = useStore((s) => s.alpha);
			const wallpaper = useStore((s) => s.wallpaper);
			return (0, jsx.jsxs)("div", {
				style: styles.group,
				children: [
					(0, jsx.jsxs)("div", {
						style: styles.headerRow,
						children: [
							(0, jsx.jsx)("div", { style: styles.title, children: t("row.title") }),
							(0, jsx.jsx)(Toggle, { checked: on, onChange: (v) => setGlass(v) })
						]
					}),
					on && (0, jsx.jsx)("div", { style: styles.subtitle, children: t("row.subtitle") }),
					on && (0, jsx.jsx)(Slider, { label: t("glass.alpha"), value: Math.round((1 - alpha) * 100), min: 3, max: 95, step: 1, format: (v) => `${v}%`, onChange: setAlpha }),
					on && (0, jsx.jsx)("div", { style: styles.hint, children: t("glass.hint") }),
					on && (0, jsx.jsx)("div", { style: styles.sectionLabel, children: t("wallpaper.title") }),
					on && (0, jsx.jsx)(WallpaperSection, {
						url: wallpaper,
						onApply: (value) => setWallpaper(value),
						t
					}),
					on && (0, jsx.jsx)("div", { style: styles.hint, children: t("wallpaper.hint") })
				]
			});
		}
		//#endregion

		//#region plugin body
		const inject = ["slots", "locale", "theme"];

		function apply(ctx) {
			const store = createGlassStore();
			let bound;
			let revision = 0;
			const sync = () => {
				revision += 1;
				bound?.sync(readGlassOn(), readAlpha(), readWallpaper(), revision);
			};

			applyWallpaper();
			applyGlass(ctx);
			sync();

			// A ThemeRuntime rebuild can drop our override layer; re-apply on
			// every theme change event. Surfaces are neutral per scheme, so no
			// re-tinting is needed here.
			ctx.on("theme/change", () => {
				if (readGlassOn()) applyGlass(ctx);
			});

			ctx.effect(() => () => { teardownGlass(); teardownWallpaper(); }, "theme-lab: cleanup");
			ctx.effect(() => ctx.locale.register(SETTINGS_NS, { zh, en }), "theme-lab: dictionaries");

			const injected = (actions) => {
				bound = actions;
				sync();
				return {
					setGlass: (on) => {
						writeStorage(KEY_GLASS, on ? "on" : "off");
						applyGlass(ctx);
						sync();
					},
					setAlpha: (percent) => {
						// UI speaks "transparency %" (bigger = more see-through);
						// the surface token alpha is the inverse (1 - t/100).
						const alpha = Math.min(0.95, Math.max(0.05, 1 - percent / 100));
						writeStorage(KEY_ALPHA, String(alpha));
						applyGlass(ctx);
						sync();
					},
					setWallpaper: (url) => {
						writeStorage(KEY_WALLPAPER, url);
						applyWallpaper();
						sync();
					}
				};
			};
			const slotResult = ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: "theme-lab",
				order: 20,
				store,
				locale: SETTINGS_NS,
				inject: injected
			}, GlassRow));
		}
		//#endregion

		exports.SETTINGS_NS = SETTINGS_NS;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
