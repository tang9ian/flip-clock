# Flip Clock

[English](#english) | [中文](#中文)

---

## English

A flip clock application built with Svelte, TypeScript, and Vite. The current version is no longer just a demo clock; it includes localization, theme switching, timezone support, fullscreen display, and a screensaver-style display mode.

### Features

- Smooth flip animation for hours, minutes, and seconds
- Date display with localized weekday/month/day formatting
- 12/24-hour time modes with `AM/PM`
- Always-on seconds display
- Language support: Chinese, English, Japanese, Korean
- Theme presets: Night, Paper, Brass, Neon
- Timezone support with presets and custom IANA timezone input
- Responsive layout for desktop and mobile
- Fullscreen mode
- Screensaver mode that keeps only date, time, and `AM/PM`
- Screensaver exit via `Esc` or click
- Persistent settings via `localStorage`

### Tech Stack

- Svelte
- TypeScript
- Vite
- CSS animations
- `Intl.DateTimeFormat` for localization and timezone formatting

### Development

```bash
npm install
npm run dev
npm run check
npm run build
npm run preview
```

### Browser Extension

Build as a browser extension that replaces the new tab page:

```bash
npm run build:ext
```

The extension package will be generated in `dist-ext/`.

**Install on Chrome/Edge:**

1. Open `chrome://extensions/` or `edge://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist-ext/` folder

**Install on Firefox:**

1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select any file inside `dist-ext/` (e.g., `manifest.json`)

The extension works on Chrome, Edge, and Firefox using Manifest V3.

### Main Settings

- Language
- 12/24-hour mode
- Screensaver mode
- Clock size
- Fullscreen
- Theme
- Timezone preset/custom input

### Project Structure

```text
flip-clock/
├── src/
│   ├── lib/
│   │   └── FlipUnit.svelte
│   ├── App.svelte
│   ├── app.css
│   └── main.ts
├── public/
├── index.html
└── README.md
```

### License

MIT

---

## 中文

一个使用 Svelte、TypeScript 和 Vite 构建的翻页时钟应用。当前版本已经不只是一个演示时钟，而是包含了多语言、主题切换、时区配置、全屏展示和屏保模式的完整桌面时钟界面。

### 功能

- 小时、分钟、秒钟翻页动画
- 本地化日期显示，包含星期、年月日
- `12/24` 小时制切换和 `AM/PM`
- 秒钟默认且始终显示
- 支持四种语言：中文、English、日本語、한국어
- 支持四套主题：Night、Paper、Brass、Neon
- 支持时区预设和自定义 IANA 时区输入
- 桌面和移动端响应式布局
- 全屏模式
- 屏保模式，仅保留日期、时间和 `AM/PM`
- 屏保支持 `Esc` 或点击退出
- 通过 `localStorage` 持久化保存设置

### 技术栈

- Svelte
- TypeScript
- Vite
- CSS 动画
- 使用 `Intl.DateTimeFormat` 做本地化和时区格式化

### 开发

```bash
npm install
npm run dev
npm run check
npm run build
npm run preview
```

### 浏览器扩展

构建为浏览器扩展，替换新标签页：

```bash
npm run build:ext
```

扩展包将生成在 `dist-ext/` 目录。

**Chrome/Edge 安装：**

1. 打开 `chrome://extensions/` 或 `edge://extensions/`
2. 启用"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `dist-ext/` 文件夹

**Firefox 安装：**

1. 打开 `about:debugging#/runtime/this-firefox`
2. 点击"临时载入附加组件"
3. 选择 `dist-ext/` 内任意文件（如 `manifest.json`）

扩展使用 Manifest V3，支持 Chrome、Edge 和 Firefox。

### 主要设置项

- 语言
- `12/24` 小时制
- 屏保模式
- 时钟尺寸
- 全屏
- 主题
- 时区预设 / 自定义输入

### 项目结构

```text
flip-clock/
├── src/
│   ├── lib/
│   │   └── FlipUnit.svelte
│   ├── App.svelte
│   ├── app.css
│   └── main.ts
├── public/
├── index.html
└── README.md
```

### 许可证

MIT
