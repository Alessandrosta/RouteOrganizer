<script lang="ts">
  import { navSections, type Stat } from './lib/data';
  import { routes, routeVersions, versionFromFile } from './lib/routes/catalog';
  import { formatStats, indexAtDistance, nearestIndex, segmentStats } from './lib/routes/stats';
  import type { RouteVersion, Track } from './lib/routes/types';
  import { mapLayerNames, type MapLayer } from './lib/map/layers';
  import Sidebar from './lib/components/Sidebar.svelte';
  import TripHeader from './lib/components/TripHeader.svelte';
  import OverviewMap from './lib/components/OverviewMap.svelte';
  import LayerPicker from './lib/components/LayerPicker.svelte';
  import DetailMap from './lib/components/DetailMap.svelte';
  import SplitForm from './lib/components/SplitForm.svelte';
  import ElevationProfile from './lib/components/ElevationProfile.svelte';
  import SegmentCard from './lib/components/SegmentCard.svelte';

  const route = routes[0];

  let versions = $state<RouteVersion[]>(routeVersions(route));
  let tracks = $state<Record<string, Track>>({});
  let versionId = $state(routeVersions(route)[0]?.id ?? '');
  let layer = $state<MapLayer>('CyclOSM');
  let splitIndex = $state(0);
  let loadError = $state('');

  // Load every version so the overview can show the others as ghosts.
  $effect(() => {
    for (const v of versions) {
      if (tracks[v.id]) continue;
      v.load()
        .then((t) => (tracks[v.id] = t))
        .catch((e: Error) => (loadError = e.message));
    }
  });

  const version = $derived(versions.find((v) => v.id === versionId));
  const track = $derived(tracks[versionId]);
  const points = $derived(track?.points ?? []);

  // Default split: halfway along the selected version.
  $effect(() => {
    const pts = tracks[versionId]?.points;
    if (pts) splitIndex = indexAtDistance(pts, (pts.at(-1)?.dist ?? 0) / 2);
  });

  const placeholder: Stat[] = formatStats(segmentStats([])).map((s) => ({ ...s, value: '—' }));
  const whole = $derived(points.length ? segmentStats(points) : null);
  const tripStats = $derived<Stat[]>([
    { label: 'Distance', value: whole ? `${whole.distanceKm.toFixed(0)} km` : '—' },
    { label: 'Climbing', value: whole ? `${Math.round(whole.climbM).toLocaleString('en-GB')} m` : '—' },
    { label: 'Stages', value: '[—]' },
  ]);
  const segments = $derived([
    {
      name: 'Segment A',
      range: `${route.start} → split point`,
      color: 'var(--accent)',
      stats: points.length ? formatStats(segmentStats(points, 0, splitIndex)) : placeholder,
    },
    {
      name: 'Segment B',
      range: `Split point → ${route.finish}`,
      color: 'var(--accent-alt)',
      stats: points.length ? formatStats(segmentStats(points, splitIndex)) : placeholder,
    },
  ]);

  async function addVersion(file: File) {
    try {
      const v = await versionFromFile(file, versions.length + 1);
      versions.push(v);
      versionId = v.id;
      loadError = '';
    } catch (e) {
      loadError = (e as Error).message;
    }
  }
</script>

<div class="shell">
  <Sidebar sections={navSections} footer="Route data: {route.id}/{route.versions[0]?.file ?? '—'}" />

  <main>
    <section class="overview">
      <TripHeader name={route.name} subtitle="{route.start} → {route.finish} · [Dates]" stats={tripStats} />
      {#if loadError}<p class="error" role="alert">{loadError}</p>{/if}
      <OverviewMap
        {versions}
        {tracks}
        selectedId={versionId}
        startLabel={route.start}
        finishLabel={route.finish}
        onselect={(id) => (versionId = id)}
        onadd={addVersion}
      />
    </section>

    <section id="detail-map" class="detail">
      <div class="detail-head">
        <h2>Route map <span>· {version?.label}</span></h2>
        <LayerPicker layers={mapLayerNames} selected={layer} onselect={(l) => (layer = l)} />
      </div>

      <DetailMap {track} {splitIndex} {layer} onsplit={(i) => (splitIndex = i)} />

      {#if points.length}
        <SplitForm
          lat={points[splitIndex].lat}
          lon={points[splitIndex].lon}
          onsplit={(lat, lon) => (splitIndex = nearestIndex(points, lat, lon))}
        />
        <ElevationProfile {points} {splitIndex} onsplit={(i) => (splitIndex = i)} />
      {/if}

      <div class="segments">
        {#each segments as seg (seg.name)}
          <SegmentCard {...seg} />
        {/each}
      </div>
    </section>
  </main>
</div>

<style>
  .shell {
    min-height: 100vh;
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
  }
  main {
    flex: 999 1 560px;
    min-width: 0;
    padding: 36px 44px 72px;
    display: flex;
    flex-direction: column;
    gap: 56px;
  }
  .overview {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .detail {
    display: flex;
    flex-direction: column;
    gap: 20px;
    scroll-margin-top: 24px;
  }
  .detail-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  h2 {
    margin: 0;
    font-family: var(--font-display);
    font-size: 28px;
    font-weight: 600;
    color: var(--text-heading);
  }
  h2 span {
    font-weight: 500;
    color: var(--text-muted);
  }
  .error {
    margin: 0;
    color: var(--text-highlight);
  }
  .segments {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }
  @media (max-width: 760px) {
    main {
      padding: 28px 16px 56px;
    }
  }
</style>
