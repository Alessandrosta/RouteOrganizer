<script lang="ts">
  import { tick } from 'svelte';
  import { renderMarkdown } from '../content/markdown';

  interface Props {
    /** Markdown source. */
    value: string;
    /** Accessible name, e.g. "Route description". */
    label: string;
    placeholder?: string;
    /** Smaller type, for notes inside lists. */
    compact?: boolean;
    onsave: (value: string) => void;
  }

  let { value, label, placeholder = 'Nothing here yet.', compact = false, onsave }: Props = $props();

  let editing = $state(false);
  let draft = $state('');
  let textarea = $state<HTMLTextAreaElement>();

  const html = $derived(value.trim() ? renderMarkdown(value) : '');

  async function edit() {
    draft = value;
    editing = true;
    await tick();
    textarea?.focus();
  }

  function save() {
    onsave(draft);
    editing = false;
  }

  function keydown(e: KeyboardEvent) {
    if (e.key === 'Escape') editing = false;
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save();
  }
</script>

<div class="md" class:compact>
  {#if editing}
    <textarea bind:this={textarea} bind:value={draft} aria-label="{label} (markdown)" onkeydown={keydown}></textarea>
    <div class="actions">
      <span class="tip">Markdown · Ctrl+Enter to save · Esc to cancel</span>
      <button class="secondary" onclick={() => (editing = false)}>Cancel</button>
      <button class="primary" onclick={save}>Save</button>
    </div>
  {:else}
    <div class="view">
      {#if html}
        <div class="prose">{@html html}</div>
      {:else}
        <p class="empty">{placeholder}</p>
      {/if}
      <button class="pen" aria-label="Edit {label}" title="Edit" onclick={edit}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M11 2.5 L13.5 5 L5.5 13 L2.5 13.5 L3 10.5 Z M9.5 4 L12 6.5" />
        </svg>
      </button>
    </div>
  {/if}
</div>

<style>
  .md {
    position: relative;
  }
  .view {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  .prose,
  .empty {
    flex: 1;
    min-width: 0;
  }
  .empty {
    margin: 0;
    color: var(--text-muted);
    font-style: italic;
  }
  .pen {
    flex: none;
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
  .pen:hover {
    color: var(--text-highlight);
    border-color: var(--text-muted);
  }
  .compact .pen {
    width: 36px;
    height: 36px;
    border-color: transparent;
  }
  .compact .pen:hover {
    border-color: var(--border);
  }

  textarea {
    width: 100%;
    min-height: 220px;
    field-sizing: content;
    resize: vertical;
    padding: 14px 16px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--text);
    font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
    font-size: 14px;
    line-height: 1.6;
  }
  .compact textarea {
    min-height: 100px;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
  }
  .tip {
    margin-right: auto;
    font-size: 12px;
    color: var(--text-muted);
  }
  .actions button {
    min-height: 40px;
    padding: 0 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }
  .primary {
    border: none;
    background: var(--accent);
    color: var(--accent-contrast);
  }
  .secondary {
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text);
  }

  /* Rendered markdown reads as page text */
  .prose {
    font-size: 16px;
    line-height: 1.65;
    color: var(--text);
    overflow-wrap: anywhere;
  }
  .compact .prose {
    font-size: 14px;
  }
  .prose :global(:first-child) {
    margin-top: 0;
  }
  .prose :global(:last-child) {
    margin-bottom: 0;
  }
  .prose :global(h1),
  .prose :global(h2),
  .prose :global(h3),
  .prose :global(h4) {
    font-family: var(--font-display);
    color: var(--text-heading);
    line-height: 1.25;
    margin: 1.4em 0 0.5em;
  }
  .prose :global(h1) {
    font-size: 1.7em;
  }
  .prose :global(h2) {
    font-size: 1.4em;
  }
  .prose :global(h3) {
    font-size: 1.15em;
  }
  .prose :global(p),
  .prose :global(ul),
  .prose :global(ol),
  .prose :global(blockquote),
  .prose :global(pre),
  .prose :global(table) {
    margin: 0 0 0.9em;
  }
  .prose :global(ul),
  .prose :global(ol) {
    padding-left: 1.4em;
  }
  .prose :global(li + li) {
    margin-top: 0.25em;
  }
  .prose :global(a) {
    color: var(--text-heading);
    text-underline-offset: 3px;
  }
  .prose :global(code) {
    padding: 0.1em 0.35em;
    border-radius: 4px;
    background: var(--hover-bg);
    font-size: 0.9em;
  }
  .prose :global(pre) {
    padding: 12px 14px;
    border-radius: 8px;
    background: var(--bg);
    overflow-x: auto;
  }
  .prose :global(pre code) {
    padding: 0;
    background: none;
  }
  .prose :global(blockquote) {
    padding-left: 14px;
    border-left: 3px solid var(--border);
    color: var(--text-muted);
  }
  .prose :global(hr) {
    border: none;
    border-top: 1px solid var(--border);
    margin: 1.5em 0;
  }
  .prose :global(table) {
    border-collapse: collapse;
    display: block;
    overflow-x: auto;
  }
  .prose :global(th),
  .prose :global(td) {
    padding: 6px 10px;
    border: 1px solid var(--border);
    text-align: left;
  }
  .prose :global(input[type='checkbox']) {
    margin-right: 6px;
  }
</style>
