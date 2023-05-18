<script lang="ts">
  import { onMount } from 'svelte';
  import assert from '$lib/utils/assert';

  const RESOLUTION_RATIO = window?.devicePixelRatio ? Math.min(window?.devicePixelRatio, 2) : 2;

  export let speedMultiplier = 1;
  export let vertical = false;

  let canvasElem: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let containerSize: [number, number];
  let container: HTMLDivElement;

  let ktrhImg: HTMLImageElement;
  let ktrhImgVertical: HTMLImageElement;

  function rr(number: number): number {
    return number * RESOLUTION_RATIO;
  }

  let ktrhs: Ktrh[] = [];
  let maxKtrhsOnScreen: number;

  function generateKtrh(maxX = 0): Ktrh {
    const maxOffset = rr(vertical ? containerSize[0] : containerSize[1]) - rr(32);

    const x = Math.floor(Math.random() * rr(maxX) - 48);
    const y = Math.floor(Math.random() * maxOffset);

    return {
      pos: {
        y: vertical ? x : y,
        x: vertical ? y : x,
      },
      layer: Math.random(),
    };
  }

  function updateContainerSize() {
    const containerBounds = container.getBoundingClientRect();
    containerSize = [containerBounds.width, containerBounds.height];
    canvasElem.width = containerSize[0] * RESOLUTION_RATIO;
    canvasElem.height = containerSize[1] * RESOLUTION_RATIO;
    maxKtrhsOnScreen = Math.min(Math.max(Math.floor(containerSize[0] / 25), 1), 20);
    ktrhs = [...Array(maxKtrhsOnScreen).keys()].map(() => generateKtrh(containerSize[0]));
  }

  onMount(() => {
    const containerBounds = container.getBoundingClientRect();
    containerSize = [containerBounds.width, containerBounds.height];

    updateContainerSize();

    const context = canvasElem.getContext('2d');
    assert(context, 'Unable to create Canvas element');

    ctx = context;
  });

  onMount(() => {
    let resizeTimeout: number;

    const resizeHandler = () => {
      if (resizeTimeout) window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        updateContainerSize();
      }, 50);
    };

    window.addEventListener('resize', resizeHandler);
    return () => window.removeEventListener('resize', resizeHandler);
  });

  interface Ktrh {
    pos: {
      x: number;
      y: number;
    };
    /** Number in range x >= 1 & x < 0. 0.5 is the middle layer, which is in focus. */
    layer: number;
  }

  function applyParallax(layer: number): {
    /** px / ms */
    speed: number;
    size: number;
  } {
    const HORIZON_DISTANCE = 20;
    const LAYER_DISTANCE = 10;
    const FOREGROUND_LAYER_SPEED = 1;

    return {
      speed:
        ((HORIZON_DISTANCE - layer * LAYER_DISTANCE) * FOREGROUND_LAYER_SPEED) / HORIZON_DISTANCE,
      size: (HORIZON_DISTANCE - layer * LAYER_DISTANCE) * 2,
    };
  }

  let lastDraw = new Date().getTime();
  let paused = false;

  function draw() {
    if (!canvasElem) return;

    const currentMillis = new Date().getTime();
    const millisecondsSinceLastDraw = currentMillis - lastDraw;

    ctx.clearRect(0, 0, rr(containerSize[0]), rr(containerSize[1]));

    ctx.font = `${rr(24)}px serif`;

    const sortedKtrhs = ktrhs.sort((a, b) => a.layer - b.layer).reverse();

    for (const ktrh of sortedKtrhs) {
      const { speed, size } = applyParallax(ktrh.layer);

      const realSpeed = speed * speedMultiplier;

      ctx.filter = `saturate(${Math.floor(speedMultiplier * 100)}%) opacity(${Math.floor(
        speedMultiplier * 100 + 50,
      )}%)`;

      ctx.drawImage(
        vertical ? ktrhImgVertical : ktrhImg,
        ktrh.pos.x,
        ktrh.pos.y,
        rr(size),
        rr(size),
      );

      if (vertical) {
        ktrh.pos.y = Math.floor(ktrh.pos.y + millisecondsSinceLastDraw * realSpeed);
      } else {
        ktrh.pos.x = Math.floor(ktrh.pos.x + millisecondsSinceLastDraw * realSpeed);
      }

      if (
        (vertical ? ktrh.pos.y : ktrh.pos.x) > rr(vertical ? containerSize[1] : containerSize[0])
      ) {
        ktrhs.splice(ktrhs.indexOf(ktrh), 1, generateKtrh());
        ktrhs = ktrhs;
      }
    }

    lastDraw = currentMillis;
    if (!paused) requestAnimationFrame(draw);
  }
</script>

<div class="ktrhs-animation" bind:this={container}>
  <canvas
    bind:this={canvasElem}
    style={`width: ${containerSize?.[0]}px; height: ${containerSize?.[1]}px;`}
  />
  <div style="display: none">
    <img
      bind:this={ktrhImg}
      on:load={() => !vertical && draw()}
      alt="rain drop"
      src="/assets/ktrh.webp"
    />
    <img
      bind:this={ktrhImgVertical}
      on:load={() => vertical && draw()}
      alt="rain drop"
      src="/assets/ktrh-vertical.webp"
    />
  </div>
</div>

<style>
  .ktrhs-animation {
    height: 100%;
  }

  canvas {
    position: absolute;
  }
</style>
