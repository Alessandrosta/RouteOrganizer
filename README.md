# RouteOrganizer

A bikepacking trip organizer: trip overview, route versions, a detailed route map with a split point, elevation profile and per-segment stats.

Built with [Svelte 5](https://svelte.dev) + Vite + TypeScript, [Leaflet](https://leafletjs.com) for the detailed map and [d3-geo](https://d3js.org/d3-geo) + [Natural Earth](https://www.naturalearthdata.com) borders (via `world-atlas`) for the simplified overview map.

## Development

```bash
npm install
npm run dev      # start the dev server
npm run check    # type-check with svelte-check
npm run build    # production build into dist/
```

## Structure

- `src/app.css` – design tokens (colors, fonts) as CSS custom properties, plus shared utility classes
- `routes/` – one folder per route with its versions (`.tcx` / `.gpx`), see `routes/README.md`
- `src/lib/routes/` – track parsing (TCX/GPX), route catalog loading, segment stats
- `src/lib/map/layers.ts` – base map tile layers (CyclOSM, OpenTopoMap, Esri satellite)
- `src/lib/data.ts` – sidebar navigation
- `src/lib/components/` – UI components (`Sidebar`, `TripHeader`, `OverviewMap`, `DetailMap`, `LayerPicker`, `SplitForm`, `ElevationProfile`, `SegmentCard`, …)
- `src/App.svelte` – page layout and app state (selected route version, base map layer)
