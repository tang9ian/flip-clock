import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

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

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), serviceWorkerPlugin()],
});
