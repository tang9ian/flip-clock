<script lang="ts">
  import { onDestroy } from "svelte";

  export let value = "00";

  // 静态卡片显示的稳定值（动画结束后才更新）
  let displayValue = value;
  // 翻牌动画的目标值
  let nextValue = value;
  // 是否正在翻牌
  let isFlipping = false;
  // 动画期间收到的最新值（只保留最后一个，丢弃中间值）
  let pendingValue: string | null = null;

  function startFlip(newValue: string) {
    nextValue = newValue;
    isFlipping = true;
  }

  function onFlipEnd() {
    displayValue = nextValue;
    isFlipping = false;

    // 动画期间有新值在等待，接着翻
    if (pendingValue !== null && pendingValue !== displayValue) {
      const queued = pendingValue;
      pendingValue = null;
      startFlip(queued);
    } else {
      pendingValue = null;
    }
  }

  $: if (value !== displayValue || value !== nextValue) {
    if (isFlipping) {
      pendingValue = value;
    } else if (value !== displayValue) {
      startFlip(value);
    }
  }

  onDestroy(() => {
    isFlipping = false;
    pendingValue = null;
  });
</script>

<!--
  保留原始嵌套结构：
    .top.new 包含 .bottom.new
  这是 CSS 动画的依赖结构，不能改为兄弟节点。

  - 静态层：.top / .bottom 始终显示 displayValue
  - 动画层：.top.new（含嵌套的 .bottom.new）在翻牌时挂载
    - .top.new 显示旧值 displayValue，向下翻转
    - .bottom.new 显示新值 nextValue，从背面翻正
-->
<div class="flipper" class:flipping={isFlipping}>
  <div class="gear"></div>
  <div class="gear"></div>

  <div class="top">
    <div class="text">{displayValue}</div>
  </div>
  <div class="bottom">
    <div class="text">{displayValue}</div>
  </div>

  {#if isFlipping}
    <div class="top new" on:animationend={onFlipEnd}>
      <div class="text">{displayValue}</div>
      <div class="bottom new">
        <div class="text">{nextValue}</div>
      </div>
    </div>
  {/if}
</div>
