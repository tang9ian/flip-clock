#!/usr/bin/env bash
#
# generate-icons.sh — 从 public/favicon.svg 派生 PWA 图标资产
#
# ⚠️  一次性离线工具，产物 PNG 已提交进仓库，请勿接入 npm run build。
#     本脚本依赖 macOS 内置的 sips，在 Linux / Windows / CI 上不可用；
#     构建流程若依赖它会导致跨平台构建直接失败。
#     详见 docs/designs/DES-001.md 的 A2。
#
# 用法: bash scripts/generate-icons.sh
#
# 实现决策：以 public/favicon.svg 为唯一数据源，用 awk 派生变体，
# 而非在脚本里内联复制一份 SVG —— 避免图标改版后两处内容漂移。

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/public/favicon.svg"
OUT="$ROOT/public/icons"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

command -v sips >/dev/null 2>&1 || {
  echo "错误: 需要 macOS 内置的 sips，当前环境不可用" >&2
  exit 1
}
[ -f "$SRC" ] || { echo "错误: 找不到 $SRC" >&2; exit 1; }

mkdir -p "$OUT"

# 生成指定变体的中间 SVG
#   plain    保留原圆角（四角透明）              → 标准 any 图标
#   bleed    背景铺满不透明，内容不缩放          → iOS apple-touch-icon
#   maskable 背景铺满不透明 + 内容缩至 80% 居中  → Android 自适应图标
build_svg() {
  local mode="$1" size="$2" dest="$3"
  awk -v mode="$mode" -v size="$size" '
    # 必须注入显式 width/height。原 SVG 只有 viewBox="0 0 32 32"，
    # sips 会按 32px 光栅化后再放大位图，512 产物严重模糊不可用。
    /<svg / {
      sub(/<svg /, "<svg width=\"" size "\" height=\"" size "\" ")
      print; next
    }
    # 背景矩形。bleed / maskable 去掉圆角：
    # iOS 不支持透明 apple-touch-icon（会被合成为黑色），
    # Android 圆形遮罩也需要背景铺满。
    /fill="url\(#bg\)"/ {
      if (mode != "plain") sub(/ rx="6"/, "")
      print
      # maskable 安全区：内容整体缩至 80% 并居中，
      # translate(3.2,3.2) = 32 * (1 - 0.8) / 2
      if (mode == "maskable") print "  <g transform=\"translate(3.2,3.2) scale(0.8)\">"
      next
    }
    /<\/svg>/ {
      if (mode == "maskable") print "  </g>"
      print; next
    }
    { print }
  ' "$SRC" > "$dest"
}

render() {
  local mode="$1" size="$2" name="$3"
  build_svg "$mode" "$size" "$TMP/$name.svg"
  sips -s format png "$TMP/$name.svg" --out "$OUT/$name.png" >/dev/null 2>&1
  local dims
  dims="$(sips -g pixelWidth -g pixelHeight "$OUT/$name.png" | awk '/pixel/ { printf "%sx", $2 }')"
  printf '  %-24s %s\n' "$name.png" "${dims%x}"
}

echo "生成 PWA 图标 → public/icons/"
render plain    192 icon-192
render plain    512 icon-512
render maskable 512 maskable-512
render bleed    180 apple-touch-icon
echo "完成"
