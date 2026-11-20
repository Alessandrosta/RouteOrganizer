<script lang="ts">
  import type { NavSection } from '../nav';

  interface Props {
    routeId: string;
    section: NavSection;
    open: boolean;
    editing: boolean;
    activeItemId: string | null;
    ontoggle: () => void;
    onrename: (title: string) => void;
    onremove: () => void;
    onrenameitem: (itemId: string, label: string) => void;
    onremoveitem: (itemId: string) => void;
    onadditem: () => void;
  }

  let { routeId, section, open, editing, activeItemId, ontoggle, onrename, onremove, onrenameitem, onremoveitem, onadditem }: Props =
    $props();
</script>

<div class="group" data-section={section.id}>
  {#if editing}
    <div class="edit-row head">
      <input
        class="section-title-input"
        value={section.title}
        placeholder="Section name"
        aria-label="Section name"
        oninput={(e) => onrename(e.currentTarget.value)}
      />
      <button class="icon" aria-label="Remove section {section.title}" title="Remove section" onclick={onremove}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4.5 H13 M6.5 4.5 V3 H9.5 V4.5 M4.5 4.5 L5 13.5 H11 L11.5 4.5" /></svg>
      </button>
    </div>
  {:else}
    <button class="toggle" onclick={ontoggle} aria-expanded={open}>
      <span>{section.title || 'Untitled section'}</span>
      <svg class="chevron" class:open width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M4 6 L8 10 L12 6" />
      </svg>
    </button>
  {/if}

  {#if open}
    <div class="items">
      {#each section.items as item (item.id)}
        {#if editing}
          <div class="edit-row">
            <input
              class="item-input"
              value={item.label}
              placeholder="Page name"
              aria-label="Page name"
              oninput={(e) => onrenameitem(item.id, e.currentTarget.value)}
            />
            <button class="icon" aria-label="Remove page {item.label}" title="Remove page" onclick={() => onremoveitem(item.id)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 3 L11 11 M11 3 L3 11" /></svg>
            </button>
          </div>
        {:else}
          {@const current = item.id === activeItemId}
          <a class="navlink" class:current href="#/r/{routeId}/page/{item.id}" aria-current={current ? 'page' : undefined}>
            {item.label || 'Untitled page'}
          </a>
        {/if}
      {/each}
      {#if editing}
        <button class="add" onclick={onadditem}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M7 2 V12 M2 7 H12" /></svg>
          Add page
        </button>
      {:else if !section.items.length}
        <span class="none">No pages</span>
      {/if}
    </div>
  {/if}
</div>

<style>
  .group {
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--bg-card);
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
    text-align: left;
  }
  .chevron {
    flex: none;
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
  .head + .items {
    padding-top: 6px;
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
  .navlink:hover,
  .navlink.current {
    background: var(--hover-bg);
    color: var(--text-highlight);
  }
  .navlink.current {
    font-weight: 600;
  }
  .none {
    padding: 10px 10px 2px;
    font-size: 13px;
    color: var(--text-muted);
  }
  .edit-row {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 0;
  }
  .edit-row.head {
    padding: 6px 6px;
  }
  .edit-row input {
    flex: 1;
    min-width: 0;
    min-height: 38px;
    padding: 0 10px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--bg);
    color: var(--text);
    font-size: 14px;
  }
  .section-title-input {
    font-family: var(--font-display);
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-heading) !important;
  }
  .icon {
    flex: none;
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
  }
  .icon:hover {
    background: var(--hover-bg);
    color: var(--text-highlight);
  }
  .add {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 38px;
    margin-top: 4px;
    padding: 0 10px;
    border: 1px dashed var(--border);
    border-radius: 6px;
    background: transparent;
    color: var(--text-muted);
    font-size: 13px;
    cursor: pointer;
  }
  .add:hover {
    color: var(--text-highlight);
    border-color: var(--text-muted);
  }
</style>
