<script lang="ts">
  import { tick, untrack } from 'svelte';
  import { newId, type NavSection } from '../nav';
  import SidebarSection from './SidebarSection.svelte';

  interface Props {
    routeId: string;
    sections: NavSection[];
    /** Open page id, or null when the map is showing. */
    activeItemId: string | null;
    onchange: (sections: NavSection[]) => void;
  }

  let { routeId, sections, activeItemId, onchange }: Props = $props();

  let editing = $state(false);
  let root: HTMLElement;
  let open = $state<Record<string, boolean>>(untrack(() => (sections[0] ? { [sections[0].id]: true } : {})));

  // Expand the section holding the open page.
  $effect(() => {
    const id = activeItemId;
    const holder = id && sections.find((s) => s.items.some((i) => i.id === id));
    if (holder) untrack(() => (open[holder.id] = true));
  });

  const clone = () => sections.map((s) => ({ ...s, items: s.items.map((i) => ({ ...i })) }));
  const allIds = () => sections.flatMap((s) => [s.id, ...s.items.map((i) => i.id)]);

  async function focusLast(selector: string) {
    await tick();
    const inputs = root.querySelectorAll<HTMLInputElement>(selector);
    inputs[inputs.length - 1]?.select();
  }

  function renameSection(sectionId: string, title: string) {
    onchange(clone().map((s) => (s.id === sectionId ? { ...s, title } : s)));
  }

  function removeSection(sectionId: string) {
    const s = sections.find((x) => x.id === sectionId);
    if (!s) return;
    const pages = s.items.length ? ` and its ${s.items.length} page${s.items.length > 1 ? 's' : ''}` : '';
    if (!confirm(`Remove "${s.title || 'Untitled section'}"${pages} from the menu?\nPage files stay in content/routes/${routeId}/pages/.`)) return;
    onchange(clone().filter((x) => x.id !== sectionId));
  }

  function addSection() {
    const id = newId('section', allIds());
    onchange([...clone(), { id, title: 'New section', items: [] }]);
    open[id] = true;
    focusLast('.section-title-input');
  }

  function renameItem(sectionId: string, itemId: string, label: string) {
    onchange(
      clone().map((s) =>
        s.id === sectionId ? { ...s, items: s.items.map((i) => (i.id === itemId ? { ...i, label } : i)) } : s,
      ),
    );
  }

  function removeItem(sectionId: string, itemId: string) {
    const item = sections.find((s) => s.id === sectionId)?.items.find((i) => i.id === itemId);
    if (!item) return;
    if (!confirm(`Remove "${item.label || 'Untitled page'}" from the menu?\nIts file stays in content/routes/${routeId}/pages/.`)) return;
    onchange(clone().map((s) => (s.id === sectionId ? { ...s, items: s.items.filter((i) => i.id !== itemId) } : s)));
  }

  function addItem(sectionId: string) {
    const section = sections.find((s) => s.id === sectionId);
    const id = newId(`${sectionId}-page`, allIds());
    onchange(clone().map((s) => (s.id === sectionId ? { ...s, items: [...s.items, { id, label: 'New page' }] } : s)));
    open[sectionId] = true;
    focusLast(`[data-section="${section?.id}"] .item-input`);
  }
</script>

<aside class="side" bind:this={root}>
  <a class="maplink" class:current={!activeItemId} href="#/r/{routeId}/map" aria-current={!activeItemId ? 'page' : undefined}>
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M2 4.5 L6.5 2.5 L11.5 4.5 L16 2.5 V13.5 L11.5 15.5 L6.5 13.5 L2 15.5 Z M6.5 2.5 V13.5 M11.5 4.5 V15.5" />
    </svg>
    Route map
  </a>

  <nav aria-label="Route pages">
    {#each sections as section (section.id)}
      <SidebarSection
        {routeId}
        {section}
        {editing}
        open={editing || !!open[section.id]}
        {activeItemId}
        ontoggle={() => (open[section.id] = !open[section.id])}
        onrename={(title) => renameSection(section.id, title)}
        onremove={() => removeSection(section.id)}
        onrenameitem={(itemId, label) => renameItem(section.id, itemId, label)}
        onremoveitem={(itemId) => removeItem(section.id, itemId)}
        onadditem={() => addItem(section.id)}
      />
    {/each}
    {#if !sections.length}
      <p class="empty">No sections yet.</p>
    {/if}
  </nav>

  <div class="tools">
    {#if editing}
      <button class="tool" onclick={addSection}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M7 2 V12 M2 7 H12" /></svg>
        Add section
      </button>
      <button class="tool primary" onclick={() => (editing = false)}>Done</button>
    {:else}
      <button class="tool" onclick={() => (editing = true)}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 2.5 L13.5 5 L5.5 13 L2.5 13.5 L3 10.5 Z" /></svg>
        Edit menu
      </button>
    {/if}
  </div>
</aside>

<style>
  .side {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  nav {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .maplink {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 48px;
    margin-bottom: 6px;
    padding: 0 14px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--bg-card);
    color: var(--text-heading);
    text-decoration: none;
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .maplink:hover {
    border-color: var(--text-muted);
  }
  .maplink.current {
    background: var(--hover-bg);
    border-color: var(--text-muted);
  }
  .empty {
    margin: 0;
    padding: 8px;
    font-size: 14px;
    color: var(--text-muted);
  }
  .tools {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding-top: 10px;
  }
  .tool {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 40px;
    padding: 0 14px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: transparent;
    color: var(--text);
    font-size: 14px;
    cursor: pointer;
  }
  .tool:hover {
    border-color: var(--text-muted);
    color: var(--text-highlight);
  }
  .tool.primary {
    margin-left: auto;
    border-color: var(--accent);
    background: var(--accent);
    color: var(--accent-contrast);
    font-weight: 600;
  }
</style>
