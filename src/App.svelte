<script lang="ts">
  import {
    mapLayers,
    navSections,
    routeVersions,
    segmentStats,
    tripStats,
    type MapLayer,
  } from './lib/data';
  import Sidebar from './lib/components/Sidebar.svelte';
  import TripHeader from './lib/components/TripHeader.svelte';
  import OverviewMap from './lib/components/OverviewMap.svelte';
  import LayerPicker from './lib/components/LayerPicker.svelte';
  import DetailMap from './lib/components/DetailMap.svelte';
  import SplitForm from './lib/components/SplitForm.svelte';
  import ElevationProfile from './lib/components/ElevationProfile.svelte';
  import SegmentCard from './lib/components/SegmentCard.svelte';

  let versionId = $state(routeVersions[0].id);
  let layer = $state<MapLayer>('CyclOSM');

  let route = $derived(routeVersions.find((v) => v.id === versionId) ?? routeVersions[0]);

  const segments = [
    { name: 'Segment A', range: 'Start → split point', color: 'var(--accent)' },
    { name: 'Segment B', range: 'Split point → finish', color: 'var(--accent-alt)' },
  ];
</script>

<div class="shell">
  <Sidebar sections={navSections} />

  <main>
    <section class="overview">
      <TripHeader name="[Trip name]" subtitle="[Start] → [Finish] · [Dates]" stats={tripStats} />
      <OverviewMap versions={routeVersions} selectedId={versionId} onselect={(id) => (versionId = id)} />
    </section>

    <section id="detail-map" class="detail">
      <div class="detail-head">
        <h2>Route map <span>· {route.label}</span></h2>
        <LayerPicker layers={mapLayers} selected={layer} onselect={(l) => (layer = l)} />
      </div>

      <DetailMap {route} {layer} />
      <SplitForm />
      <ElevationProfile splitX={route.sx} />

      <div class="segments">
        {#each segments as seg (seg.name)}
          <SegmentCard {...seg} stats={segmentStats} />
        {/each}
      </div>
    </section>
  </main>
</div>

<style>
  .shell {
    min-height: 100vh;
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
  }
  main {
    flex: 999 1 560px;
    min-width: 0;
    padding: 36px 44px 72px;
    display: flex;
    flex-direction: column;
    gap: 56px;
  }
  .overview {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .detail {
    display: flex;
    flex-direction: column;
    gap: 20px;
    scroll-margin-top: 24px;
  }
  .detail-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  h2 {
    margin: 0;
    font-family: var(--font-display);
    font-size: 28px;
    font-weight: 600;
    color: var(--text-heading);
  }
  h2 span {
    font-weight: 500;
    color: var(--text-muted);
  }
  .segments {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }
  @media (max-width: 760px) {
    main {
      padding: 28px 16px 56px;
    }
  }
</style>
