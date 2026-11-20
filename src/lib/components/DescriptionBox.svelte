<script lang="ts">
  interface Props {
    versionLabel: string;
    multipleVersions: boolean;
    value: string;
    onchange: (value: string) => void;
  }

  let { versionLabel, multipleVersions, value, onchange }: Props = $props();
</script>

<section class="card description" aria-labelledby="description-title">
  <div class="head">
    <h2 id="description-title">Route description</h2>
    {#if multipleVersions}<span class="version">{versionLabel}</span>{/if}
  </div>
  <textarea
    {value}
    aria-labelledby="description-title"
    rows="6"
    placeholder="Overall description of this route version: character, highlights, difficulty, best season, logistics…"
    oninput={(e) => onchange(e.currentTarget.value)}
  ></textarea>
  <span class="saved">Saved automatically in this browser{multipleVersions ? ', separately for each version' : ''}.</span>
</section>

<style>
  .description {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .head {
    display: flex;
    align-items: baseline;
    gap: 10px;
  }
  h2 {
    margin: 0;
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 600;
    color: var(--text-heading);
  }
  .version {
    font-size: 14px;
    color: var(--text-muted);
  }
  textarea {
    min-height: 160px;
    field-sizing: content;
    resize: vertical;
    padding: 14px 16px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--text);
    font-size: 15px;
    line-height: 1.6;
  }
  textarea::placeholder {
    color: var(--text-muted);
    opacity: 0.7;
  }
  .saved {
    font-size: 12px;
    color: var(--text-muted);
  }
</style>
