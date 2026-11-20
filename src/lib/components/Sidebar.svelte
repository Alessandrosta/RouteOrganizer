<script lang="ts">
  import type { NavSection } from '../data';
  import { untrack } from 'svelte';
  import SidebarSection from './SidebarSection.svelte';

  interface Props {
    sections: NavSection[];
    initiallyOpen?: string[];
  }

  let { sections, initiallyOpen = ['kit'] }: Props = $props();

  // Seeded once from `initiallyOpen`; afterwards the sidebar owns its open state.
  let open = $state<Record<string, boolean>>(
    untrack(() => Object.fromEntries(initiallyOpen.map((id) => [id, true]))),
  );
</script>

<aside class="side">
  <div class="brand">
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="7" cy="19" r="4.5" />
      <circle cx="21" cy="19" r="4.5" />
      <path d="M7 19 L11.5 10 H18 L21 19 M11.5 10 L14 19 H7 M16 7 H19" />
    </svg>
    <div class="brand-name">Trip organizer</div>
  </div>

  {#each sections as section (section.id)}
    <SidebarSection
      {section}
      open={!!open[section.id]}
      ontoggle={() => (open[section.id] = !open[section.id])}
    />
  {/each}

  <div class="footer">Route data: [your-route.gpx]</div>
</aside>

<style>
  .side {
    flex: 1 1 260px;
    max-width: 300px;
    padding: 28px 16px 40px;
    background: var(--bg-sidebar);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 8px 22px;
  }
  .brand-name {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 18px;
    letter-spacing: 0.01em;
    color: var(--text-heading);
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
      border-bottom: 1px solid var(--border);
    }
  }
</style>
