# Content

Everything you edit in the app while running `npm run dev` is saved here as plain files:

- `pages/<section>/<page>.md` – the pages behind the sidebar entries (Kit, Planning, Route, External links)
- `routes/<route-id>/<version-id>/description.md` – the route description of each version
- `routes/<route-id>/<version-id>/plan.json` – split points, stage names and stage notes of each version

Commit these files to keep them. You can also edit them by hand; reload the page to see the changes.

In a production build (`npm run build` / `npm run preview`) there is no dev server to write files, so edits are kept in the browser's localStorage instead.
