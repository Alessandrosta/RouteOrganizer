/** User edits for one route version: split points, segment names/notes and a description. */
export interface SegmentMeta {
  name: string;
  notes: string;
}

export interface VersionPlan {
  description: string;
  /** Track point indices where the route is split, ascending. */
  splits: number[];
  /** Segment names/notes keyed by the segment's starting point index. */
  segments: Record<number, SegmentMeta>;
}

const PREFIX = 'routeorganizer:plan';

export const emptyPlan = (): VersionPlan => ({ description: '', splits: [], segments: {} });

function key(routeId: string, versionId: string) {
  return `${PREFIX}:${routeId}:${versionId}`;
}

// Plans are kept in this browser's localStorage; storage can be unavailable (private mode etc.).
export function loadPlan(routeId: string, versionId: string): VersionPlan {
  try {
    const raw = localStorage.getItem(key(routeId, versionId));
    if (raw) return { ...emptyPlan(), ...JSON.parse(raw) };
  } catch {
    /* fall through */
  }
  return emptyPlan();
}

export function savePlan(routeId: string, versionId: string, plan: VersionPlan) {
  try {
    localStorage.setItem(key(routeId, versionId), JSON.stringify(plan));
  } catch {
    /* not persisted */
  }
}

/** Default segment name by position: Segment A, B, … Z, 27, 28, … */
export function defaultSegmentName(position: number) {
  return position < 26 ? `Segment ${String.fromCharCode(65 + position)}` : `Segment ${position + 1}`;
}

export function addSplit(plan: VersionPlan, index: number, lastIndex: number) {
  if (index <= 0 || index >= lastIndex || plan.splits.includes(index)) return;
  plan.splits = [...plan.splits, index].sort((a, b) => a - b);
}

export function removeSplit(plan: VersionPlan, index: number) {
  plan.splits = plan.splits.filter((s) => s !== index);
  // The segment that started here merges into the previous one.
  delete plan.segments[index];
}

export function moveSplit(plan: VersionPlan, from: number, to: number, lastIndex: number) {
  if (from === to || to <= 0 || to >= lastIndex || plan.splits.includes(to)) return;
  plan.splits = plan.splits.map((s) => (s === from ? to : s)).sort((a, b) => a - b);
  if (plan.segments[from]) {
    plan.segments[to] = plan.segments[from];
    delete plan.segments[from];
  }
}
