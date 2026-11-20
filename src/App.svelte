<script lang="ts">
  import { findPage, type Stat } from './lib/data';
  import { routes, routeVersions, versionFromFile } from './lib/routes/catalog';
  import { segmentStats } from './lib/routes/stats';
  import type { RouteVersion, Track } from './lib/routes/types';
  import Landing from './lib/views/Landing.svelte';
  import Workspace from './lib/views/Workspace.svelte';

  const route = routes[0];
  const initialVersions = routeVersions(route);
  const firstVersionId = initialVersions[0]?.id ?? '';

  let versions = $state<RouteVersion[]>(initialVersions);
  let tracks = $state<Record<string, Track>>({});
  let versionId = $state(firstVersionId);
  let loadError = $state('');

  // ---- Hash routing: #/ landing, #/map map workspace, #/page/<section>/<slug> markdown page
  let hash = $state(location.hash);
  $effect(() => {
    const update = () => (hash = location.hash);
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  });

  const onMap = $derived(hash === '#/map');
  const openPage = $derived.by(() => {
    const m = hash.match(/^#\/page\/([^/]+)\/([^/]+)$/);
    return m ? findPage(m[1], m[2]) : null;
  });

  // Scrolling past the edge of a page switches pages; ignore wheel events while sliding.
  let lockedUntil = 0;
  function go(target: string) {
    const now = Date.now();
    if (now < lockedUntil) return;
    lockedUntil = now + 900;
    location.hash = target;
  }

  // ---- Route data
  $effect(() => {
    for (const v of versions) {
      if (tracks[v.id]) continue;
      v.load()
        .then((t) => (tracks[v.id] = t))
        .catch((e: Error) => (loadError = e.message));
    }
  });

  const landingTrack = $derived(tracks[firstVersionId]);
  const landingStats = $derived.by<Stat[]>(() => {
    if (!landingTrack) return [];
    const s = segmentStats(landingTrack.points);
    return [
      { label: 'Distance', value: `${s.distanceKm.toFixed(0)} km` },
      { label: 'Climbing', value: `${Math.round(s.climbM).toLocaleString('en-GB')} m` },
    ];
  });

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

<div class="pages">
  <div class="page landing" class:away={onMap} inert={onMap} aria-hidden={onMap}>
    <Landing {route} track={landingTrack} stats={landingStats} {openPage} onscrollpast={() => go('#/map')} />
  </div>
  <div class="page workspace" class:away={!onMap} inert={!onMap} aria-hidden={!onMap}>
    <Workspace
      {route}
      {versions}
      {tracks}
      {versionId}
      onselect={(id) => (versionId = id)}
      onadd={addVersion}
      onscrollpast={() => go('#/')}
    />
  </div>
  {#if loadError}<p class="toast" role="alert">{loadError}</p>{/if}
</div>

<style>
  .pages {
    position: fixed;
    inset: 0;
    overflow: hidden;
  }
  .page {
    position: absolute;
    inset: 0;
    transition:
      transform 0.8s cubic-bezier(0.65, 0, 0.35, 1),
      opacity 0.8s ease;
  }
  /* Landing slides up and fades out; the workspace rises from below. */
  .landing.away {
    transform: translateY(-100%);
    opacity: 0.2;
  }
  .workspace {
    background: var(--bg);
  }
  .workspace.away {
    transform: translateY(100%);
  }
  @media (prefers-reduced-motion: reduce) {
    .page {
      transition: none;
    }
  }
  .toast {
    position: absolute;
    left: 50%;
    bottom: 20px;
    transform: translateX(-50%);
    z-index: 2000;
    margin: 0;
    padding: 10px 16px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--bg-card);
    color: var(--text-highlight);
  }
</style>
