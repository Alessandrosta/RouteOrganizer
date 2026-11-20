<script lang="ts">
  import { navSections, type NavItem, type NavSection, type Stat } from '../data';
  import type { RouteEntry, Track } from '../routes/types';
  import Sidebar from '../components/Sidebar.svelte';
  import TripHeader from '../components/TripHeader.svelte';
  import RouteBackdrop from '../components/RouteBackdrop.svelte';
  import ContentPage from '../components/ContentPage.svelte';

  interface Props {
    route: RouteEntry;
    /** Track drawn on the globe: the route's first version. */
    track: Track | undefined;
    stats: Stat[];
    openPage: { section: NavSection; page: NavItem } | null;
    /** Scrolling past the bottom of the landing page moves on to the map. */
    onscrollpast: () => void;
  }

  let { route, track, stats, openPage, onscrollpast }: Props = $props();

  function wheel(e: WheelEvent) {
    if (openPage || e.deltaY <= 0) return;
    const el = e.currentTarget as HTMLElement;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) onscrollpast();
  }
</script>

<RouteBackdrop {track} startLabel={route.start} finishLabel={route.finish} />

<div class="scroller" onwheel={wheel}>
  <div class="shell">
    <Sidebar
      sections={navSections}
      active={openPage ? { section: openPage.section.id, slug: openPage.page.slug } : null}
    />
    <main>
      <TripHeader name={route.name} subtitle="{route.start} → {route.finish} · [Dates]" {stats} />
      {#if openPage}
        <ContentPage section={openPage.section} page={openPage.page} />
      {:else}
        <a class="window" href="#/map" aria-label="Go to the route map">
          {#if !track}<span class="loading">Loading route…</span>{/if}
          <span class="hint">
            Scroll down to plan the route
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M8 3 V13 M4 9 L8 13 L12 9" />
            </svg>
          </span>
        </a>
      {/if}
    </main>
  </div>
</div>

<style>
  .scroller {
    position: absolute;
    inset: 0;
    overflow-y: auto;
  }
  .shell {
    position: relative;
    min-height: 100%;
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
  }
  main {
    flex: 999 1 560px;
    min-width: 0;
    padding: 36px 44px 32px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }
  .window {
    position: relative;
    flex: 1;
    min-height: 360px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 8px;
    text-decoration: none;
    border-radius: 16px;
  }
  .loading {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    color: var(--text-muted);
  }
  .hint {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--bg-glass);
    font-size: 13px;
    color: var(--text);
    animation: nudge 2.4s ease-in-out infinite;
  }
  .window:hover .hint {
    color: var(--text-highlight);
    border-color: var(--text-muted);
  }
  @keyframes nudge {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(4px); }
  }
  @media (prefers-reduced-motion: reduce) {
    .hint {
      animation: none;
    }
  }
  @media (max-width: 760px) {
    /* On phones: title and route sketch first, dropdowns below. */
    main {
      order: -1;
      min-height: 100svh;
      padding: 28px 16px 24px;
    }
  }
</style>
