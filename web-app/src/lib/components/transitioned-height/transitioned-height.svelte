<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import { cubicInOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';

  export let initHeight = 256;

  let containerHeight = tweened(initHeight, {
    duration: 300,
    easing: cubicInOut,
  });

  let contentContainerElem: HTMLDivElement;

  let observer: ResizeObserver;
  function observeContentChanges() {
    observer?.disconnect();
    if (!contentContainerElem) return;

    observer = new ResizeObserver(() => updateContainerHeight());
    observer.observe(contentContainerElem);
  }

  onDestroy(() => observer?.disconnect());

  $: {
    contentContainerElem;
    observeContentChanges();
  }

  async function updateContainerHeight(newHeight: number | void) {
    await tick();

    newHeight = (newHeight ?? contentContainerElem.clientHeight) + 1;
    containerHeight.set(newHeight);
  }
</script>

<div class="transitioned-height" style:height="{$containerHeight}px">
  <div class="inner" bind:this={contentContainerElem}>
    <slot />
  </div>
</div>

<style>
  .transitioned-height {
    height: auto;
    overflow: hidden;
  }
</style>
