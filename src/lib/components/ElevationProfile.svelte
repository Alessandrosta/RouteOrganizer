<script lang="ts">
  interface Props {
    /** Split marker position in the 0–1000 viewBox. */
    splitX: number;
  }

  let { splitX }: Props = $props();

  const profile =
    'M0,120 C60,110 90,70 140,80 S220,40 280,60 S360,110 420,90 S480,30 530,45 S600,100 660,95 S740,20 800,35 S880,110 940,100 S990,90 1000,95';
</script>

<div class="card profile">
  <div class="head">
    <span class="card-title">Elevation profile</span>
    <span>Distance (km) →</span>
  </div>
  <svg viewBox="0 0 1000 150" role="img" aria-label="Elevation profile placeholder with the split point marked">
    <path d="{profile} L1000,150 L0,150 Z" fill="var(--profile-fill)" />
    <path d={profile} fill="none" stroke="var(--accent)" stroke-width="2.5" />
    <line x1={splitX} y1="0" x2={splitX} y2="150" stroke="var(--text-highlight)" stroke-width="1.5" stroke-dasharray="4 4" />
  </svg>
</div>

<style>
  .profile {
    padding: 16px 18px 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    color: var(--text-muted);
  }
  svg {
    display: block;
    width: 100%;
    height: auto;
  }
</style>
