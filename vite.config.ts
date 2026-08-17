import { createHash } from "node:crypto";
import { copyFileSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin, type ResolvedConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// ──────────────────────────────────────────────
// 判断当前构建目标
// ──────────────────────────────────────────────
const isExtension = process.env.BUILD_TARGET === "extension";

// public/ 目录由 Vite 原样拷贝，不会出现在 bundle 中，必须手工列出。
const PUBLIC_ASSETS = [
  "./manifest.webmanifest",
  "./favicon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./icons/apple-touch-icon.png",
];

/**
 * 构建期生成 Service Worker。
 *
 * 从实际产物文件名生成预缓存清单，避免手写 hash 文件名。
 * 清单内容的 hash 即缓存版本号，构建产物一变版本号就变，无需人工维护。
 */
function serviceWorkerPlugin(): Plugin {
  return {
    name: "flip-clock-sw",
    apply: "build",
    generateBundle(_options, bundle) {
      const assets = Object.keys(bundle)
        .filter((file) => !file.endsWith(".html"))
        .map((file) => `./${file}`);

      // 用 './' 而非 './index.html'：与浏览器实际发起的导航请求 URL 对齐，
      // 同时规避 HTML 是否已出现在 bundle 中的时序不确定性。
      const precache = ["./", ...PUBLIC_ASSETS, ...assets].sort();
      const version = createHash("sha256")
        .update(precache.join("|"))
        .digest("hex")
        .slice(0, 8);

      const templatePath = fileURLToPath(
        new URL("sw.template.js", import.meta.url),
      );
      // 必须用 replaceAll：replace 传字符串时只替换第一处，
      // 一旦模板中占位符出现多次（例如注释里也写了），代码里的就会漏替换。
      const source = readFileSync(templatePath, "utf8")
        .replaceAll("__PRECACHE__", JSON.stringify(precache))
        .replaceAll("__VERSION__", version);

      this.emitFile({ type: "asset", fileName: "sw.js", source });
    },
  };
}

/**
 * 扩展构建插件：构建完成后整理产物目录，使其符合浏览器扩展规范。
 *
 * Vite 把 extension/newtab.html 输出到 dist-ext/extension/newtab.html
 * （保留相对 root 的路径），本插件将其移到 dist-ext/newtab.html，
 * 并移除 public/ 复制进来的 PWA 专用文件（webmanifest、maskable icon 等）。
 */
function extensionPlugin(): Plugin {
  let resolvedConfig: ResolvedConfig;

  return {
    name: "flip-clock-extension",
    apply: "build",
    configResolved(config) {
      resolvedConfig = config;
    },
    closeBundle() {
      const outDir = resolve(
        resolvedConfig.root,
        resolvedConfig.build.outDir,
      );

      // ── 1. 把 newtab.html 从子目录移到输出根 ──────────────
      const htmlSrc = resolve(outDir, "extension/newtab.html");
      const htmlDst = resolve(outDir, "newtab.html");
      renameSync(htmlSrc, htmlDst);
      // 删除空的 extension/ 子目录
      rmSync(resolve(outDir, "extension"), { recursive: true, force: true });

      // ── 2. 修正 HTML 内的资源路径（从 ../ 改为 ./） ────────
      let html = readFileSync(htmlDst, "utf8");
      html = html.replaceAll('../assets/', './assets/');
      html = html.replaceAll('../favicon.svg', './favicon.svg');
      writeFileSync(htmlDst, html);

      // ── 3. 复制扩展 manifest ───────────────────────────────
      copyFileSync(
        resolve(__dirname, "extension/manifest.json"),
        resolve(outDir, "manifest.json"),
      );

      // ── 4. 复制扩展所需图标（16/32/48/128px）─────────────
      // 直接复用现有大图；浏览器会缩放显示，生产场景可用 sharp 生成真实尺寸。
      const iconSrc = resolve(__dirname, "public/icons/icon-512.png");
      const iconSizes = [16, 32, 48, 128];
      mkdirSync(resolve(outDir, "icons"), { recursive: true });
      for (const size of iconSizes) {
        copyFileSync(iconSrc, resolve(outDir, `icons/icon-${size}.png`));
      }

      // ── 5. 清理 PWA 专用文件（扩展无需这些）────────────────
      const pwaOnlyFiles = [
        "manifest.webmanifest",
        "icons/maskable-512.png",
        "icons/apple-touch-icon.png",
        "icons/icon-192.png",
        "icons/icon-512.png",
      ];
      for (const f of pwaOnlyFiles) {
        rmSync(resolve(outDir, f), { force: true });
      }

      console.log(`\n✓ Extension build ready in ${resolvedConfig.build.outDir}/`);
    },
  };
}

// https://vite.dev/config/
export default defineConfig(
  isExtension
    ? // ── 扩展构建配置 ──────────────────────────────
      {
        base: "./",
        plugins: [svelte(), extensionPlugin()],
        build: {
          outDir: "dist-ext",
          emptyOutDir: true,
          rollupOptions: {
            input: {
              newtab: resolve(__dirname, "extension/newtab.html"),
            },
          },
        },
      }
    : // ── 默认 PWA 构建配置 ──────────────────────────
      {
        plugins: [svelte(), serviceWorkerPlugin()],
      },
);
