# dsh-theme-lab

[English](README.md) | 中文

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的主题工作台——8 款精选亮色/暗色主题，以外壳官方 ThemeRuntime 一等公民的身份注册，外加自定义壁纸层、强调色色轮，以及可分享的主题包。

## 安装

```sh
dsh plugin --profile web add dsh-theme-lab
```

然后打开 **设置 → 通用**——内置「外观」行下方会出现两行新设置：**主题外观（Theme Lab）**和工作台行。切换主题无需重启，全部即时生效。

## 功能

- **8 款精选主题**，亮暗皆有，全部注册进外壳官方 ThemeRuntime（和内置外观共用同一个注册表——不玩样式 hack，不做 CSS 覆盖）：
  - 亮色：**纸白**、**亚麻**、**清晨**
  - 暗色：**深海**、**石墨**、**森林**、**紫夜**、**暖木**
- **实色卡预览**：每张主题卡直接用它自己的 token 渲染，所见即所得。
- **自定义壁纸**：支持本地上传（自动压缩以适配 localStorage）或粘贴图片 URL，附遮罩透明度和模糊半径滑块。表面 token 会按透明度着色，壁纸透出来的同时卡片和气泡依然清晰可读。
- **液态玻璃模式**：iOS 风格玻璃拟态——表面 token 半透明化 + 经外壳 `data-plugin-css` 约定注入的 `backdrop-filter` 模糊层。可与任意主题叠加，模糊强度和玻璃透明度均可调，搭配壁纸效果最佳。
- **强调色色轮**：一个原生取色器，通过分层 token 覆盖整个品牌色族（按钮、高亮、交互态）。
- **主题包**：把当前搭配（主题 + 壁纸 + 强调色）导出为 JSON 片段，分享给别人，也可以导入别人的主题包。

## 原理

- 主题就是普通的 `{ id, colorScheme, tokens }` 对象，通过 `ctx.theme.register()` 注册——ThemePresenter 会把 `--dsw-alias-*` 自定义属性应用到 `<body>` 上。
- 壁纸和强调色是 `ctx.theme.overrideTokens()` 覆盖层；同源重复调用会替换整层，反复调整也足够廉价。
- 偏好保存在 `localStorage`（Host 设置通道只向浏览器客户端暴露白名单命名空间，所以视觉偏好放 localStorage 才是正确边界）。

## 主题包格式

```json
{
  "version": 1,
  "theme": "ocean",
  "wallpaper": { "url": "https://…/bg.jpg", "opacity": 0.8, "blur": 8 },
  "accent": "#34d37b"
}
```

`theme` 为目录内的主题 id（或 `system`）；`wallpaper` 和 `accent` 可选。

## 卸载

```sh
dsh plugin --profile web remove dsh-theme-lab
```

localStorage 里的偏好会无害残留；想彻底重置就在 DevTools 里清掉。

## 许可证

MIT
