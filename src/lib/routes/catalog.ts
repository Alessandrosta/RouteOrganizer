import { parseTrackFile } from './parse';
import type { RouteEntry, RouteManifest, RouteVersion, Track } from './types';

// Route folders are discovered at build time; track files are split into lazy chunks.
const manifests = import.meta.glob<RouteManifest>('/routes/*/route.json', {
  eager: true,
  import: 'default',
});
const trackFiles = import.meta.glob<string>('/routes/*/versions/*.{tcx,gpx}', {
  query: '?raw',
  import: 'default',
});

export const routes: RouteEntry[] = Object.entries(manifests)
  .map(([path, manifest]) => ({ id: path.split('/')[2], ...manifest }))
  .sort((a, b) => a.name.localeCompare(b.name));

export function routeVersions(route: RouteEntry): RouteVersion[] {
  return route.versions.map((v) => ({
    id: v.id,
    label: v.label,
    note: v.note,
    load: async (): Promise<Track> => {
      const path = `/routes/${route.id}/versions/${v.file}`;
      const loader = trackFiles[path];
      if (!loader) throw new Error(`Missing track file ${path}`);
      return parseTrackFile(v.file, await loader());
    },
  }));
}

/** A version from a file the user picked; lives only for this session. */
export async function versionFromFile(file: File, index: number): Promise<RouteVersion> {
  const track = parseTrackFile(file.name, await file.text());
  return {
    id: `upload-${Date.now()}`,
    label: `Version ${index}`,
    note: file.name,
    load: async () => track,
  };
}
