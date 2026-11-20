/**
 * The side menu of a route: sections (dropdowns) holding pages.
 * Each route keeps its own menu at content/routes/<route>/nav.json; a route without one
 * starts from DEFAULT_SECTIONS. Pages are markdown at content/routes/<route>/pages/<item-id>.md,
 * keyed by id so renaming an entry keeps its content.
 */
import { readContent, writeContentSoon } from './content/store';

export interface NavItem {
  id: string;
  label: string;
  /** Pre-route-menu location of this page's markdown (read only as a fallback). */
  legacy?: string;
}

export interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}

export const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'item';

/** Unique id from a label, e.g. "kit-list" or "kit-list-2". */
export function newId(label: string, taken: Iterable<string>) {
  const used = new Set(taken);
  const base = slug(label);
  let id = base;
  for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
  return id;
}

const defaults: [string, string, string[]][] = [
  ['kit', 'Kit', ['Kit list', 'Sleep system', 'Bags & packing', 'Tools & spares', 'Clothing']],
  ['planning', 'Planning', ['Dates & stages', 'Accommodation', 'Resupply & water', 'Transport & tickets', 'Budget']],
  ['route', 'Route', ['Route notes', 'Bail-out options', 'Points of interest', 'Navigation & GPS']],
  ['links', 'External links', ['Guides', 'Must-have products', 'Kit spreadsheet', 'Tickets']],
];

export function defaultSections(): NavSection[] {
  return defaults.map(([id, title, labels]) => ({
    id,
    title,
    items: labels.map((label) => ({ id: `${id}-${slug(label)}`, label, legacy: `pages/${id}/${slug(label)}.md` })),
  }));
}

export const navPath = (routeId: string) => `routes/${routeId}/nav.json`;
export const pagePath = (routeId: string, itemId: string) => `routes/${routeId}/pages/${itemId}.md`;

export async function loadNav(routeId: string): Promise<NavSection[]> {
  const json = await readContent(navPath(routeId));
  if (!json) return defaultSections();
  try {
    const data = JSON.parse(json);
    if (Array.isArray(data.sections)) return data.sections;
  } catch {
    /* fall back to defaults */
  }
  return defaultSections();
}

export function saveNav(routeId: string, sections: NavSection[], onError?: (e: Error) => void) {
  writeContentSoon(navPath(routeId), JSON.stringify({ sections }, null, 2) + '\n', 400, onError);
}

export function findItem(sections: NavSection[], itemId: string) {
  for (const section of sections) {
    const item = section.items.find((i) => i.id === itemId);
    if (item) return { section, item };
  }
  return null;
}
