<script lang="ts">
  import { onMount } from "svelte";

  export let value = "00";

  let flipperEl: HTMLDivElement;
  let currentValue = "";

  function flipNumber(newNumber: string) {
    if (!flipperEl || currentValue === newNumber) return;
    
    const textEl = flipperEl.querySelector(".top:not(.new) .text") as HTMLElement;
    if (!textEl) return;
    
    currentValue = newNumber;
    
    // 清理
    flipperEl.classList.remove("flipping");
    flipperEl.querySelectorAll(".new").forEach(el => el.remove());
    
    const topEl = flipperEl.querySelector(".top") as HTMLElement;
    const bottomEl = flipperEl.querySelector(".bottom") as HTMLElement;
    
    const thisTop = topEl.cloneNode(true) as HTMLElement;
    const thisBottom = bottomEl.cloneNode(true) as HTMLElement;
    
    thisTop.classList.add("new");
    thisBottom.classList.add("new");
    
    (thisBottom.querySelector(".text") as HTMLElement).textContent = newNumber;
    
    topEl.parentNode?.insertBefore(thisTop, topEl.nextSibling);
    thisTop.appendChild(thisBottom);
    
    flipperEl.classList.add("flipping");
    
    (topEl.querySelector(".text") as HTMLElement).textContent = newNumber;
    
    setTimeout(() => {
      (bottomEl.querySelector(".text") as HTMLElement).textContent = newNumber;
    }, 500);
  }

  $: flipNumber(value);

  onMount(() => {
    const topText = flipperEl.querySelector(".top .text") as HTMLElement;
    const bottomText = flipperEl.querySelector(".bottom .text") as HTMLElement;
    if (topText) topText.textContent = value;
    if (bottomText) bottomText.textContent = value;
    currentValue = value;
  });
</script>

<div class="flipper" bind:this={flipperEl}>
    <div class="gear"></div>
    <div class="gear"></div>
    <div class="top">
        <div class="text"></div>
    </div>
    <div class="bottom">
        <div class="text"></div>
    </div>
</div>
