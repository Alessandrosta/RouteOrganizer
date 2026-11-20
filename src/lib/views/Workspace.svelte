<script lang="ts">
  import type { RouteEntry, RouteVersion, Track } from '../routes/types';
  import { formatStats, nearestIndex, segmentStats } from '../routes/stats';
  import {
    addSplit,
    defaultStageName,
    descriptionPath,
    moveSplit,
    parsePlan,
    planPath,
    removeSplit,
    serializePlan,
    type VersionPlan,
  } from '../routes/plan';
  import { readContent, savesToFiles, writeContent, writeContentSoon } from '../content/store';
  import { mapLayerNames, type MapLayer } from '../map/layers';
  import VersionTabs from '../components/VersionTabs.svelte';
  import LayerPicker from '../components/LayerPicker.svelte';
  import DetailMap from '../components/DetailMap.svelte';
  import SplitPoints from '../components/SplitPoints.svelte';
  import ElevationProfile from '../components/ElevationProfile.svelte';
  import StageRow from '../components/StageRow.svelte';
  import MarkdownPanel from '../components/MarkdownPanel.svelte';

  interface Props {
    route: RouteEntry;
    versions: RouteVersion[];
    tracks: Record<string, Track>;
    versionId: string;
    onselect: (id: string) => void;
    onadd: (file: File) => void;
    /** Scrolling up past the top goes back to the landing page. */
    onscrollpast: () => void;
  }

  let { route, versions, tracks, versionId, onselect, onadd, onscrollpast }: Props = $props();

  let layer = $state<MapLayer>('CyclOSM');
  let plans = $state<Record<string, VersionPlan>>({});
  let descriptions = $state<Record<string, string>>({});
  let saveError = $state('');
  /** Last serialized plan per version, so loading doesn't trigger a save. */
  const savedPlans: Record<string, string> = {};

  const version = $derived(versions.find((v) => v.id === versionId));
  const track = $derived(tracks[versionId]);
  const points = $derived(track?.points ?? []);
  const last = $derived(points.length - 1);
  const plan = $derived(plans[versionId]);
  const splits = $derived((plan?.splits ?? []).filter((s) => s > 0 && s < last));
  /** Only versions from the routes/ folder are saved; uploaded ones live for this session. */
  const persisted = (id: string) => route.versions.some((v) => v.id === id);

  // Load the plan and description of the selected version once.
  $effect(() => {
    const id = versionId;
    if (!id || plans[id]) return;
    if (!persisted(id)) {
      plans[id] = parsePlan(null);
      descriptions[id] = '';
      return;
    }
    plans[id] = parsePlan(null);
    Promise.all([readContent(planPath(route.id, id)), readContent(descriptionPath(route.id, id))])
      .then(([planJson, description]) => {
        const loaded = parsePlan(planJson);
        savedPlans[id] = serializePlan(loaded);
        plans[id] = loaded;
        descriptions[id] = description ?? '';
      })
      .catch((e: Error) => (saveError = e.message));
  });

  // Save plan changes (debounced).
  $effect(() => {
    const id = versionId;
    const p = plans[id];
    if (!p || !persisted(id) || savedPlans[id] === undefined) return;
    const json = serializePlan($state.snapshot(p));
    if (json === savedPlans[id]) return;
    savedPlans[id] = json;
    writeContentSoon(planPath(route.id, id), json, 400, (e) => (saveError = e.message));
  });

  const stages = $derived.by(() => {
    if (!points.length) return [];
    const bounds = [0, ...splits, last];
    return bounds.slice(0, -1).map((start, i) => {
      const end = bounds[i + 1];
      const meta = plan?.stages[start];
      return {
        start,
        number: i + 1,
        defaultName: defaultStageName(i),
        name: meta?.name ?? '',
        notes: meta?.notes ?? '',
        dashed: i % 2 === 1,
        range: `km ${(points[start].dist / 1000).toFixed(1)} → ${(points[end].dist / 1000).toFixed(1)}`,
        stats: formatStats(segmentStats(points, start, end)),
      };
    });
  });

  const onAddIndex = (index: number) => plan && addSplit(plan, index, last);
  const onMove = (from: number, to: number) => plan && moveSplit(plan, from, to, last);
  const onRemove = (index: number) => plan && removeSplit(plan, index);

  function onStageChange(start: number, name: string, notes: string) {
    if (plan) plan.stages[start] = { name, notes };
  }

  async function saveDescription(value: string) {
    const id = versionId;
    descriptions[id] = value;
    if (!persisted(id)) return;
    try {
      await writeContent(descriptionPath(route.id, id), value);
      saveError = '';
    } catch (e) {
      saveError = (e as Error).message;
    }
  }

  function wheel(e: WheelEvent) {
    if (e.deltaY >= 0) return;
    if ((e.currentTarget as HTMLElement).scrollTop <= 0) onscrollpast();
  }
