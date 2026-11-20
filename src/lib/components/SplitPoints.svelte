<script lang="ts">
  import type { TrackPoint } from '../routes/types';

  interface Props {
    points: TrackPoint[];
    splits: number[];
    onadd: (lat: number, lon: number) => void;
    onremove: (index: number) => void;
  }

  let { points, splits, onadd, onremove }: Props = $props();

  let latText = $state('');
  let lonText = $state('');
  let error = $state('');

  function submit(event: SubmitEvent) {
    event.preventDefault();
    const lat = Number(latText);
    const lon = Number(lonText);
    if (!latText || !lonText || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      error = 'Enter a valid latitude and longitude.';
      return;
    }
    error = '';
    onadd(lat, lon);
    latText = '';
    lonText = '';
  }
</script>

<div class="card splits">
  <form class="add" onsubmit={submit}>
    <div class="intro">
      <span class="card-title">Split points</span>
      <span class="hint">Click the map or the elevation profile to add one, drag a numbered point to move it, or enter a coordinate. Points snap to the route.</span>
      {#if error}<span class="error" role="alert">{error}</span>{/if}
    </div>
    <label class="eyebrow">
      Latitude
      <input type="text" inputmode="decimal" placeholder="56.50000" bind:value={latText} />
    </label>
    <label class="eyebrow">
      Longitude
      <input type="text" inputmode="decimal" placeholder="-4.00000" bind:value={lonText} />
    </label>
    <button type="submit" class="primary">Add split</button>
  </form>

  {#if splits.length}
    <ul class="list" aria-label="Split points">
      {#each splits as index, n (index)}
        {@const p = points[index]}
        <li class="chip">
          <span class="num">{n + 1}</span>
          <span>km {(p.dist / 1000).toFixed(1)}</span>
          <span class="coord">{p.lat.toFixed(4)}, {p.lon.toFixed(4)}</span>
          <button class="remove" aria-label="Remove split point {n + 1}" onclick={() => onremove(index)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <path d="M3 3 L11 11 M11 3 L3 11" />
            </svg>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .splits {
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .add {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 12px;
  }
  .intro {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1 1 240px;
    font-size: 14px;
  }
  .hint {
    color: var(--text-muted);
  }
  .error {
    color: var(--text-highlight);
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  input {
    width: 140px;
    min-height: 44px;
    padding: 0 12px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--text);
    font-size: 15px;
    letter-spacing: normal;
    text-transform: none;
  }
  input::placeholder {
    color: var(--text-muted);
    opacity: 0.7;
  }
  .primary {
    min-height: 44px;
    padding: 0 20px;
    border-radius: 8px;
    border: none;
    background: var(--accent);
    color: var(--bg);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
  }
  .list {
    list-style: none;
    margin: 0;
    padding: 12px 0 0;
    border-top: 1px solid var(--border-subtle);
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 4px 0 6px;
    border: 1px solid var(--border);
    border-radius: 999px;
    font-size: 14px;
  }
  .num {
    width: 22px;
    height: 22px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    border: 1.5px solid var(--text-highlight);
    color: var(--text-highlight);
    font-size: 11px;
    font-weight: 700;
  }
  .coord {
    font-size: 12px;
    color: var(--text-muted);
  }
  .remove {
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
  }
  .remove:hover {
    color: var(--text-highlight);
    background: var(--hover-bg);
  }
</style>
