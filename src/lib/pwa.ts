/**
 * PWA 运行时能力封装。
 *
 * 设计原则：所有能力在不支持的环境下**静默降级**，绝不向用户报错。
 * 浏览器不支持 SW、HTTP 环境、无痕模式等场景下，应用退化为普通网页，
 * 时钟功能完全不受影响。
 */

type UpdateCallback = () => void;

let updateCallback: UpdateCallback | undefined;
let waitingWorker: ServiceWorker | undefined;

/**
 * 注册 Service Worker。
 *
 * 仅在生产构建下生效 —— 开发期注册会导致改代码不生效。
 */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD) return;
  if (!("serviceWorker" in navigator)) return;

  // 放到 load 之后注册，不阻塞首屏渲染
  window.addEventListener("load", () => {
    // 用 BASE_URL 而非硬编码 '/sw.js'，以兼容子路径部署。
    // 注意不可用 new URL('sw.js', import.meta.url)：本模块打包后位于
    // /assets/ 下，那样会被解析成 /assets/sw.js。
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .then(watchForUpdate)
      .catch(() => {
        // 注册失败即静默降级，不提示、不报错
      });
  });
}

function watchForUpdate(registration: ServiceWorkerRegistration): void {
  registration.addEventListener("updatefound", () => {
    const installing = registration.installing;
    if (!installing) return;

    installing.addEventListener("statechange", () => {
      if (installing.state !== "installed") return;
      // controller 为 null 说明是首次安装而非更新，此时不提示，
      // 避免用户首次访问就被打扰
      if (!navigator.serviceWorker.controller) return;

      waitingWorker = installing;
      updateCallback?.();
    });
  });
}

/** 注册「有新版本可用」回调。供更新提示条使用。 */
export function onUpdateReady(callback: UpdateCallback): void {
  updateCallback = callback;
}

/** 用户确认更新：让等待中的 SW 接管，接管完成后刷新页面。 */
export function applyUpdate(): void {
  if (!waitingWorker) return;

  navigator.serviceWorker.addEventListener(
    "controllerchange",
    () => location.reload(),
    { once: true },
  );
  waitingWorker.postMessage({ type: "SKIP_WAITING" });
}
