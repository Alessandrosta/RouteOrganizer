<script lang="ts">
  import { onMount } from 'svelte';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import type { Track } from '../routes/types';
  import { nearestIndex } from '../routes/stats';
  import { mapLayers, routeColors, type MapLayer } from '../map/layers';

  interface Props {
    track: Track | undefined;
    splitIndex: number;
    layer: MapLayer;
    onsplit: (index: number) => void;
  }

  let { track, splitIndex, layer, onsplit }: Props = $props();

  let container: HTMLDivElement;
  let map = $state<L.Map>();
  const overlay = L.layerGroup();

  onMount(() => {
    const m = L.map(container, {
      zoomControl: false,
      scrollWheelZoom: false,
      zoomSnap: 0.25,
      zoomDelta: 1,
      center: [56.5, -4],
      zoom: 7,
    });
    m.attributionControl.setPrefix(false);
    overlay.addTo(m);
    m.on('click', (e: L.LeafletMouseEvent) => {
      if (track) onsplit(nearestIndex(track.points, e.latlng.lat, e.latlng.lng));
    });
    map = m;
    return () => m.remove();
  });

  // Base map tiles.
  $effect(() => {
    if (!map) return;
    const { url, options } = mapLayers[layer];
    const tiles = L.tileLayer(url, options).addTo(map);
    return () => {
      tiles.remove();
    };
  });

  // Fit the view when the route itself changes (not when the split moves).
  $effect(() => {
    if (!map || !track) return;
    map.fitBounds(L.latLngBounds(track.points.map((p) => [p.lat, p.lon])), { padding: [32, 32] });
  });

  // Route segments and markers.
  $effect(() => {
    if (!map || !track) return;
    const pts = track.points.map((p) => [p.lat, p.lon] as L.LatLngTuple);
    const split = pts[splitIndex];
    overlay.clearLayers();
    L.polyline(pts.slice(0, splitIndex + 1), { color: routeColors.segA, weight: 5, opacity: 0.95 }).addTo(overlay);
    L.polyline(pts.slice(splitIndex), { color: routeColors.segB, weight: 5, opacity: 0.95, dashArray: '2 9' }).addTo(overlay);
    L.circleMarker(pts[0], { radius: 7, color: routeColors.segA, weight: 3, fillColor: routeColors.ground, fillOpacity: 1 })
      .bindTooltip('Start')
      .addTo(overlay);
    L.circleMarker(pts[pts.length - 1], { radius: 7, color: routeColors.segB, fillColor: routeColors.segB, fillOpacity: 1 })
      .bindTooltip('Finish')
      .addTo(overlay);
    L.circleMarker(split, { radius: 10, color: routeColors.split, weight: 3, fillColor: routeColors.ground, fillOpacity: 1 })
      .bindTooltip('Split point', { permanent: true, direction: 'top', offset: [0, -10], className: 'split-tip' })
      .addTo(overlay);
  });
</script>

<div class="detail">
  <div class="map" bind:this={container} role="application" aria-label="Detailed route map. Click the route to set the split point."></div>
  <div class="zoom">
    <button aria-label="Zoom in" onclick={() => map?.zoomIn()}>+</button>
    <button aria-label="Zoom out" onclick={() => map?.zoomOut()}>−</button>
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
  .map {
    height: 560px;
    background: var(--bg-map-detail);
  }
  .zoom {
    position: absolute;
    top: 14px;
    right: 14px;
    z-index: 1000;
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
  .zoom button:hover {
    border-color: var(--accent);
  }
  .layer-badge {
    position: absolute;
    left: 14px;
    bottom: 14px;
    z-index: 1000;
    padding: 6px 10px;
    border-radius: 6px;
    background: var(--bg);
    border: 1px solid var(--border-subtle);
    font-size: 12px;
    color: var(--text-muted);
    pointer-events: none;
  }
  .detail :global(.leaflet-container) {
    font-family: var(--font-body);
  }
  .detail :global(.leaflet-control-attribution) {
    background: rgba(20, 26, 22, 0.8);
    color: var(--text-muted);
  }
  .detail :global(.leaflet-control-attribution a) {
    color: var(--text);
  }
  .detail :global(.split-tip) {
    background: var(--bg);
    border: 1px solid var(--text-highlight);
    color: var(--text-highlight);
    font-weight: 600;
    box-shadow: none;
  }
  .detail :global(.split-tip::before) {
    border-top-color: var(--text-highlight);
  }
  @media (max-width: 760px) {
    .map {
      height: 420px;
    }
  }
</style>
