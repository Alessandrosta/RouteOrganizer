<script lang="ts">
  import type { Stat } from '../data';
  import StatBlock from './StatBlock.svelte';

  interface Props {
    name: string;
    subtitle: string;
    stats: Stat[];
  }

  let { name, subtitle, stats }: Props = $props();
</script>

<div class="header">
  <div class="titles">
    <div class="kicker">Bikepacking trip</div>
    <h1>{name}</h1>
    <div class="subtitle">{subtitle}</div>
  </div>
  <div class="stats">
    {#each stats as stat (stat.label)}
      <div class="stat-box">
        <StatBlock {stat} size={22} />
      </div>
    {/each}
  </div>
</div>

<style>
  .header {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
  }
  .titles {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .kicker {
    font-size: 13px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-muted);
  }
  h1 {
    margin: 0;
    font-family: var(--font-display);
    font-size: 44px;
    font-weight: 700;
    line-height: 1.05;
    color: var(--text-heading);
  }
  .subtitle {
    font-size: 15px;
    color: var(--text-muted);
  }
  .stats {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  .stat-box {
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px 16px;
    min-width: 96px;
  }
</style>
