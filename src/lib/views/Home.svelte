<script lang="ts">
  import type { RouteEntry, Track } from '../routes/types';
  import { segmentStats } from '../routes/stats';
  import RouteBackdrop from '../components/RouteBackdrop.svelte';

  interface Props {
    routes: RouteEntry[];
    /** First-version track of each route, by route id. */
    tracks: Record<string, Track | undefined>;
    index: number;
    onindex: (index: number) => void;
    /** Open the route's map page (scroll / swipe down). */
    onopen: () => void;
  }

  let { routes, tracks, index, onindex, onopen }: Props = $props();

  const count = $derived(routes.length);
  const prev = () => index > 0 && onindex(index - 1);
  const next = () => index < count - 1 && onindex(index + 1);

  function info(route: RouteEntry) {
    const t = tracks[route.id];
    const s = t ? segmentStats(t.points) : null;
    return [
      { label: 'Distance', value: s ? `${s.distanceKm.toFixed(0)} km` : '—' },
      { label: 'Climbing', value: s ? `${Math.round(s.climbM).toLocaleString('en-GB')} m` : '—' },
      { label: 'Highest point', value: s ? `${Math.round(s.maxEleM).toLocaleString('en-GB')} m` : '—' },
      { label: 'Versions', value: String(route.versions.length) },
    ];
  }

  // Trackpad / mouse wheel: sideways changes route, downwards opens the map page.
  let wheelLock = 0;
  function wheel(e: WheelEvent) {
    const now = Date.now();
    if (now < wheelLock) return;
    const sideways = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    if (sideways && Math.abs(e.deltaX) > 25) {
      wheelLock = now + 700;
      if (e.deltaX > 0) next();
      else prev();
    } else if (!sideways && e.deltaY > 25) {
      wheelLock = now + 900;
      onopen();
    }
  }

  // Touch swipes: left/right changes route, up opens the map page.
  let start: { x: number; y: number } | null = null;
  function pointerdown(e: PointerEvent) {
    if (e.pointerType !== 'mouse') start = { x: e.clientX, y: e.clientY };
  }
  function pointerup(e: PointerEvent) {
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    start = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next();
      else prev();
    } else if (dy < -60) {
      onopen();
    }
  }
</script>

<div
  class="home"
  onwheel={wheel}
  onpointerdown={pointerdown}
  onpointerup={pointerup}
  onpointercancel={() => (start = null)}
  role="region"
  aria-roledescription="carousel"
  aria-label="Routes"
