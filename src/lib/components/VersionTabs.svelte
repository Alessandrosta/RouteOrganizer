<script lang="ts">
  import type { RouteVersion } from '../routes/types';

  interface Props {
    versions: RouteVersion[];
    selectedId: string;
    onselect: (id: string) => void;
    onadd: (file: File) => void;
  }

  let { versions, selectedId, onselect, onadd }: Props = $props();

  let fileInput: HTMLInputElement;

  function pick(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (file) onadd(file);
    input.value = '';
  }
</script>

<div class="tabbar" role="tablist" aria-label="Route versions">
  {#each versions as v (v.id)}
    {@const on = v.id === selectedId}
    <button class="vtab" class:on role="tab" aria-selected={on} onclick={() => onselect(v.id)}>
      <span>{v.label}</span>
      <span class="note">{v.note}</span>
    </button>
  {/each}
  <button class="vtab add" aria-label="Add route version from a GPX or TCX file" title="Add version (GPX / TCX)" onclick={() => fileInput.click()}>
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
      <path d="M9 3 V15 M3 9 H15" />
    </svg>
  </button>
  <input bind:this={fileInput} type="file" accept=".gpx,.tcx" hidden onchange={pick} />
</div>

<style>
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
    background: var(--bg-card);
    color: var(--text-heading);
    border-color: var(--border);
    border-bottom-color: var(--bg-card);
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
</style>
