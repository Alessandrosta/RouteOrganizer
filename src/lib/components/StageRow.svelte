<script lang="ts">
  import type { Stat } from '../data';
  import MarkdownPanel from './MarkdownPanel.svelte';

  interface Props {
    number: number;
    name: string;
    defaultName: string;
    notes: string;
    range: string;
    dashed: boolean;
    stats: Stat[];
    onchange: (name: string, notes: string) => void;
  }

  let { number, name, defaultName, notes, range, dashed, stats, onchange }: Props = $props();
</script>

<li class="stage">
  <div class="top">
    <span class="num" aria-hidden="true">{number}</span>
    <div class="title">
      <input
        class="name"
        value={name}
        placeholder={defaultName}
        aria-label="Name of stage {number}"
        oninput={(e) => onchange(e.currentTarget.value, notes)}
      />
      <span class="range">
        <span class="swatch" class:dashed aria-hidden="true"></span>
        {range}
      </span>
    </div>
    <dl class="stats">
      {#each stats as stat (stat.label)}
        <div>
          <dt class="eyebrow">{stat.label}</dt>
          <dd class="stat-value">{stat.value}</dd>
        </div>
      {/each}
    </dl>
  </div>
  <div class="notes">
    <MarkdownPanel
      compact
      value={notes}
      label="notes for stage {number}"
      placeholder="No notes yet — resupply, camp spots, things to watch out for."
      onsave={(v) => onchange(name, v)}
    />
  </div>
</li>

<style>
  .stage {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 18px 20px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--bg-card);
  }
  .top {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px 18px;
  }
  .num {
    flex: none;
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    border: 2px solid var(--text-heading);
    color: var(--text-heading);
    font-size: 14px;
    font-weight: 700;
  }
  .title {
    flex: 1 1 220px;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .name {
    min-width: 0;
    min-height: 40px;
    margin-left: -8px;
    padding: 0 8px;
    border: 1px solid transparent;
    border-radius: 8px;
    background: transparent;
    font-family: var(--font-display);
    font-size: 19px;
    font-weight: 600;
    color: var(--text-heading);
  }
  .name::placeholder {
    color: var(--text-heading);
  }
  .name:hover {
    border-color: var(--border-subtle);
  }
  .name:focus {
    outline: none;
    border-color: var(--text-muted);
    background: var(--bg);
  }
  .range {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--text-muted);
  }
  .swatch {
    width: 24px;
    height: 4px;
    border-radius: 2px;
    background: var(--text-heading);
  }
  .swatch.dashed {
    background: repeating-linear-gradient(90deg, var(--accent-alt) 0 7px, transparent 7px 11px);
  }
  .stats {
    flex: 3 1 480px;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(84px, 1fr));
    gap: 10px 16px;
  }
  .stats div {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  dd {
    margin: 0;
    font-size: 18px;
  }
  .notes {
    padding-top: 12px;
    border-top: 1px solid var(--border-subtle);
  }
</style>
