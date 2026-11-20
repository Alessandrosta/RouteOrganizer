<script lang="ts">
  import type { RouteVersion } from '../routes/types';

  interface Props {
    versions: RouteVersion[];
    selectedId: string;
    loading: boolean;
    onselect: (id: string) => void;
    onadd: (file: File) => void;
  }

  let { versions, selectedId, loading, onselect, onadd }: Props = $props();

  let fileInput: HTMLInputElement;

  function pick(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (file) onadd(file);
    input.value = '';
  }
</script>

<div class="hero">
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

  <!-- The route itself is drawn by the page backdrop; this area is the window onto it. -->
  <a class="window" href="#detail-map" aria-label="Open the detailed route map">
    {#if loading}<span class="loading">Loading route…</span>{/if}
    <span class="hint">
      Click the map for the detailed view
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M8 3 V13 M4 9 L8 13 L12 9" />
      </svg>
    </span>
  </a>
</div>

<style>
  .hero {
    display: flex;
    flex-direction: column;
  }
  .tabbar {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 4px;
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
    background: var(--bg-glass);
    color: var(--text-heading);
    border-color: var(--border);
    border-bottom-color: transparent;
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
  .window {
    position: relative;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    height: max(360px, calc(100vh - 290px));
    padding-bottom: 8px;
    text-decoration: none;
    border-radius: 0 0 16px 16px;
    transition: box-shadow 0.2s;
  }
  .window:hover,
  .window:focus-visible {
    box-shadow: inset 0 0 0 1px var(--accent);
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
    padding: 6px 12px;
    border-radius: 999px;
    background: var(--bg-glass);
    font-size: 13px;
    color: var(--text-muted);
  }
</style>
