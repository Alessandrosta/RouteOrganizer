<script lang="ts">
  import type { NavSection } from '../data';

  interface Props {
    section: NavSection;
    open: boolean;
    activeSlug: string | null;
    ontoggle: () => void;
  }

  let { section, open, activeSlug, ontoggle }: Props = $props();
</script>

<div class="group">
  <button class="toggle" onclick={ontoggle} aria-expanded={open}>
    <span>{section.title}</span>
    <svg class="chevron" class:open width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M4 6 L8 10 L12 6" />
    </svg>
  </button>
  {#if open}
    <div class="items">
      {#each section.items as item (item.slug)}
        {@const current = item.slug === activeSlug}
        <a class="navlink" class:current href="#/page/{section.id}/{item.slug}" aria-current={current ? 'page' : undefined}>
          {item.label}
        </a>
      {/each}
    </div>
  {/if}
</div>

<style>
  .group {
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--bg-card-glass);
    overflow: hidden;
  }
  .toggle {
    width: 100%;
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 0 14px;
    background: transparent;
    border: none;
    color: var(--text-heading);
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
  }
  .chevron {
    color: var(--text-muted);
    transition: transform 0.2s;
  }
  .chevron.open {
    transform: rotate(180deg);
  }
  .items {
    display: flex;
    flex-direction: column;
    padding: 0 6px 8px;
    border-top: 1px solid var(--border-subtle);
  }
  .navlink {
    display: flex;
    align-items: center;
    min-height: 40px;
    padding: 0 10px;
    border-radius: 6px;
    text-decoration: none;
    color: var(--text);
    font-size: 14px;
  }
  .navlink:hover {
    background: var(--hover-bg);
    color: var(--text-highlight);
  }
  .navlink.current {
    background: var(--hover-bg);
    color: var(--text-highlight);
    font-weight: 600;
  }
</style>
