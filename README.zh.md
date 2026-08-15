# dsh-theme-lab

[English](README.md) | 中文

**[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的液态玻璃**——点一下，整个界面通透起来。

iOS 同款透明质感：页面底层、卡片、面板、聊天气泡全部化为半透玻璃，衬上你选的背景图。透明度一个滑块随心调，背景图想换就换。除此之外什么都没有——好用的东西，本就该这么简单。

## 安装

```sh
dsh plugin --profile web add dsh-theme-lab
```

打开 **设置 → 通用**，出现「液态玻璃」设置行。默认开启；装完重启一次。

## 功能

- **全界面透明化**：页面底层、卡片、面板、侧栏、聊天气泡、代码块——所有表面经官方 ThemeRuntime token 覆盖层变成半透明。亮色方案用中性白，暗色用近黑。
- **一个透明度主滑块**（30%–95%）：越低背景越清晰。
- **模糊强度滑块**（0–40px）：卡片与面板上的真 `backdrop-filter` 毛玻璃，按外壳 `data-plugin-css` 约定注入。
- **全页自定义背景**：本地上传（自动压缩）或粘贴 URL，铺满整个页面，衬在玻璃之下。

## 卸载

```sh
dsh plugin --profile web remove dsh-theme-lab
```

偏好保存在本浏览器 localStorage，卸载后无害残留。

## 许可证

MIT
