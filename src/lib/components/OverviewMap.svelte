<script lang="ts">
  import type { RouteVersion } from '../data';

  interface Props {
    versions: RouteVersion[];
    selectedId: string;
    onselect: (id: string) => void;
  }

  let { versions, selectedId, onselect }: Props = $props();

  let current = $derived(versions.find((v) => v.id === selectedId) ?? versions[0]);
  let ghosts = $derived(versions.filter((v) => v.id !== current.id));
</script>

<div class="mapwrap">
  <div class="tabbar" role="tablist" aria-label="Route versions">
    {#each versions as v (v.id)}
      {@const on = v.id === current.id}
      <button class="vtab" class:on role="tab" aria-selected={on} onclick={() => onselect(v.id)}>
        <span class="swatch"></span>
        <span>{v.label}</span>
        <span class="note">{v.note}</span>
      </button>
    {/each}
    <button class="vtab add" aria-label="Add route version">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <path d="M9 3 V15 M3 9 H15" />
      </svg>
    </button>
  </div>

  <a class="maplink" href="#detail-map" aria-label="Open the detailed route map">
    <svg viewBox="0 0 1000 540" role="img" aria-label="Simplified map with country borders and the selected route version">
      <g fill="none" stroke="var(--map-border-line)" stroke-width="1.2" stroke-linecap="round">
        <path d="M30,110 C140,92 220,146 300,124 S460,84 520,134 S640,196 700,164 S860,112 970,140" />
        <path d="M300,124 C312,196 278,258 320,328 S298,448 340,530" />
        <path d="M520,134 C542,214 500,276 560,336 S602,436 580,530" />
        <path d="M700,164 C688,236 742,298 720,376 S762,476 800,530" />
        <path d="M30,376 C120,356 200,398 320,328" />
        <path d="M560,336 C622,326 662,358 720,376 S880,356 970,396" />
        <path d="M120,20 C130,60 110,90 140,104" />
        <path d="M840,20 C830,70 870,100 860,128" />
      </g>
      {#each ghosts as g (g.id)}
        <path d={g.full} fill="none" stroke="var(--ghost)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="6 6" />
      {/each}
      <path d={current.full} fill="none" stroke="var(--accent)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="110" cy="300" r="9" fill="var(--bg)" stroke="var(--accent)" stroke-width="3" />
      <circle cx="920" cy="250" r="9" fill="var(--accent)" />
      <text x="110" y="336" text-anchor="middle" fill="var(--text-muted)" font-size="15" font-family="Inter, sans-serif">[Start]</text>
      <text x="920" y="226" text-anchor="middle" fill="var(--text-muted)" font-size="15" font-family="Inter, sans-serif">[Finish]</text>
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
