import type { TrackPoint } from './types';

/** Ignore elevation wiggles smaller than this when summing climbing/descent. */
const ELEVATION_THRESHOLD_M = 3;
/** Minimum horizontal distance a grade is measured over, to smooth out GPS noise. */
const GRADE_WINDOW_M = 200;
/** Estimated time model for a loaded bikepacking bike: flat speed plus time per metre climbed. */
const FLAT_SPEED_KMH = 15;
const CLIMB_RATE_M_PER_H = 600;

export interface SegmentStats {
  distanceKm: number;
  climbM: number;
  descentM: number;
  maxEleM: number;
  maxGradePct: number;
  estHours: number;
}

export function segmentStats(points: TrackPoint[], from = 0, to = points.length - 1): SegmentStats {
  const seg = points.slice(from, to + 1);
  let climb = 0;
  let descent = 0;
  let ref = seg[0]?.ele ?? 0;
  let maxEle = -Infinity;
  for (const p of seg) {
    maxEle = Math.max(maxEle, p.ele);
    const d = p.ele - ref;
    if (d >= ELEVATION_THRESHOLD_M) {
      climb += d;
      ref = p.ele;
    } else if (d <= -ELEVATION_THRESHOLD_M) {
      descent -= d;
      ref = p.ele;
    }
  }

  let maxGrade = 0;
  let j = 0;
  for (let i = 0; i < seg.length; i++) {
    while (j < seg.length && seg[j].dist - seg[i].dist < GRADE_WINDOW_M) j++;
    if (j >= seg.length) break;
    maxGrade = Math.max(maxGrade, (seg[j].ele - seg[i].ele) / (seg[j].dist - seg[i].dist));
  }

  const distanceKm = seg.length > 1 ? (seg[seg.length - 1].dist - seg[0].dist) / 1000 : 0;
  return {
    distanceKm,
    climbM: climb,
    descentM: descent,
    maxEleM: Number.isFinite(maxEle) ? maxEle : 0,
    maxGradePct: maxGrade * 100,
    estHours: distanceKm / FLAT_SPEED_KMH + climb / CLIMB_RATE_M_PER_H,
  };
}

/** Index of the track point closest to a coordinate. */
export function nearestIndex(points: TrackPoint[], lat: number, lon: number): number {
  const cos = Math.cos((lat * Math.PI) / 180);
  let best = 0;
  let bestD = Infinity;
  points.forEach((p, i) => {
    const d = (p.lat - lat) ** 2 + ((p.lon - lon) * cos) ** 2;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
}

/** Index of the first point at or past a distance (metres). */
export function indexAtDistance(points: TrackPoint[], dist: number): number {
  const i = points.findIndex((p) => p.dist >= dist);
  return i === -1 ? points.length - 1 : i;
}

/** Every nth point, always keeping the last. */
export function sample<T>(items: T[], maxCount: number): T[] {
  if (items.length <= maxCount) return items;
  const step = items.length / maxCount;
  const out: T[] = [];
  for (let i = 0; i < maxCount; i++) out.push(items[Math.floor(i * step)]);
  out.push(items[items.length - 1]);
  return out;
}

const fmt = (n: number, digits = 0) =>
  n.toLocaleString('en-GB', { minimumFractionDigits: digits, maximumFractionDigits: digits });

export function formatStats(s: SegmentStats) {
  return [
    { label: 'Distance', value: `${fmt(s.distanceKm, 1)} km` },
    { label: 'Climbing', value: `${fmt(s.climbM)} m` },
    { label: 'Descent', value: `${fmt(s.descentM)} m` },
    { label: 'Max elev.', value: `${fmt(s.maxEleM)} m` },
    { label: 'Max grade', value: `${fmt(s.maxGradePct, 1)} %` },
    { label: 'Est. time', value: `${fmt(s.estHours, 1)} h` },
  ];
}
