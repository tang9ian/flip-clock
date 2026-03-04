<script>
    import { onMount, onDestroy } from "svelte";
    import FlipUnit from "./lib/FlipUnit.svelte";

    let hour = "00";
    let minute = "00";
    let second = "00";
    let interval;

    function setTime() {
        const date = new Date();
        const newHour = String(date.getHours()).padStart(2, "0");
        const newMinute = String(date.getMinutes()).padStart(2, "0");
        const newSecond = String(date.getSeconds()).padStart(2, "0");

        if (hour !== newHour) hour = newHour;
        if (minute !== newMinute) minute = newMinute;
        if (second !== newSecond) second = newSecond;
    }

    onMount(() => {
        setTime();
        interval = setInterval(setTime, 500);
    });

    onDestroy(() => {
        if (interval) clearInterval(interval);
    });
</script>

<div class="clock">
    <FlipUnit value={hour} />
    <FlipUnit value={minute} />
    <FlipUnit value={second} />
</div>

<style>
:global(body) {
    margin: 0;
    display: flex;
    height: 100vh;
    align-items: center;
    justify-content: center;
    background-color: rgb(38, 37, 41);
    color: #fff;
    font-family: 'Roboto Mono', monospace;
}

.clock {
    display: grid;
    padding: 0 12px;
    grid-template-columns: 1fr 1fr 1fr;
    grid-column-gap: 12px;
    min-width: 200px;
    height: 220px;
    border-radius: 30px;
    background-image: linear-gradient(
        rgb(14, 14, 15) 0%,
        rgb(26, 25, 28) 20%,
        rgb(44, 44, 52) 50%,
        rgb(20, 20, 27) 100%
    );
    box-shadow: inset 0 -3px 6px 3px rgba(0, 0, 0, 0.2),
        inset 0 4px 8px 3px rgba(0, 0, 0, 0.4),
        0 2px 3px 1px rgba(255, 255, 255, 0.3), 
        0 -2px 4px 4px rgba(56, 56, 61, 0.5);
}
</style>