<script lang="ts">
  import type { Stat } from '../data';
  import StatBlock from './StatBlock.svelte';

  interface Props {
    name: string;
    defaultName: string;
    notes: string;
    range: string;
    dotted: boolean;
    stats: Stat[];
    onchange: (name: string, notes: string) => void;
  }

  let { name, defaultName, notes, range, dotted, stats, onchange }: Props = $props();
</script>

<div class="card segment">
  <div class="head">
    <span class="swatch" class:dotted></span>
    <input
      class="name"
      value={name}
      placeholder={defaultName}
      aria-label="Segment name"
      oninput={(e) => onchange(e.currentTarget.value, notes)}
    />
    <span class="range">{range}</span>
  </div>
  <div class="stats">
    {#each stats as stat (stat.label)}
      <StatBlock {stat} />
    {/each}
  </div>
  <label class="notes">
    <span class="eyebrow">Notes</span>
    <textarea
      value={notes}
      rows="2"
      placeholder="Resupply, camp spots, things to watch out for…"
      oninput={(e) => onchange(name, e.currentTarget.value)}
    ></textarea>
  </label>
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
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 10px;
  }
  .swatch {
    flex: none;
    width: 28px;
    height: 5px;
    border-radius: 3px;
    background: var(--accent);
  }
  .swatch.dotted {
    background: radial-gradient(circle, var(--accent-alt) 2px, transparent 2.5px) 0 50% / 9px 5px repeat-x;
  }
  .name {
    flex: 1 1 140px;
    min-width: 0;
    min-height: 40px;
    margin-left: -8px;
    padding: 0 8px;
    border: 1px solid transparent;
    border-radius: 8px;
    background: transparent;
    font-family: var(--font-display);
    font-size: 18px;
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
    border-color: var(--accent);
    background: var(--bg);
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
  .notes {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  textarea {
    min-height: 64px;
    field-sizing: content;
    resize: vertical;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--text);
    font-size: 14px;
    line-height: 1.5;
  }
  textarea::placeholder {
    color: var(--text-muted);
    opacity: 0.7;
  }
</style>
