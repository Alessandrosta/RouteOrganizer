<script lang="ts">
  import type { TrackPoint } from '../routes/types';
  import { indexAtDistance, sample } from '../routes/stats';

  interface Props {
    points: TrackPoint[];
    splits: number[];
    onadd: (index: number) => void;
  }

  let { points, splits, onadd }: Props = $props();

  const W = 1000;
  const H = 150;
  const TOP = 22;

  const total = $derived(points.at(-1)?.dist ?? 1);
  const range = $derived.by(() => {
    let min = Infinity;
    let max = -Infinity;
    for (const p of points) {
      min = Math.min(min, p.ele);
      max = Math.max(max, p.ele);
    }
    return { min, max };
  });

  const x = (dist: number) => (dist / total) * W;
  const y = (ele: number) => TOP + (1 - (ele - range.min) / (range.max - range.min || 1)) * (H - TOP);

  const line = $derived(
    sample(points, 600)
      .map((p, i) => `${i ? 'L' : 'M'}${x(p.dist).toFixed(1)},${y(p.ele).toFixed(1)}`)
      .join(' '),
  );
  const markers = $derived(splits.map((s, n) => ({ n: n + 1, pct: (x(points[s]?.dist ?? 0) / W) * 100 })));

  function pick(event: MouseEvent) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    onadd(indexAtDistance(points, frac * total));
  }
</script>

<div class="card profile">
  <div class="head">
    <span class="card-title">Elevation profile</span>
    <span>{Math.round(range.min)}–{Math.round(range.max)} m · {(total / 1000).toFixed(0)} km →</span>
  </div>
  <button class="plot" onclick={pick} aria-label="Elevation profile. Click to add a split point.">
    <svg viewBox="0 0 {W} {H}" preserveAspectRatio="none" aria-hidden="true">
      <path d="{line} L{W},{H} L0,{H} Z" fill="var(--profile-fill)" />
      <path d={line} fill="none" stroke="var(--accent)" stroke-width="2.5" vector-effect="non-scaling-stroke" />
      {#each markers as m (m.n)}
        <line x1={(m.pct / 100) * W} y1={TOP - 4} x2={(m.pct / 100) * W} y2={H} stroke="var(--text-highlight)" stroke-width="1.5" stroke-dasharray="4 4" vector-effect="non-scaling-stroke" />
      {/each}
    </svg>
    <!-- Labels live outside the stretched SVG so the text isn't distorted. -->
    {#each markers as m (m.n)}
      <span class="pin" style:left="{m.pct}%">{m.n}</span>
    {/each}
  </button>
</div>

<style>
  .profile {
    padding: 16px 18px 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .head {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--text-muted);
  }
  .plot {
    position: relative;
    display: block;
    width: 100%;
    padding: 0;
    border: none;
    background: none;
    cursor: crosshair;
  }
  svg {
    display: block;
    width: 100%;
    height: 150px;
  }
  .pin {
    position: absolute;
    top: 0;
    transform: translateX(-50%);
    min-width: 20px;
    height: 20px;
    padding: 0 4px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    background: var(--bg);
    border: 1.5px solid var(--text-highlight);
    color: var(--text-highlight);
    font-size: 11px;
    font-weight: 700;
  }
</style>
