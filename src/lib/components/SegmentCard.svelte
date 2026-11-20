<script lang="ts">
  import type { Stat } from '../data';
  import StatBlock from './StatBlock.svelte';

  interface Props {
    name: string;
    range: string;
    color: string;
    stats: Stat[];
  }

  let { name, range, color, stats }: Props = $props();
</script>

<div class="card segment">
  <div class="head">
    <span class="swatch" style:background={color}></span>
    <span class="name">{name}</span>
    <span class="range">{range}</span>
  </div>
  <div class="stats">
    {#each stats as stat (stat.label)}
      <StatBlock {stat} />
    {/each}
  </div>
</div>

<style>
  .segment {
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .head {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .swatch {
    width: 28px;
    height: 5px;
    border-radius: 3px;
  }
  .name {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 600;
    color: var(--text-heading);
  }
  .range {
    font-size: 13px;
    color: var(--text-muted);
  }
  .stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }
</style>
