<script lang="ts">
  import { untrack } from 'svelte';
  import type { NavSection } from '../data';
  import SidebarSection from './SidebarSection.svelte';

  interface Props {
    sections: NavSection[];
    /** Currently open page, if any. */
    active?: { section: string; slug: string } | null;
    initiallyOpen?: string[];
    footer?: string;
  }

  let { sections, active = null, initiallyOpen = ['kit'], footer = '' }: Props = $props();

  // Seeded once from `initiallyOpen`; afterwards the sidebar owns its open state.
  let open = $state<Record<string, boolean>>(
    untrack(() => Object.fromEntries(initiallyOpen.map((id) => [id, true]))),
  );

  // Make sure the section holding the open page is expanded.
  $effect(() => {
    if (active) untrack(() => (open[active.section] = true));
  });
</script>

<aside class="side">
  <a class="brand" href="#/">
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="7" cy="19" r="4.5" />
      <circle cx="21" cy="19" r="4.5" />
      <path d="M7 19 L11.5 10 H18 L21 19 M11.5 10 L14 19 H7 M16 7 H19" />
    </svg>
    <span>Trip organizer</span>
  </a>

  <nav aria-label="Trip pages">
    {#each sections as section (section.id)}
      <SidebarSection
        {section}
        open={!!open[section.id]}
        activeSlug={active?.section === section.id ? active.slug : null}
        ontoggle={() => (open[section.id] = !open[section.id])}
      />
    {/each}
  </nav>

  {#if footer}<div class="footer">{footer}</div>{/if}
</aside>

<style>
  .side {
    flex: 1 1 260px;
    max-width: 300px;
    padding: 28px 16px 40px;
    background: rgba(16, 16, 16, 0.5);
    backdrop-filter: blur(1.5px);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  nav {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 8px 22px;
    text-decoration: none;
    color: var(--text-heading);
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 18px;
    letter-spacing: 0.01em;
  }
  .footer {
    margin-top: auto;
    padding: 24px 8px 0;
    font-size: 12px;
    color: var(--text-muted);
    line-height: 1.5;
  }
  @media (max-width: 760px) {
    .side {
      max-width: none;
      border-right: none;
      border-top: 1px solid var(--border);
    }
  }
</style>
