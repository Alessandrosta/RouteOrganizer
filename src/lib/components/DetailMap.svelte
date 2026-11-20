<script lang="ts">
  import type { MapLayer, RouteVersion } from '../data';

  interface Props {
    route: RouteVersion;
    layer: MapLayer;
  }

  let { route, layer }: Props = $props();
</script>

<div class="detail">
  <svg viewBox="0 0 1000 480" role="img" aria-label="Detailed map placeholder showing the route split into two segments">
    <g fill="none" stroke="var(--map-contour)" stroke-width="1">
      <path d="M0,80 C160,40 320,120 480,70 S800,30 1000,90" />
      <path d="M0,140 C180,100 300,180 500,130 S820,90 1000,160" />
      <path d="M0,370 C200,330 340,410 520,360 S820,320 1000,380" />
      <path d="M0,430 C220,400 360,470 540,420 S840,390 1000,440" />
      <path d="M380,200 C420,170 470,180 490,210 S470,270 420,260 S350,230 380,200" />
      <path d="M650,320 C700,290 760,300 770,340 S730,390 680,380 S620,350 650,320" />
    </g>
    <path d={route.segA} fill="none" stroke="var(--accent)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
    <path d={route.segB} fill="none" stroke="var(--accent-alt)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 9" />
    <circle cx="110" cy="300" r="8" fill="var(--bg-map-detail)" stroke="var(--accent)" stroke-width="3" />
    <circle cx="920" cy="250" r="8" fill="var(--accent-alt)" />
    <circle cx={route.sx} cy={route.sy} r="11" fill="var(--bg-map-detail)" stroke="var(--text-highlight)" stroke-width="3" />
    <circle cx={route.sx} cy={route.sy} r="4" fill="var(--text-highlight)" />
    <text x={route.sx} y={route.sy - 26} text-anchor="middle" fill="var(--text-highlight)" font-size="15" font-weight="600" font-family="Inter, sans-serif">Split point</text>
    <text x={route.ax} y={route.ay} text-anchor="middle" fill="var(--text)" font-size="14" font-family="Inter, sans-serif">Segment A</text>
    <text x={route.bx} y={route.by} text-anchor="middle" fill="var(--accent-alt)" font-size="14" font-family="Inter, sans-serif">Segment B</text>
  </svg>
  <div class="zoom">
    <button aria-label="Zoom in">+</button>
    <button aria-label="Zoom out">−</button>
  </div>
  <div class="layer-badge">Live map: {layer} tiles</div>
</div>

<style>
  .detail {
    position: relative;
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    background: var(--bg-map-detail);
  }
  svg {
    display: block;
    width: 100%;
    height: auto;
  }
  .zoom {
    position: absolute;
    top: 14px;
    right: 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .zoom button {
    width: 44px;
    height: 44px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--bg-card);
    color: var(--text);
    font-size: 20px;
    cursor: pointer;
  }
  .layer-badge {
    position: absolute;
    left: 14px;
    bottom: 14px;
    padding: 6px 10px;
    border-radius: 6px;
    background: var(--bg);
    border: 1px solid var(--border-subtle);
    font-size: 12px;
    color: var(--text-muted);
  }
</style>
