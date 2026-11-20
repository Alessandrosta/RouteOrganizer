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

## Using it

- **Landing page** (`#/`): the route (version 1) sketched on a globe, with the Kit / Planning / Route / External links dropdowns. Each dropdown entry opens a markdown page; use the pen button to edit it.
- **Map page** (`#/map`): scroll down from the landing page (or click the sketch) to get there; scroll up at the top, or use **Overview**, to go back. Pick a route version, switch the base map, split the route into stages, name the stages, add notes, and write a description per version.

Everything you edit is saved as files under `content/` while `npm run dev` is running (see `content/README.md`), so commit those files to keep them.

## Structure

- `routes/` – one folder per route with its versions (`.tcx` / `.gpx`), see `routes/README.md`
- `content/` – your editable markdown pages, route descriptions and stage plans
- `vite.config.ts` – includes the small dev-server endpoint that saves `content/` files
- `src/app.css` – design tokens (greys; green only for the route title and the sketch)
- `src/App.svelte` – page routing (`#/`, `#/map`, `#/page/…`) and the slide transition between pages
- `src/lib/views/` – `Landing` and `Workspace` (map page)
- `src/lib/components/` – UI components (`RouteBackdrop`, `Sidebar`, `ContentPage`, `MarkdownPanel`, `DetailMap`, `StageRow`, …)
- `src/lib/routes/` – track parsing (TCX/GPX), route catalog, stats, stage plans
- `src/lib/content/` – content store (dev-server files, or localStorage in a production build) and markdown rendering
- `src/lib/map/layers.ts` – base map tile layers (CyclOSM, OpenTopoMap, Esri satellite)
- `src/lib/data.ts` – sidebar sections and pages
