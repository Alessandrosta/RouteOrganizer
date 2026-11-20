<script lang="ts">
  import { geoGraticule, geoPath, geoProjection, type GeoRawProjection } from 'd3-geo';
  import { mesh } from 'topojson-client';
  import type { GeometryCollection, Topology } from 'topojson-specification';
  import type { Track } from '../routes/types';
  import { sample } from '../routes/stats';

  interface Props {
    /** The route drawn on the globe (the first version). */
    track: Track | undefined;
    startLabel: string;
    finishLabel: string;
  }

  let { track, startLabel, finishLabel }: Props = $props();

  let W = $state(1440);
  let H = $state(900);

  // Country borders + coastlines from Natural Earth (1:50m), loaded once as a lazy chunk.
  let borders = $state<GeoJSON.MultiLineString | null>(null);
  import('world-atlas/countries-50m.json').then((m) => {
    const topo = m.default as unknown as Topology<{ countries: GeometryCollection }>;
    borders = mesh(topo, topo.objects.countries);
  });

  /**
   * A route is tiny compared to the Earth, so a true globe would show no curvature.
   * This azimuthal projection "shrinks the planet" by factor E: a point at angular
   * distance c from the centre is drawn as if it were E·c away on an orthographic globe.
   * The result reads like the map is wrapped onto a small sphere.
   */
  function bulge(E: number): GeoRawProjection {
    return (lambda, phi) => {
      const c = Math.acos(Math.max(-1, Math.min(1, Math.cos(lambda) * Math.cos(phi))));
      const k = c < 1e-9 ? 1 : Math.sin(E * c) / (E * Math.sin(c));
      return [k * Math.cos(phi) * Math.sin(lambda), k * Math.sin(phi)];
    };
  }

  const lines = $derived(
    track
      ? [
          {
            geo: {
              type: 'LineString',
              coordinates: sample(track.points, 1000).map((p) => [p.lon, p.lat]),
            } as GeoJSON.LineString,
          },
        ]
      : [],
  );

  const view = $derived.by(() => {
    if (!lines.length) return null;
    const all: GeoJSON.MultiLineString = { type: 'MultiLineString', coordinates: lines.map((l) => l.geo.coordinates) };
    let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
    for (const l of lines)
      for (const [lon, lat] of l.geo.coordinates) {
        minLon = Math.min(minLon, lon); maxLon = Math.max(maxLon, lon);
        minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat);
      }
    const center: [number, number] = [(minLon + maxLon) / 2, (minLat + maxLat) / 2];

    // Route fills the hero area: right of the sidebar on wide screens, below the header.
    const wide = W > 760;
    const extent: [[number, number], [number, number]] = wide
      ? [[Math.min(420, W * 0.3), 170], [W - 60, H - 90]]
      : [[24, 270], [W - 24, H - 90]];
    // Globe radius on screen: large, but small enough that its edge stays in view.
    const radius = 0.62 * Math.max(W, H);

    let E = 20;
    let projection = geoProjection(bulge(E));
    for (let i = 0; i < 4; i++) {
      projection = geoProjection(bulge(E))
        .rotate([-center[0], -center[1]])
        .clipAngle(Math.min(89, 90 / E))
        .fitExtent(extent, all);
      E = Math.max(1, projection.scale() / radius);
    }
    const path = geoPath(projection);
    const graticule = geoGraticule()
      .step([0.5, 0.5])
      .extent([[center[0] - 8, center[1] - 6], [center[0] + 8, center[1] + 6]])();
    return { projection, path, graticule };
  });

  const current = $derived(lines[0]);
  const ends = $derived.by(() => {
    if (!current || !view) return null;
    const c = current.geo.coordinates;
    const [sx, sy] = view.projection(c[0] as [number, number]) ?? [0, 0];
    const [fx, fy] = view.projection(c[c.length - 1] as [number, number]) ?? [0, 0];
    return { sx, sy, fx, fy };
  });
</script>

<svelte:window bind:innerWidth={W} bind:innerHeight={H} />

<div class="backdrop" aria-hidden="true">
  <svg width={W} height={H} viewBox="0 0 {W} {H}">
    <defs>
      <radialGradient id="globe-shade" cx="42%" cy="38%" r="65%">
        <stop offset="0%" stop-color="#1e1e1e" />
        <stop offset="70%" stop-color="#151515" />
        <stop offset="100%" stop-color="#101010" />
      </radialGradient>
    </defs>
    {#if view}
      <path d={view.path({ type: 'Sphere' })} fill="url(#globe-shade)" stroke="var(--border-subtle)" stroke-width="1.5" />
      <path d={view.path(view.graticule)} fill="none" stroke="var(--sketch-grid)" stroke-width="1" />
      {#if borders}
        <path d={view.path(borders)} fill="none" stroke="var(--sketch-border)" stroke-width="1.3" stroke-linejoin="round" />
      {/if}
      {#if current && ends}
        <path d={view.path(current.geo)} fill="none" stroke="var(--green)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx={ends.sx} cy={ends.sy} r="10" fill="var(--bg)" stroke="var(--green)" stroke-width="3.5" />
        <circle cx={ends.fx} cy={ends.fy} r="10" fill="var(--green)" />
        <text x={ends.sx + 20} y={ends.sy + 6} fill="var(--text-muted)" font-size="17" font-family="Inter, sans-serif">{startLabel}</text>
        <text x={ends.fx + 20} y={ends.fy + 6} fill="var(--text-muted)" font-size="17" font-family="Inter, sans-serif">{finishLabel}</text>
      {/if}
    {/if}
  </svg>
</div>

<style>
  .backdrop {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background: var(--bg-space);
  }
  svg {
    display: block;
  }
</style>
