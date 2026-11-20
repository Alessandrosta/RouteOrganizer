<script lang="ts">
  import type { TrackPoint } from '../routes/types';
  import { indexAtDistance, sample } from '../routes/stats';

  interface Props {
    points: TrackPoint[];
    splitIndex: number;
    onsplit: (index: number) => void;
  }

  let { points, splitIndex, onsplit }: Props = $props();

  const W = 1000;
  const H = 150;
  const TOP = 10;

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
  const splitX = $derived(x(points[splitIndex]?.dist ?? 0));

  function pick(event: MouseEvent) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    onsplit(indexAtDistance(points, frac * total));
  }
</script>

<div class="card profile">
  <div class="head">
    <span class="card-title">Elevation profile</span>
    <span>{Math.round(range.min)}–{Math.round(range.max)} m · {(total / 1000).toFixed(0)} km →</span>
  </div>
  <button class="plot" onclick={pick} aria-label="Elevation profile. Click to move the split point.">
    <svg viewBox="0 0 {W} {H}" preserveAspectRatio="none" aria-hidden="true">
      <path d="{line} L{W},{H} L0,{H} Z" fill="var(--profile-fill)" />
      <path d={line} fill="none" stroke="var(--accent)" stroke-width="2.5" vector-effect="non-scaling-stroke" />
      <line x1={splitX} y1="0" x2={splitX} y2={H} stroke="var(--text-highlight)" stroke-width="1.5" stroke-dasharray="4 4" vector-effect="non-scaling-stroke" />
    </svg>
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
</style>
