<script lang="ts">
  import { onMount } from 'svelte';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import type { Track } from '../routes/types';
  import { nearestIndex } from '../routes/stats';
  import { mapLayers, routeColors, type MapLayer } from '../map/layers';

  interface Props {
    track: Track | undefined;
    splits: number[];
    layer: MapLayer;
    onadd: (index: number) => void;
    onmove: (from: number, to: number) => void;
  }

  let { track, splits, layer, onadd, onmove }: Props = $props();

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
      if (track) onadd(nearestIndex(track.points, e.latlng.lat, e.latlng.lng));
    });
    map = m;
    return () => {
      // Stop any running zoom/pan animation first, or Leaflet errors after removal.
      m.stop();
      m.off();
      m.remove();
    };
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

  // Fit the view when the route itself changes (not when splits move).
  $effect(() => {
    if (!map || !track) return;
    map.fitBounds(L.latLngBounds(track.points.map((p) => [p.lat, p.lon])), { padding: [32, 32], animate: false });
  });

  // Stages alternate dark solid / lighter dashed so neighbours are easy to tell apart.
  $effect(() => {
    if (!map || !track) return;
    const pts = track.points.map((p) => [p.lat, p.lon] as L.LatLngTuple);
    const bounds = [0, ...splits, pts.length - 1];
    overlay.clearLayers();

    bounds.slice(0, -1).forEach((start, i) => {
      const line = pts.slice(start, bounds[i + 1] + 1);
      const even = i % 2 === 0;
      L.polyline(line, { color: routeColors.casing, weight: 9, opacity: 0.9, interactive: false }).addTo(overlay);
      L.polyline(line, {
        color: even ? routeColors.stageA : routeColors.stageB,
        weight: 5,
        dashArray: even ? undefined : '8 6',
      }).addTo(overlay);
    });

    L.circleMarker(pts[0], { radius: 7, color: routeColors.stageA, weight: 3, fillColor: routeColors.casing, fillOpacity: 1 })
      .bindTooltip('Start')
      .addTo(overlay);
    L.circleMarker(pts[pts.length - 1], { radius: 7, color: routeColors.casing, weight: 2, fillColor: routeColors.stageA, fillOpacity: 1 })
      .bindTooltip('Finish')
      .addTo(overlay);

    splits.forEach((index, n) => {
      const marker = L.marker(pts[index], {
        draggable: true,
        keyboard: true,
        title: `Split point ${n + 1} — drag to move`,
        icon: L.divIcon({ className: 'split-pin', html: `<span>${n + 1}</span>`, iconSize: [28, 28] }),
      }).addTo(overlay);
      marker.on('dragend', () => {
        const ll = marker.getLatLng();
        onmove(index, nearestIndex(track!.points, ll.lat, ll.lng));
      });
    });
  });
</script>

<div class="detail">
  <div class="map" bind:this={container} role="application" aria-label="Detailed route map. Click the route to add a split point between stages; drag a numbered point to move it."></div>
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
    border-color: var(--text-muted);
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
    background: rgba(18, 18, 18, 0.8);
    color: var(--text-muted);
  }
  .detail :global(.leaflet-control-attribution a) {
    color: var(--text);
  }
  .detail :global(.split-pin) {
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #1f1f1f;
    border: 3px solid #ffffff;
    color: #ffffff;
    font-size: 13px;
    font-weight: 700;
    cursor: grab;
  }
  @media (max-width: 760px) {
    .map {
      height: 420px;
    }
  }
</style>
