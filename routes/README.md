# Routes

One folder per route. Each route has a `route.json` and a `versions/` folder holding one track file per version (`.tcx` or `.gpx`).

```
routes/
  <route-id>/
    route.json
    versions/
      v1.tcx
      v2.gpx
```

`route.json`:

```json
{
  "name": "The Badger Divide",
  "start": "Inverness",
  "finish": "Glasgow",
  "versions": [
    { "id": "v1", "label": "Version 1", "note": "original", "file": "v1.tcx" }
  ]
}
```

To add a version, drop the file in `versions/` and add an entry to `versions`. The app picks up route folders automatically at build time; track files are loaded on demand.

To add a route, create a new folder here with a `route.json` and its `versions/`. It shows up as a new slide on the home page, with the default side menu (Kit, Planning, Route, External links), which you can then edit in the app.
