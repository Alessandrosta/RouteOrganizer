import type { Track, TrackPoint } from './types';

const EARTH_RADIUS_M = 6_371_000;

export function haversine(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const toRad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * toRad;
  const dLon = (b.lon - a.lon) * toRad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * toRad) * Math.cos(b.lat * toRad) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Direct child element by local name (namespace-agnostic). */
function child(el: Element, name: string): Element | undefined {
  for (const c of Array.from(el.children)) if (c.localName === name) return c;
  return undefined;
}

function num(el: Element | undefined): number | undefined {
  if (!el?.textContent) return undefined;
  const n = Number(el.textContent.trim());
  return Number.isFinite(n) ? n : undefined;
}

function byLocalName(doc: Document, name: string): Element[] {
  return Array.from(doc.getElementsByTagNameNS('*', name));
}

/** Fill gaps in elevation and recompute cumulative distance where the file has none. */
function finalize(raw: { lat: number; lon: number; ele?: number; dist?: number }[]): TrackPoint[] {
  const points: TrackPoint[] = [];
  let lastEle = raw.find((p) => p.ele !== undefined)?.ele ?? 0;
  let dist = 0;
  raw.forEach((p, i) => {
    if (i > 0) dist += haversine(raw[i - 1], p);
    if (p.ele !== undefined) lastEle = p.ele;
    points.push({ lat: p.lat, lon: p.lon, ele: lastEle, dist: p.dist ?? dist });
  });
  return points;
}

export function parseTcx(xml: string, fallbackName = 'Route'): Track {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const raw = byLocalName(doc, 'Trackpoint').flatMap((tp) => {
    const pos = child(tp, 'Position');
    const lat = pos && num(child(pos, 'LatitudeDegrees'));
    const lon = pos && num(child(pos, 'LongitudeDegrees'));
    if (lat === undefined || lon === undefined) return [];
    return [{ lat, lon, ele: num(child(tp, 'AltitudeMeters')), dist: num(child(tp, 'DistanceMeters')) }];
  });
  // Only trust file distances if every point has one.
  const hasDist = raw.every((p) => p.dist !== undefined);
  const name = byLocalName(doc, 'Name')[0]?.textContent?.trim() || fallbackName;
  return { name, points: finalize(hasDist ? raw : raw.map((p) => ({ ...p, dist: undefined }))) };
}

export function parseGpx(xml: string, fallbackName = 'Route'): Track {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  let pts = byLocalName(doc, 'trkpt');
  if (pts.length === 0) pts = byLocalName(doc, 'rtept');
  const raw = pts.flatMap((p) => {
    const lat = Number(p.getAttribute('lat'));
    const lon = Number(p.getAttribute('lon'));
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return [];
    return [{ lat, lon, ele: num(child(p, 'ele')) }];
  });
  const name = byLocalName(doc, 'name')[0]?.textContent?.trim() || fallbackName;
  return { name, points: finalize(raw) };
}

/** Parse a track file by extension (.tcx or .gpx). */
export function parseTrackFile(fileName: string, text: string): Track {
  const track = fileName.toLowerCase().endsWith('.tcx') ? parseTcx(text, fileName) : parseGpx(text, fileName);
  if (track.points.length < 2) throw new Error(`No track points found in ${fileName}`);
  return track;
}
