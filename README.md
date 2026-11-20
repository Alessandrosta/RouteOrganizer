# RouteOrganizer

A bikepacking trip organizer: trip overview, route versions, a detailed route map with a split point, elevation profile and per-segment stats.

Built with [Svelte 5](https://svelte.dev) + Vite + TypeScript.

## Development

```bash
npm install
npm run dev      # start the dev server
npm run check    # type-check with svelte-check
npm run build    # production build into dist/
```

## Structure

- `src/app.css` – design tokens (colors, fonts) as CSS custom properties, plus shared utility classes
- `src/lib/data.ts` – navigation, route versions and stats (placeholder content for now)
- `src/lib/components/` – UI components (`Sidebar`, `TripHeader`, `OverviewMap`, `DetailMap`, `LayerPicker`, `SplitForm`, `ElevationProfile`, `SegmentCard`, …)
- `src/App.svelte` – page layout and app state (selected route version, base map layer)
