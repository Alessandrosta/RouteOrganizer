<script lang="ts">
  import { pagePath, type NavItem, type NavSection } from '../data';
  import { readContent, savesToFiles, writeContent } from '../content/store';
  import MarkdownPanel from './MarkdownPanel.svelte';

  interface Props {
    section: NavSection;
    page: NavItem;
  }

  let { section, page }: Props = $props();

  const path = $derived(pagePath(section.id, page.slug));
  let text = $state('');
  let status = $state<'loading' | 'ready' | 'error'>('loading');
  let message = $state('');

  $effect(() => {
    const p = path;
    status = 'loading';
    message = '';
    readContent(p)
      .then((t) => {
        if (p !== path) return;
        text = t ?? '';
        status = 'ready';
      })
      .catch((e: Error) => {
        status = 'error';
        message = e.message;
      });
  });

  async function save(value: string) {
    const previous = text;
    text = value;
    try {
      await writeContent(path, value);
      message = savesToFiles ? `Saved to content/${path}` : 'Saved in this browser';
    } catch (e) {
      text = previous;
      message = (e as Error).message;
    }
  }
</script>

<article class="card page" aria-labelledby="page-title">
  <header>
    <div>
      <div class="crumb eyebrow">{section.title}</div>
      <h2 id="page-title">{page.label}</h2>
    </div>
    <a class="close" href="#/" aria-label="Close page">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <path d="M4 4 L12 12 M12 4 L4 12" />
      </svg>
    </a>
  </header>

  {#if status === 'loading'}
    <p class="muted">Loading…</p>
  {:else if status === 'error'}
    <p class="muted" role="alert">{message}</p>
  {:else}
    {#key path}
      <MarkdownPanel value={text} label={page.label} placeholder="This page is empty. Use the pen to write it." onsave={save} />
    {/key}
    {#if message}<p class="status" role="status">{message}</p>{/if}
  {/if}
</article>

<style>
  .page {
    padding: 28px 32px 32px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-width: 860px;
    width: 100%;
  }
  header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-subtle);
  }
  h2 {
    margin: 4px 0 0;
    font-family: var(--font-display);
    font-size: 32px;
    font-weight: 700;
    color: var(--text-heading);
  }
  .close {
    flex: none;
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    border-radius: 8px;
    border: 1px solid var(--border);
    color: var(--text-muted);
  }
  .close:hover {
    color: var(--text-highlight);
    border-color: var(--text-muted);
  }
  .muted,
  .status {
    margin: 0;
    color: var(--text-muted);
  }
  .status {
    font-size: 12px;
  }
  @media (max-width: 760px) {
    .page {
      padding: 20px 16px 24px;
    }
  }
</style>