</script>

<div class="scroller" onwheel={wheel}>
  <header class="bar">
    <a class="back" href="#/">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M8 13 V3 M4 7 L8 3 L12 7" />
      </svg>
      Overview
    </a>
    <h1>{route.name}</h1>
    <span class="sub">{route.start} → {route.finish}</span>
  </header>

  <main>
    {#if saveError}<p class="error" role="alert">{saveError}</p>{/if}

    <section class="map-section" aria-label="Route map">
      <div class="map-head">
        <VersionTabs {versions} selectedId={versionId} {onselect} {onadd} />
        <LayerPicker layers={mapLayerNames} selected={layer} onselect={(l) => (layer = l)} />
      </div>
      <DetailMap {track} {splits} {layer} onadd={onAddIndex} onmove={onMove} />
    </section>

    {#if points.length}
      <SplitPoints
        {points}
        {splits}
        onadd={(lat, lon) => onAddIndex(nearestIndex(points, lat, lon))}
        onremove={onRemove}
      />
      <ElevationProfile {points} {splits} onadd={onAddIndex} />
    {/if}

    <section aria-labelledby="stages-title" class="stages-section">
      <h2 id="stages-title">Stages</h2>
      <ol class="stages">
        {#each stages as stage (stage.start)}
          <StageRow
            number={stage.number}
            name={stage.name}
            defaultName={stage.defaultName}
            notes={stage.notes}
            range={stage.range}
            dashed={stage.dashed}
            stats={stage.stats}
            onchange={(name, notes) => onStageChange(stage.start, name, notes)}
          />
        {/each}
      </ol>
    </section>

    <section aria-labelledby="description-title" class="description">
      <h2 id="description-title">
        Route description{#if versions.length > 1}<span> · {version?.label}</span>{/if}
      </h2>
      {#if descriptions[versionId] !== undefined}
        {#key versionId}
          <MarkdownPanel
            value={descriptions[versionId]}
            label="route description"
            placeholder="No description yet. Use the pen to describe this route version: character, highlights, difficulty, best season, logistics…"
            onsave={saveDescription}
          />
        {/key}
      {/if}
      <p class="saved">
        {#if !persisted(versionId)}
          Uploaded versions are kept only until you reload the page.
        {:else if savesToFiles}
          Stages and description are saved to content/routes/{route.id}/{versionId}/.
        {:else}
          Stages and description are saved in this browser.
        {/if}
      </p>
    </section>
  </main>
</div>

<style>
  .scroller {
    position: absolute;
    inset: 0;
    overflow-y: auto;
    background: var(--bg);
  }
  .bar {
    position: sticky;
    top: 0;
    z-index: 1100;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 18px;
    padding: 12px 44px;
    background: var(--bg);
    border-bottom: 1px solid var(--border);
  }
  .back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 40px;
    padding: 0 14px;
    border: 1px solid var(--border);
    border-radius: 999px;
    color: var(--text);
    text-decoration: none;
    font-size: 14px;
  }
  .back:hover {
    color: var(--text-highlight);
    border-color: var(--text-muted);
  }
  h1 {
    margin: 0;
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 700;
    color: var(--green-title);
  }
  .sub {
    font-size: 14px;
    color: var(--text-muted);
  }
  main {
    max-width: 1280px;
    margin: 0 auto;
    padding: 28px 44px 72px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .map-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .map-head {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px 16px;
  }
  .map-head > :global(.tabbar) {
    flex: 1 1 320px;
  }
  h2 {
    margin: 0;
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 600;
    color: var(--text-heading);
  }
  h2 span {
    font-weight: 500;
    color: var(--text-muted);
  }
  .stages-section,
  .description {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 16px;
  }
  .stages {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .description {
    padding-top: 28px;
    border-top: 1px solid var(--border-subtle);
  }
  .saved {
    margin: 0;
    font-size: 12px;
    color: var(--text-muted);
  }
  .error {
    margin: 0;
    color: var(--text-highlight);
  }
  @media (max-width: 760px) {
    .bar {
      padding: 10px 16px;
    }
    main {
      padding: 20px 16px 56px;
    }
  }
</style>
