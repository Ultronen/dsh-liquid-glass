/**
 * dsh-theme-lab smoke test — runs the real client.js under a mocked DSH
 * browser runtime (ModuleLoader, document, localStorage, cordis ctx) and
 * exercises the whole plugin lifecycle plus every user-facing action.
 * Run: node test/smoke.test.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, '../lib/client.js'), 'utf8');

let failures = 0;
function assert(cond, label) {
  if (cond) { console.log(`  ✅ ${label}`); }
  else { failures += 1; console.log(`  ❌ ${label}`); }
}

//#region mocks
const storageMap = new Map();
const createdElements = [];
const headChildren = [];
const bodyChildren = [];

function makeElement(tag) {
  const el = {
    tagName: tag.toUpperCase(),
    id: '',
    style: { setProperty() {}, },
    children: [],
    attrs: {},
    textContent: '',
    setAttribute(k, v) { this.attrs[k] = v; },
    appendChild(c) { this.children.push(c); return c; },
    prepend(c) { this.children.unshift(c); return c; },
    remove() { this.removed = true; },
    contains() { return true; },
  };
  createdElements.push(el);
  return el;
}

const documentMock = {
  createElement: (tag) => makeElement(tag),
  head: { appendChild: (c) => headChildren.push(c) },
  body: { prepend: (c) => bodyChildren.push(c), contains: () => false },
  getElementById: (id) => createdElements.find((e) => e.id === id && !e.removed) || null,
};

const moduleTable = {
  'react/jsx-runtime': {
    jsx: (type, props) => ({ type, props }),
    jsxs: (type, props) => ({ type, props }),
  },
  react: {
    useRef: (v) => ({ current: v }),
    Fragment: Symbol('Fragment'),
  },
  '@deepseek-ai/dsh-client-runtime/client': {
    defineStore: ({ init, actions }) => {
      const state = init();
      const boundActions = {};
      for (const [name, fn] of Object.entries(actions)) {
        boundActions[name] = (...args) => fn(state, ...args);
      }
      return { state, actions: boundActions };
    },
  },
};

let loadedModule = null;
const windowMock = {
  __ModuleLoader__: {
    load: (def) => { loadedModule = def; },
  },
  localStorage: {
    getItem: (k) => (storageMap.has(k) ? storageMap.get(k) : null),
    setItem: (k, v) => storageMap.set(k, String(v)),
    removeItem: (k) => storageMap.delete(k),
  },
};

const ctxCalls = { overrideTokens: [], register: [], slotRegister: [], localeRegister: [], effects: [], on: [] };
const ctxMock = {
  theme: {
    register: (t) => { ctxCalls.register.push(t); return () => {}; },
    setTheme: () => {},
    getTheme: () => ({ preference: 'system', revision: 1, active: 'light' }),
    overrideTokens: (source, overrides) => { ctxCalls.overrideTokens.push({ source, overrides }); return () => {}; },
  },
  slots: {
    inject: (name, cb) => cb(),
    register: (meta, component) => { ctxCalls.slotRegister.push({ meta, component }); return () => {}; },
  },
  locale: {
    register: (ns, dicts) => { ctxCalls.localeRegister.push({ ns, dicts }); return () => {}; },
    get: (ns, key) => (ctxCalls.localeRegister[0]?.dicts?.zh?.[key]) || key,
  },
  effect: (fn, label) => { ctxCalls.effects.push(label); if (typeof fn === 'function') fn(); },
  on: (event, cb) => { ctxCalls.on.push(event); },
};
//#endregion

//#region execute the real client.js
const fn = new Function('window', 'document', 'require', source);
fn(windowMock, documentMock, (name) => {
  if (!(name in moduleTable)) throw new Error(`unexpected require: ${name}`);
  return moduleTable[name];
});
//#endregion

console.log('\n[1] module registration');
assert(loadedModule !== null, 'client.js registers itself via __ModuleLoader__.load');
assert(loadedModule.id === 'dsh-theme-lab', `module id is "dsh-theme-lab" (got "${loadedModule.id}")`);

console.log('\n[2] factory exports');
const factoryResult = loadedModule.factory((name) => moduleTable[name]);
assert(typeof factoryResult.apply === 'function', 'exports.apply is a function');
assert(Array.isArray(factoryResult.inject), 'exports.inject is an array');
assert(JSON.stringify(factoryResult.inject) === JSON.stringify(['slots', 'locale', 'theme']), 'inject declares exactly [slots, locale, theme]');

console.log('\n[3] apply() under a mocked cordis ctx');
factoryResult.apply(ctxMock);
assert(ctxCalls.overrideTokens.length === 1, `glass layer applied on boot (default ON) — overrideTokens called ${ctxCalls.overrideTokens.length}x`);
const boot = ctxCalls.overrideTokens[0];
assert(boot.source === 'dsh-theme-lab:glass', 'glass override uses the glass source id');
const tokenKeys = Object.keys(boot.overrides);
assert(tokenKeys.includes('--dsw-alias-bg-base'), 'page base token is translucent (full-shell transparency)');
assert(tokenKeys.includes('--dsw-alias-bg-layer-1'), 'surface layer token included');
assert(tokenKeys.length === 8, `exactly 8 surface tokens covered (got ${tokenKeys.length})`);
const baseLight = boot.overrides['--dsw-alias-bg-base'].light;
assert(/rgba\(255, 255, 255, 0.62\)/.test(baseLight), `light surface is rgba(255,255,255,0.62) by default (got ${baseLight})`);
const styleInjected = headChildren.some((c) => c.id === 'dsh-theme-lab-glass-css');
assert(styleInjected, 'backdrop-filter stylesheet injected into <head>');
const cssText = headChildren.find((c) => c.id === 'dsh-theme-lab-glass-css')?.textContent || '';
assert(cssText.includes('data-plugin-css') === false, 'stylesheet does not leak the marker into CSS text');
assert(headChildren.find((c) => c.id === 'dsh-theme-lab-glass-css')?.attrs['data-plugin-css'] === 'dsh-theme-lab', 'stylesheet carries data-plugin-css marker attribute');

console.log('\n[4] settings row registration');
assert(ctxCalls.slotRegister.length === 1, `exactly one settings row (got ${ctxCalls.slotRegister.length})`);
const rowMeta = ctxCalls.slotRegister[0].meta;
assert(rowMeta.name === 'settings.general.item', 'row lands in Settings → General');
assert(rowMeta.locale === 'settings.theme-lab', 'row carries the locale namespace');
assert(ctxCalls.localeRegister.length === 1, 'locale dictionaries registered once');
const zhDict = ctxCalls.localeRegister[0].dicts.zh;
assert(zhDict['row.title'] === '液态玻璃', 'zh title is 液态玻璃');
assert(!('theme.paper' in zhDict), 'no leftover theme-catalog strings in the dictionary');

console.log('\n[5] user actions — toggle off');
const slotInjectFn = rowMeta.inject;
const actions = slotInjectFn({ sync: () => {} });
assert(typeof actions.setGlass === 'function', 'setGlass action exposed');
assert(typeof actions.setAlpha === 'function', 'setAlpha action exposed');
assert(typeof actions.setWallpaper === 'function', 'setWallpaper action exposed');
ctxCalls.overrideTokens.length = 0;
actions.setGlass(false);
assert(storageMap.get('dsh-theme-lab:glass') === 'off', 'toggle-off persisted as "off"');
assert(ctxCalls.overrideTokens.length === 0, 'toggle-off removes the token layer (no new overrideTokens)');
assert(createdElements.find((e) => e.id === 'dsh-theme-lab-glass-css')?.removed === true, 'toggle-off removes the stylesheet');

console.log('\n[6] user actions — toggle on + sliders');
actions.setGlass(true);
assert(ctxCalls.overrideTokens.length === 1, 'toggle-on reapplies the token layer');
actions.setAlpha(40);
assert(storageMap.get('dsh-theme-lab:glass-alpha') === '0.6', 'transparency 40% persisted as surface alpha 0.6');
const afterAlpha = ctxCalls.overrideTokens.at(-1).overrides['--dsw-alias-bg-base'].light;
assert(afterAlpha.includes('0.6'), `override reflects surface alpha 0.6 for 40% transparency (got ${afterAlpha})`);

console.log('\n[7] wallpaper actions');
actions.setWallpaper('https://example.com/bg.jpg');
assert(storageMap.get('dsh-theme-lab:wallpaper') === 'https://example.com/bg.jpg', 'wallpaper URL persisted');
const wpEl = createdElements.filter((e) => e.tagName === 'DIV' && !e.removed).at(-1);
assert(wpEl && /example\.com/.test(wpEl.style.backgroundImage || ''), 'wallpaper element created with the URL as background-image');
actions.setWallpaper(null);
assert(storageMap.get('dsh-theme-lab:wallpaper') === undefined, 'wallpaper removal clears storage');

console.log('\n[8] slider clamping');
actions.setAlpha(5);
assert(Number(storageMap.get('dsh-theme-lab:glass-alpha')) >= 0.3, 'alpha clamped to the 30% floor');

console.log(failures === 0 ? '\n🎉 ALL CHECKS PASSED\n' : `\n💥 ${failures} CHECK(S) FAILED\n`);
process.exit(failures === 0 ? 0 : 1);
