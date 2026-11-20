<script lang="ts">
  import { tick } from 'svelte';
  import { parseTrackFile } from '../routes/parse';
  import { segmentStats } from '../routes/stats';
  import { canCreateRoutes, createRoute } from '../routes/create';

  interface Props {
    open: boolean;
    onclose: () => void;
    /** Called with the new route's id once its folder exists. */
    oncreated: (id: string) => void;
  }

  let { open, onclose, oncreated }: Props = $props();

  let dialog: HTMLDialogElement;
  let fileInput = $state<HTMLInputElement>();
  let nameInput = $state<HTMLInputElement>();

  let file = $state<File | null>(null);
  let summary = $state('');
  let name = $state('');
  let start = $state('');
  let finish = $state('');
  let error = $state('');
  let dragging = $state(false);
  let busy = $state(false);

  $effect(() => {
    if (open && !dialog.open) {
      reset();
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  });

  function reset() {
    file = null;
    summary = name = start = finish = error = '';
    busy = dragging = false;
  }

  /** Track names in files are often abbreviated or hyphenated; tidy them as a suggestion. */
  const suggestName = (raw: string) =>
    raw
      .replace(/\.(gpx|tcx)$/i, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  async function take(f: File | undefined | null) {
    if (!f) return;
    error = '';
    if (!/\.(gpx|tcx)$/i.test(f.name)) {
      error = 'Please choose a .gpx or .tcx file.';
      return;
    }
    try {
      const track = parseTrackFile(f.name, await f.text());
      const s = segmentStats(track.points);
      file = f;
      summary = `${track.points.length.toLocaleString('en-GB')} points · ${s.distanceKm.toFixed(0)} km · ${Math.round(s.climbM).toLocaleString('en-GB')} m climbing`;
      name = suggestName(track.name || f.name);
      await tick();
      nameInput?.select();
    } catch (e) {
      error = (e as Error).message;
    }
  }

  function drop(e: DragEvent) {
    e.preventDefault();
    dragging = false;
    take(e.dataTransfer?.files[0]);
  }

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    if (!file || !name.trim()) return;
    busy = true;
    error = '';
    try {
      oncreated(await createRoute({ name: name.trim(), start: start.trim(), finish: finish.trim(), file }));
    } catch (err) {
      error = (err as Error).message;
      busy = false;
    }
  }
</script>

<dialog bind:this={dialog} onclose={onclose} aria-labelledby="add-route-title">
  <form method="dialog" class="x">
    <button aria-label="Close">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 4 L12 12 M12 4 L4 12" /></svg>
    </button>
  </form>

  <h2 id="add-route-title">Add a route</h2>

  {#if !canCreateRoutes}
    <p class="note">Adding routes saves files into the project, so it only works while running <code>npm run dev</code>.</p>
  {/if}

  {#if !file}
    <button
      class="drop"
      class:dragging
      onclick={() => fileInput?.click()}
      ondragover={(e) => {
        e.preventDefault();
        dragging = true;
      }}
      ondragleave={() => (dragging = false)}
      ondrop={drop}
    >
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M17 22 V6 M10 13 L17 6 L24 13 M6 22 V27 H28 V22" />
      </svg>
      <span class="big">Drop a GPX or TCX file here</span>
      <span class="small">or click to choose one</span>
    </button>
    <input bind:this={fileInput} type="file" accept=".gpx,.tcx" hidden onchange={(e) => take(e.currentTarget.files?.[0])} />
  {:else}
    <form class="details" onsubmit={submit}>
      <div class="file">
        <div>
          <div class="fname">{file.name}</div>
          <div class="small">{summary}</div>
        </div>
        <button type="button" class="link" onclick={reset}>Change file</button>
      </div>

      <label>
        <span class="eyebrow">Route name</span>
        <input bind:this={nameInput} bind:value={name} required maxlength="120" />
      </label>
      <div class="row">
        <label>
          <span class="eyebrow">Start <span class="opt">(optional)</span></span>
          <input bind:value={start} placeholder="e.g. Inverness" maxlength="120" />
        </label>
        <label>
          <span class="eyebrow">Finish <span class="opt">(optional)</span></span>
          <input bind:value={finish} placeholder="e.g. Glasgow" maxlength="120" />
        </label>
      </div>

      <div class="actions">
        <button type="button" class="secondary" onclick={onclose}>Cancel</button>
        <button type="submit" class="primary" disabled={busy || !name.trim() || !canCreateRoutes}>
          {busy ? 'Creating…' : 'Create route'}
        </button>
      </div>
    </form>
  {/if}

  {#if error}<p class="error" role="alert">{error}</p>{/if}
</dialog>

<style>
  dialog {
    width: min(560px, calc(100vw - 32px));
    padding: 28px;
    border: 1px solid var(--border);
    border-radius: 16px;
    background: var(--bg-card);
    color: var(--text);
  }
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.6);
  }
  .x {
    position: absolute;
    top: 14px;
    right: 14px;
  }
  .x button {
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
  }
  .x button:hover {
    color: var(--text-highlight);
  }
  h2 {
    margin: 0 0 18px;
    font-family: var(--font-display);
    font-size: 26px;
    font-weight: 700;
    color: var(--text-heading);
  }
  .note {
    margin: 0 0 16px;
    font-size: 14px;
    color: var(--text-muted);
  }
  .drop {
    width: 100%;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 2px dashed var(--border);
    border-radius: 12px;
    background: var(--bg);
    color: var(--text-muted);
    cursor: pointer;
  }
  .drop:hover,
  .drop.dragging {
    border-color: var(--text-muted);
    color: var(--text-highlight);
  }
  .drop.dragging {
    background: var(--hover-bg);
  }
  .big {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-heading);
  }
  .small {
    font-size: 13px;
    color: var(--text-muted);
  }
  .details {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .file {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--bg);
  }
  .fname {
    font-weight: 600;
    color: var(--text-heading);
    overflow-wrap: anywhere;
  }
  .link {
    flex: none;
    min-height: 36px;
    padding: 0 10px;
    border: none;
    background: transparent;
    color: var(--text);
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
    min-width: 0;
  }
  .opt {
    text-transform: none;
    letter-spacing: 0;
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  .row label {
    flex: 1 1 180px;
  }
  input {
    min-height: 44px;
    padding: 0 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg);
    color: var(--text-heading);
    font-size: 15px;
  }
  input::placeholder {
    color: var(--text-muted);
    opacity: 0.7;
  }
  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 4px;
  }
  .actions button {
    min-height: 44px;
    padding: 0 18px;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
  }
  .primary {
    border: none;
    background: var(--accent);
    color: var(--accent-contrast);
  }
  .primary:disabled {
    opacity: 0.5;
    cursor: default;
  }
  .secondary {
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text);
  }
  .error {
    margin: 14px 0 0;
    color: var(--text-highlight);
  }
</style>
