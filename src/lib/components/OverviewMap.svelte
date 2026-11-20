<script lang="ts">
  import { geoMercator, geoPath } from 'd3-geo';
  import { mesh } from 'topojson-client';
  import type { Topology, GeometryCollection } from 'topojson-specification';
  import type { RouteVersion, Track } from '../routes/types';
  import { sample } from '../routes/stats';

  interface Props {
    versions: RouteVersion[];
    tracks: Record<string, Track | undefined>;
    selectedId: string;
    startLabel: string;
    finishLabel: string;
    onselect: (id: string) => void;
    onadd: (file: File) => void;
  }

  let { versions, tracks, selectedId, startLabel, finishLabel, onselect, onadd }: Props = $props();

  const W = 1000;
  const H = 540;
  const PAD = 48;

  // Country borders + coastlines from Natural Earth (1:50m), loaded once as a lazy chunk.
  let borders = $state<GeoJSON.MultiLineString | null>(null);
  import('world-atlas/countries-50m.json').then((m) => {
    const topo = m.default as unknown as Topology<{ countries: GeometryCollection }>;
    borders = mesh(topo, topo.objects.countries);
  });

  let fileInput: HTMLInputElement;

  const lines = $derived(
    versions.flatMap((v) => {
      const t = tracks[v.id];
      if (!t) return [];
      const coords = sample(t.points, 800).map((p) => [p.lon, p.lat]);
      return [{ id: v.id, geo: { type: 'LineString', coordinates: coords } as GeoJSON.LineString }];
    }),
  );

  const projection = $derived.by(() => {
    const all: GeoJSON.MultiLineString = { type: 'MultiLineString', coordinates: lines.map((l) => l.geo.coordinates) };
    const p = geoMercator().clipExtent([[0, 0], [W, H]]);
    return lines.length ? p.fitExtent([[PAD, PAD], [W - PAD, H - PAD]], all) : p;
  });
  const path = $derived(geoPath(projection));
  const bordersPath = $derived(borders && lines.length ? path(borders) : null);

  const current = $derived(lines.find((l) => l.id === selectedId));
  const ghosts = $derived(lines.filter((l) => l.id !== selectedId));
  const ends = $derived.by(() => {
    if (!current) return null;
    const c = current.geo.coordinates;
    const [sx, sy] = projection(c[0] as [number, number]) ?? [0, 0];
    const [fx, fy] = projection(c[c.length - 1] as [number, number]) ?? [0, 0];
    return { sx, sy, fx, fy };
  });

  function pick(event: Event) {
    const file = (event.currentTarget as HTMLInputElement).files?.[0];
    if (file) onadd(file);
    (event.currentTarget as HTMLInputElement).value = '';
  }
</script>

<div class="mapwrap">
  <div class="tabbar" role="tablist" aria-label="Route versions">
    {#each versions as v (v.id)}
      {@const on = v.id === selectedId}
      <button class="vtab" class:on role="tab" aria-selected={on} onclick={() => onselect(v.id)}>
        <span class="swatch"></span>
        <span>{v.label}</span>
        <span class="note">{v.note}</span>
      </button>
    {/each}
    <button class="vtab add" aria-label="Add route version from a GPX or TCX file" onclick={() => fileInput.click()}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <path d="M9 3 V15 M3 9 H15" />
      </svg>
    </button>
    <input bind:this={fileInput} type="file" accept=".gpx,.tcx" hidden onchange={pick} />
  </div>

  <a class="maplink" href="#detail-map" aria-label="Open the detailed route map">
    <svg viewBox="0 0 {W} {H}" role="img" aria-label="Simplified map with country borders and the selected route version">
      {#if bordersPath}
        <path d={bordersPath} fill="none" stroke="var(--map-border-line)" stroke-width="1.2" stroke-linejoin="round" />
      {/if}
      {#each ghosts as g (g.id)}
        <path d={path(g.geo)} fill="none" stroke="var(--ghost)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="6 6" />
      {/each}
      {#if current && ends}
        <path d={path(current.geo)} fill="none" stroke="var(--accent)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx={ends.sx} cy={ends.sy} r="9" fill="var(--bg)" stroke="var(--accent)" stroke-width="3" />
        <circle cx={ends.fx} cy={ends.fy} r="9" fill="var(--accent)" />
        <text x={ends.sx + 18} y={ends.sy + 5} fill="var(--text-muted)" font-size="15" font-family="Inter, sans-serif">{startLabel}</text>
        <text x={ends.fx + 18} y={ends.fy + 5} fill="var(--text-muted)" font-size="15" font-family="Inter, sans-serif">{finishLabel}</text>
      {:else}
        <text x={W / 2} y={H / 2} text-anchor="middle" fill="var(--text-muted)" font-size="16" font-family="Inter, sans-serif">Loading route…</text>
      {/if}
    </svg>
    <div class="hint">
      <span>Click the map for the detailed view</span>
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M8 3 V13 M4 9 L8 13 L12 9" />
      </svg>
    </div>
  </a>
</div>

<style>
  .mapwrap {
    border: 1px solid var(--border);
    border-radius: 16px;
    background: var(--bg-map);
    overflow: hidden;
    transition: border-color 0.2s;
  }
  .mapwrap:hover {
    border-color: var(--accent);
  }
  .tabbar {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 4px;
    padding: 10px 12px 0;
    background: var(--bg-tabbar);
    border-bottom: 1px solid var(--border);
  }
  .vtab {
    min-height: 44px;
    margin-bottom: -1px;
    padding: 0 18px;
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid transparent;
    border-radius: 10px 10px 0 0;
    background: transparent;
    color: var(--text-muted);
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
  }
  .vtab:hover {
    color: var(--text-highlight);
  }
  .vtab.on {
    background: var(--bg-map);
    color: var(--text-heading);
    border-color: var(--border);
    border-bottom-color: var(--bg-map);
  }
  .swatch {
    width: 18px;
    height: 4px;
    border-radius: 2px;
    background: var(--ghost);
  }
  .vtab.on .swatch {
    background: var(--accent);
  }
  .note {
    font-family: var(--font-body);
    font-size: 12px;
    font-weight: 400;
    color: var(--text-muted);
  }
  .vtab.add {
    width: 44px;
    height: 44px;
    margin-left: 4px;
    padding: 0;
    justify-content: center;
    border: none;
  }
  .maplink {
    display: block;
    text-decoration: none;
    padding: 12px;
  }
  .maplink svg[role='img'] {
    display: block;
    width: 100%;
    height: auto;
  }
  .hint {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    padding: 6px 0 4px;
    font-size: 13px;
    color: var(--text-muted);
  }
</style>