>
  <div class="track" style:transform="translateX(-{index * 100}%)">
    {#each routes as route, i (route.id)}
      <section
        class="slide"
        aria-roledescription="slide"
        aria-label="{route.name} ({i + 1} of {count})"
        inert={i !== index}
      >
        <!-- Only the current slide and its neighbours draw their globe. -->
        {#if Math.abs(i - index) <= 1}
          <RouteBackdrop track={tracks[route.id]} startLabel={route.start} finishLabel={route.finish} />
        {/if}
        <div class="info">
          <h2>{route.name}</h2>
          <p class="sub">{route.start} → {route.finish}</p>
          <dl class="stats">
            {#each info(route) as stat (stat.label)}
              <div>
                <dt class="eyebrow">{stat.label}</dt>
                <dd class="stat-value">{stat.value}</dd>
              </div>
            {/each}
          </dl>
          {#if !tracks[route.id]}<p class="sub">Loading route…</p>{/if}
        </div>
      </section>
    {/each}
  </div>

  <header class="brand">
    <h1>BincioPacking</h1>
    <p>Bikepacking routes</p>
  </header>

  {#if count > 1}
    <button class="arrow left" aria-label="Previous route" disabled={index === 0} onclick={prev}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4 L7 11 L14 18" /></svg>
    </button>
    <button class="arrow right" aria-label="Next route" disabled={index === count - 1} onclick={next}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 4 L15 11 L8 18" /></svg>
    </button>
  {/if}

  <footer class="foot">
    {#if count > 1}
      <div class="dots">
        {#each routes as route, i (route.id)}
          <button
            class="dot"
            class:on={i === index}
            aria-label="Show {route.name}"
            aria-current={i === index ? 'true' : undefined}
            onclick={() => onindex(i)}
          ></button>
        {/each}
      </div>
    {/if}
    <button class="open" onclick={onopen}>
      Scroll down to plan the route
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M8 3 V13 M4 9 L8 13 L12 9" />
      </svg>
    </button>
  </footer>
</div>

<style>
  .home {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background: var(--bg-space);
    touch-action: pan-y pinch-zoom;
  }
  .track {
    position: absolute;
    inset: 0;
    display: flex;
    transition: transform 0.6s cubic-bezier(0.65, 0, 0.35, 1);
  }
  .slide {
    position: relative;
    flex: 0 0 100%;
    height: 100%;
    overflow: hidden;
  }

  .brand {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 36px 96px 0;
    pointer-events: none;
  }
  h1 {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(44px, 7vw, 96px);
    font-weight: 700;
    line-height: 0.95;
    letter-spacing: -0.02em;
    color: var(--text-heading);
  }
  .brand p {
    margin: 10px 0 0;
    font-size: 13px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .info {
    position: absolute;
    left: 96px;
    top: clamp(230px, 34vh, 340px);
    width: min(400px, calc(100% - 192px));
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  h2 {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(32px, 4vw, 48px);
    font-weight: 700;
    line-height: 1.05;
    color: var(--green-title);
  }
  .sub {
    margin: 0;
    font-size: 16px;
    color: var(--text-muted);
  }
  .stats {
    margin: 14px 0 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  .stats div {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 10px 14px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--bg-glass);
  }
  dd {
    margin: 0;
    font-size: 22px;
  }

  .arrow {
    position: absolute;
    top: 50%;
    z-index: 2;
    width: 52px;
    height: 52px;
    margin-top: -26px;
    display: grid;
    place-items: center;
    border: 1px solid var(--border);
    border-radius: 50%;
    background: var(--bg-glass);
    color: var(--text-heading);
    cursor: pointer;
  }
  .arrow:hover:not(:disabled) {
    border-color: var(--text-muted);
    color: var(--text-highlight);
  }
  .arrow:disabled {
    opacity: 0.3;
    cursor: default;
  }
  .arrow.left {
    left: 16px;
  }
  .arrow.right {
    right: 16px;
  }

  .foot {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
  }
  .dots {
    display: flex;
    gap: 4px;
  }
  .dot {
    width: 28px;
    height: 28px;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    position: relative;
  }
  .dot::after {
    content: '';
    position: absolute;
    inset: 10px;
    border-radius: 50%;
    background: var(--border);
  }
  .dot.on::after {
    inset: 9px;
    background: var(--text-heading);
  }
  .open {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 40px;
    padding: 0 16px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--bg-glass);
    color: var(--text);
    font-size: 13px;
    cursor: pointer;
    animation: nudge 2.4s ease-in-out infinite;
  }
  .open:hover {
    color: var(--text-highlight);
    border-color: var(--text-muted);
  }
  @keyframes nudge {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(4px); }
  }
  @media (prefers-reduced-motion: reduce) {
    .track {
      transition: none;
    }
    .open {
      animation: none;
    }
  }

  @media (max-width: 760px) {
    .brand {
      padding: 24px 20px 0;
    }
    .info {
      left: 20px;
      top: 140px;
      width: calc(100% - 40px);
      gap: 6px;
    }
    .stats {
      gap: 6px;
      margin-top: 8px;
    }
    .stats div {
      padding: 8px;
    }
    dd {
      font-size: 16px;
    }
    .arrow {
      top: auto;
      bottom: 22px;
      margin-top: 0;
      width: 44px;
      height: 44px;
    }
    .foot {
      bottom: 26px;
    }
  }
</style>
