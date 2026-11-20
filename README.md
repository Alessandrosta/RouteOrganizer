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

- **Home** (`#/r/<route>`): the big BincioPacking title and one slide per route, each with its route (version 1) sketched on a globe and basic info. Change route with the side arrows, a sideways swipe / trackpad scroll, the ← → keys, or the dots. On the last slide the right-hand button becomes **+**: drop a GPX/TCX file, name the route, and a new slide is created (with `npm run dev`; it writes `routes/<id>/`).
- **Route page** (`#/r/<route>/map`): scroll or swipe down from a route (or press ↓) to open it; scroll up at the top, or use **All routes**, to go back. It has the route's side menu and the map tools: route versions, base map, split points, elevation profile, stages and the version description.
- **Side menu**: each route has its own dropdown menu (new routes start with the default Kit / Planning / Route / External links list). Every entry opens a markdown page (`#/r/<route>/page/<id>`); use the pen to edit it. **Edit menu** lets you rename, add and remove sections and pages.

Everything you edit is saved as files under `content/` while `npm run dev` is running (see `content/README.md`), so commit those files to keep them.

## Structure

- `routes/` – one folder per route with its versions (`.tcx` / `.gpx`), see `routes/README.md`
- `content/` – your editable markdown pages, route descriptions and stage plans
- `vite.config.ts` – includes the small dev-server endpoint that saves `content/` files
- `src/app.css` – design tokens (greys; green only for the route title and the sketch)
- `src/App.svelte` – page routing (`#/r/<route>`, `…/map`, `…/page/<id>`), the slide transition between home and route page, track loading
- `src/lib/views/` – `Home` (route carousel) and `Workspace` (route page)
- `src/lib/components/` – UI components (`RouteBackdrop`, `Sidebar` + `SidebarSection` (with edit mode), `ContentPage`, `MarkdownPanel`, `DetailMap`, `StageRow`, …)
- `src/lib/routes/` – track parsing (TCX/GPX), route catalog, stats, stage plans
- `src/lib/content/` – content store (dev-server files, or localStorage in a production build) and markdown rendering
- `src/lib/map/layers.ts` – base map tile layers (CyclOSM, OpenTopoMap, Esri satellite)
- `src/lib/nav.ts` – per-route side menus: default sections, loading/saving
