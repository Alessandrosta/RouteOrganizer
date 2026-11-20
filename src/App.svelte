<script lang="ts">
  import { routes, routeVersions, versionFromFile } from './lib/routes/catalog';
  import type { RouteVersion, Track } from './lib/routes/types';
  import Home from './lib/views/Home.svelte';
  import Workspace from './lib/views/Workspace.svelte';

  // ---- Hash routing
  //   #/r/<route>                 home, showing that route
  //   #/r/<route>/map             the route's map page
  //   #/r/<route>/page/<item>     a side-menu page of the route
  let hash = $state(location.hash);
  $effect(() => {
    const update = () => (hash = location.hash);
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  });

  const parsed = $derived.by(() => {
    const m = hash.match(/^#\/r\/([^/]+)(?:\/(map|page\/([^/]+)))?$/);
    return {
      routeId: m?.[1],
      onRoute: !!m?.[2],
      itemId: m?.[3] ?? null,
    };
  });

  const indexOf = (id: string | undefined) => Math.max(0, routes.findIndex((r) => r.id === id));
  const index = $derived(indexOf(parsed.routeId));
  const route = $derived(routes[index]);
  const onRoute = $derived(parsed.onRoute);

  function showRoute(i: number) {
    // Carousel moves replace the history entry rather than adding one per swipe.
    history.replaceState(null, '', `#/r/${routes[i].id}`);
    hash = location.hash;
  }

  // Leaving a page by scrolling past its edge; ignore further wheel events while sliding.
  let lockedUntil = 0;
  function go(target: string) {
    const now = Date.now();
    if (now < lockedUntil) return;
    lockedUntil = now + 900;
    location.hash = target;
  }

  function keydown(e: KeyboardEvent) {
    if (onRoute || e.altKey || e.ctrlKey || e.metaKey) return;
    if ((e.target as HTMLElement).closest('input, textarea, [contenteditable]')) return;
    if (e.key === 'ArrowRight' && index < routes.length - 1) showRoute(index + 1);
    else if (e.key === 'ArrowLeft' && index > 0) showRoute(index - 1);
    else if (e.key === 'ArrowDown' || e.key === 'PageDown') go(`#/r/${route.id}/map`);
    else return;
    e.preventDefault();
  }

  // ---- Route data: versions per route (plus any uploaded this session), tracks by "<route>/<version>"
  let versions = $state<Record<string, RouteVersion[]>>(Object.fromEntries(routes.map((r) => [r.id, routeVersions(r)])));
  let selectedVersion = $state<Record<string, string>>({});
  let tracks = $state<Record<string, Track>>({});
  let loadError = $state('');

  function load(routeId: string, v: RouteVersion) {
    const key = `${routeId}/${v.id}`;
    if (tracks[key] || loading.has(key)) return;
    loading.add(key);
    v.load()
      .then((t) => (tracks[key] = t))
      .catch((e: Error) => (loadError = e.message))
      .finally(() => loading.delete(key));
  }
  const loading = new Set<string>();

  // Home needs the first version of every route; the open route needs all of its versions.
  $effect(() => {
    for (const r of routes) {
      const first = versions[r.id][0];
      if (first) load(r.id, first);
    }
    if (route) for (const v of versions[route.id]) load(route.id, v);
  });

  const homeTracks = $derived(
    Object.fromEntries(routes.map((r) => [r.id, tracks[`${r.id}/${versions[r.id][0]?.id}`]])),
  );
  const routeTracks = $derived(
    route ? Object.fromEntries(versions[route.id].map((v) => [v.id, tracks[`${route.id}/${v.id}`]]).filter(([, t]) => t)) : {},
  );
  const versionId = $derived(route ? (selectedVersion[route.id] ?? versions[route.id][0]?.id ?? '') : '');

  async function addVersion(file: File) {
    const list = versions[route.id];
    try {
      const v = await versionFromFile(file, list.length + 1);
      list.push(v);
      selectedVersion[route.id] = v.id;
      loadError = '';
    } catch (e) {
      loadError = (e as Error).message;
    }
  }
</script>

<svelte:window onkeydown={keydown} />

{#if route}
  <div class="pages">
    <div class="page home" class:away={onRoute} inert={onRoute} aria-hidden={onRoute}>
      <Home {routes} tracks={homeTracks} {index} onindex={showRoute} onopen={() => go(`#/r/${route.id}/map`)} />
    </div>
    <div class="page workspace" class:away={!onRoute} inert={!onRoute} aria-hidden={!onRoute}>
      {#key route.id}
        <Workspace
          {route}
          versions={versions[route.id]}
          tracks={routeTracks}
          {versionId}
          itemId={parsed.itemId}
          onselect={(id) => (selectedVersion[route.id] = id)}
          onadd={addVersion}
          onscrollpast={() => go(`#/r/${route.id}`)}
        />
      {/key}
    </div>
    {#if loadError}<p class="toast" role="alert">{loadError}</p>{/if}
  </div>
{:else}
  <p class="none">No routes yet. Add one under <code>routes/</code> (see routes/README.md).</p>
{/if}

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
  /* Home slides up and fades out; the route page rises from below. */
  .home.away {
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
  .none {
    padding: 40px;
    color: var(--text-muted);
  }
</style>
