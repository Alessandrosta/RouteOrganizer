<script lang="ts">
  interface Props {
    onsplit?: (lat: string, lon: string) => void;
  }

  let { onsplit }: Props = $props();

  let lat = $state('');
  let lon = $state('');

  function submit(event: SubmitEvent) {
    event.preventDefault();
    onsplit?.(lat, lon);
  }
</script>

<form class="card split" onsubmit={submit}>
  <div class="intro">
    <span class="card-title">Split the route</span>
    <span class="hint">Click the map or enter a coordinate</span>
  </div>
  <label class="eyebrow">
    Latitude
    <input type="text" inputmode="decimal" placeholder="45.0000" bind:value={lat} />
  </label>
  <label class="eyebrow">
    Longitude
    <input type="text" inputmode="decimal" placeholder="10.0000" bind:value={lon} />
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
