/**
 * sw.template.js — Service Worker 源模板
 *
 * 构建时由 vite.config.ts 的 flip-clock-sw 插件注入预缓存清单与缓存版本号，
 * 输出为 dist/sw.js。本文件本身不会被打包，也不应被直接引用。
 *
 * 注意：下方两个占位符各自只能在本文件出现一次（含注释）。
 * 插件用 replaceAll 注入，若在注释里重复书写同名 token 会被一并替换。
 *
 * ⚠️ 必须放在项目根目录，不得移入 src/。
 *    tsconfig.app.json 的 include 含 `src/**\/*.js` 且开启了 checkJs，
 *    而 types 仅为 ["svelte", "vite/client"] —— SW 全局（self / caches /
 *    clients / skipWaiting）在该配置下全部未定义，移入 src/ 会让
 *    `npm run check` 直接失败。详见 docs/designs/DES-001.md 的 A4。
 */

const CACHE_NAME = "flip-clock-__VERSION__";

// 构建期注入的预缓存清单。路径均为相对形式，由 self.location 解析，
// 因此部署在根路径或任意子路径下都能正确解析。
const PRECACHE = __PRECACHE__;

self.addEventListener("install", (event) => {
  // 实现决策：刻意不调用 skipWaiting()。
  // 新版本等到下次冷启动、或用户在更新提示条上主动确认后才接管，
  // 避免打断正在运行的屏保 / 全屏展示（REQ-001 边界情况 E6）。
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// 供更新提示条使用：用户点击"刷新"后由页面 postMessage 过来
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // 安全约束：只介入同源 GET，跨域与非 GET 一律放行不缓存
  if (request.method !== "GET") return;
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(respond(request));
});

async function respond(request) {
  const cache = await caches.open(CACHE_NAME);

  // 导航请求统一回落到入口文档 —— 应用是单页时钟，无路由
  if (request.mode === "navigate") {
    const entry = await cache.match("./");
    if (entry) return entry;

    try {
      return await fetch(request);
    } catch {
      return Response.error();
    }
  }

  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    // 只写入成功的同源响应，避免把错误页或不透明响应污染进缓存
    if (response.ok && response.type === "basic") {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return Response.error();
  }
}
