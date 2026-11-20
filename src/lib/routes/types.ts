export interface TrackPoint {
  lat: number;
  lon: number;
  /** Elevation in metres. */
  ele: number;
  /** Cumulative distance from the start in metres. */
  dist: number;
}

export interface Track {
  name: string;
  points: TrackPoint[];
}

export interface VersionManifest {
  id: string;
  label: string;
  note: string;
  /** File name inside the route's `versions/` folder. */
  file: string;
}

export interface RouteManifest {
  name: string;
  start: string;
  finish: string;
  versions: VersionManifest[];
}

export interface RouteEntry extends RouteManifest {
  /** Folder name under `routes/`. */
  id: string;
}

/** A version as shown in the UI: either from the routes folder or uploaded this session. */
export interface RouteVersion {
  id: string;
  label: string;
  note: string;
  load: () => Promise<Track>;
}
