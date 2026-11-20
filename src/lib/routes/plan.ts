/** Stage plan for one route version: split points plus stage names and notes. */
export interface StageMeta {
  name: string;
  /** Markdown. */
  notes: string;
}

export interface VersionPlan {
  /** Track point indices where the route is split into stages, ascending. */
  splits: number[];
  /** Stage names/notes keyed by the stage's starting point index. */
  stages: Record<number, StageMeta>;
}

export const emptyPlan = (): VersionPlan => ({ splits: [], stages: {} });

/** Content paths (see src/lib/content/store.ts). */
export const planPath = (routeId: string, versionId: string) => `routes/${routeId}/${versionId}/plan.json`;
export const descriptionPath = (routeId: string, versionId: string) => `routes/${routeId}/${versionId}/description.md`;

export function parsePlan(json: string | null): VersionPlan {
  if (!json) return emptyPlan();
  try {
    const data = JSON.parse(json);
    return {
      splits: Array.isArray(data.splits) ? data.splits.filter(Number.isInteger) : [],
      stages: data.stages && typeof data.stages === 'object' ? data.stages : {},
    };
  } catch {
    return emptyPlan();
  }
}

export const serializePlan = (plan: VersionPlan) => JSON.stringify(plan, null, 2) + '\n';

export const defaultStageName = (position: number) => `Stage ${position + 1}`;

export function addSplit(plan: VersionPlan, index: number, lastIndex: number) {
  if (index <= 0 || index >= lastIndex || plan.splits.includes(index)) return;
  plan.splits = [...plan.splits, index].sort((a, b) => a - b);
}

export function removeSplit(plan: VersionPlan, index: number) {
  plan.splits = plan.splits.filter((s) => s !== index);
  // The stage that started here merges into the previous one.
  delete plan.stages[index];
}

export function moveSplit(plan: VersionPlan, from: number, to: number, lastIndex: number) {
  if (from === to || to <= 0 || to >= lastIndex || plan.splits.includes(to)) return;
  plan.splits = plan.splits.map((s) => (s === from ? to : s)).sort((a, b) => a - b);
  if (plan.stages[from]) {
    plan.stages[to] = plan.stages[from];
    delete plan.stages[from];
  }
}
