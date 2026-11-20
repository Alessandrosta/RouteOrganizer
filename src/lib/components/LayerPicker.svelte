<script lang="ts">
  import type { MapLayer } from '../map/layers';

  interface Props {
    layers: readonly MapLayer[];
    selected: MapLayer;
    onselect: (layer: MapLayer) => void;
  }

  let { layers, selected, onselect }: Props = $props();
</script>

<div class="group" role="group" aria-label="Base map">
  {#each layers as layer (layer)}
    <button class="pill" class:on={layer === selected} aria-pressed={layer === selected} onclick={() => onselect(layer)}>
      {layer}
    </button>
  {/each}
</div>

<style>
  .group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .pill {
    min-height: 44px;
    padding: 0 16px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text);
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
  }
  .pill:hover {
    border-color: var(--accent);
  }
  .pill.on {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--bg);
  }
</style>
