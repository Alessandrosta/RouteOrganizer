<script lang="ts">
  interface Props {
    lat: number;
    lon: number;
    onsplit: (lat: number, lon: number) => void;
  }

  let { lat, lon, onsplit }: Props = $props();

  let latText = $state('');
  let lonText = $state('');
  let error = $state('');

  // Show the current split point whenever it moves (map click, profile click, version change).
  $effect(() => {
    latText = lat.toFixed(5);
    lonText = lon.toFixed(5);
    error = '';
  });

  function submit(event: SubmitEvent) {
    event.preventDefault();
    const la = Number(latText);
    const lo = Number(lonText);
    if (!latText || !lonText || !Number.isFinite(la) || !Number.isFinite(lo) || Math.abs(la) > 90 || Math.abs(lo) > 180) {
      error = 'Enter a valid latitude and longitude.';
      return;
    }
    onsplit(la, lo);
  }
</script>

<form class="card split" onsubmit={submit}>
  <div class="intro">
    <span class="card-title">Split the route</span>
    <span class="hint">Click the map or the elevation profile, or enter a coordinate. The split snaps to the nearest point on the route.</span>
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
  <button type="submit">Split route</button>
</form>

<style>
  .split {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 12px;
    padding: 18px;
  }
  .intro {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1 1 200px;
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
  button {
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
</style>
