<script lang="ts">
  import type { Stat } from '../data';

  interface Props {
    stat: Stat;
    /** Font size of the value in px. */
    size?: number;
  }

  let { stat, size = 20 }: Props = $props();
</script>

<div class="stat">
  <span class="eyebrow">{stat.label}</span>
  <span class="stat-value" style:font-size="{size}px">{stat.value}</span>
</div>

<style>
  .stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
</style>
