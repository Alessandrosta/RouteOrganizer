<script lang="ts">
  import { navSections, type Stat } from './lib/data';
  import { routes, routeVersions, versionFromFile } from './lib/routes/catalog';
  import { formatStats, indexAtDistance, nearestIndex, segmentStats } from './lib/routes/stats';
  import {
    addSplit,
    defaultSegmentName,
    loadPlan,
    moveSplit,
    removeSplit,
    savePlan,
    type VersionPlan,
  } from './lib/routes/plan';
  import type { RouteVersion, Track } from './lib/routes/types';
  import { mapLayerNames, type MapLayer } from './lib/map/layers';
  import Sidebar from './lib/components/Sidebar.svelte';
  import TripHeader from './lib/components/TripHeader.svelte';
  import RouteBackdrop from './lib/components/RouteBackdrop.svelte';
  import RouteHero from './lib/components/RouteHero.svelte';
  import LayerPicker from './lib/components/LayerPicker.svelte';
  import DetailMap from './lib/components/DetailMap.svelte';
  import SplitPoints from './lib/components/SplitPoints.svelte';
  import ElevationProfile from './lib/components/ElevationProfile.svelte';
  import SegmentCard from './lib/components/SegmentCard.svelte';
  import DescriptionBox from './lib/components/DescriptionBox.svelte';

  const route = routes[0];
  const initialVersions = routeVersions(route);

  let versions = $state<RouteVersion[]>(initialVersions);
  let tracks = $state<Record<string, Track>>({});
  let plans = $state<Record<string, VersionPlan>>({});
  let versionId = $state(initialVersions[0]?.id ?? '');
  let layer = $state<MapLayer>('CyclOSM');
  let loadError = $state('');

  // Load every version so the backdrop can show the others as ghosts.
  $effect(() => {
    for (const v of versions) {
      if (tracks[v.id]) continue;
      v.load()
        .then((t) => (tracks[v.id] = t))
        .catch((e: Error) => (loadError = e.message));
    }
  });

  // Each version keeps its own split points, segment names/notes and description.
  $effect(() => {
    if (versionId && !plans[versionId]) plans[versionId] = loadPlan(route.id, versionId);
  });
  $effect(() => {
    const plan = plans[versionId];
    if (plan) savePlan(route.id, versionId, $state.snapshot(plan));
  });

  const version = $derived(versions.find((v) => v.id === versionId));
  const track = $derived(tracks[versionId]);
  const points = $derived(track?.points ?? []);
  const last = $derived(points.length - 1);
  const plan = $derived(plans[versionId]);
  const splits = $derived((plan?.splits ?? []).filter((s) => s > 0 && s < last));

  const loadedTracks = $derived(versions.flatMap((v) => (tracks[v.id] ? [{ id: v.id, track: tracks[v.id] }] : [])));

  const whole = $derived(points.length ? segmentStats(points) : null);
  const segments = $derived.by(() => {
    if (!points.length) return [];
    const bounds = [0, ...splits, last];
    return bounds.slice(0, -1).map((start, i) => {
      const end = bounds[i + 1];
      const meta = plan?.segments[start];
      return {
        start,
        defaultName: defaultSegmentName(i),
        name: meta?.name ?? '',
        notes: meta?.notes ?? '',
        dotted: i % 2 === 1,
        range: `km ${(points[start].dist / 1000).toFixed(1)} → ${(points[end].dist / 1000).toFixed(1)}`,
        stats: formatStats(segmentStats(points, start, end)),
      };
    });
  });

  const tripStats = $derived<Stat[]>([
    { label: 'Distance', value: whole ? `${whole.distanceKm.toFixed(0)} km` : '—' },
    { label: 'Climbing', value: whole ? `${Math.round(whole.climbM).toLocaleString('en-GB')} m` : '—' },
    { label: 'Segments', value: segments.length ? String(segments.length) : '—' },
  ]);

  const onAddIndex = (index: number) => plan && addSplit(plan, index, last);
  const onMove = (from: number, to: number) => plan && moveSplit(plan, from, to, last);
  const onRemove = (index: number) => plan && removeSplit(plan, index);

  function onSegmentChange(start: number, name: string, notes: string) {
    if (plan) plan.segments[start] = { name, notes };
  }

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

<RouteBackdrop tracks={loadedTracks} selectedId={versionId} startLabel={route.start} finishLabel={route.finish} />

<div class="shell">
  <Sidebar sections={navSections} footer="Route data: {route.id}/{route.versions[0]?.file ?? '—'}" />

  <main>
    <section class="overview">
      <TripHeader name={route.name} subtitle="{route.start} → {route.finish} · [Dates]" stats={tripStats} />
      {#if loadError}<p class="error" role="alert">{loadError}</p>{/if}
      <RouteHero
        {versions}
        selectedId={versionId}
        loading={!track}
        onselect={(id) => (versionId = id)}
        onadd={addVersion}
      />
    </section>

    <section id="detail-map" class="detail">
      <div class="detail-head">
        <h2>Route map <span>· {version?.label}</span></h2>
        <LayerPicker layers={mapLayerNames} selected={layer} onselect={(l) => (layer = l)} />
      </div>

      <DetailMap {track} {splits} {layer} onadd={onAddIndex} onmove={onMove} />

      {#if points.length}
        <SplitPoints
          {points}
          {splits}
          onadd={(lat, lon) => onAddIndex(nearestIndex(points, lat, lon))}
          onremove={onRemove}
        />
        <ElevationProfile {points} {splits} onadd={onAddIndex} />
      {/if}

      <div class="segments">
        {#each segments as seg (seg.start)}
          <SegmentCard
            name={seg.name}
            defaultName={seg.defaultName}
            notes={seg.notes}
            range={seg.range}
            dotted={seg.dotted}
            stats={seg.stats}
            onchange={(name, notes) => onSegmentChange(seg.start, name, notes)}
          />
        {/each}
      </div>
    </section>

    {#if plan}
      <DescriptionBox
        versionLabel={version?.label ?? ''}
        multipleVersions={versions.length > 1}
        value={plan.description}
        onchange={(v) => (plan.description = v)}
      />
    {/if}
  </main>
</div>

<style>
  .shell {
    position: relative;
    z-index: 1;
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
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
  }
  @media (max-width: 760px) {
    main {
      padding: 28px 16px 56px;
    }
  }
</style>
