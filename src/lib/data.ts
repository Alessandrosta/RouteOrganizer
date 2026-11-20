export interface NavItem {
  label: string;
  /** Page slug; its markdown lives at content/pages/<section>/<slug>.md */
  slug: string;
}

export interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}

export interface Stat {
  label: string;
  value: string;
}

const item = (label: string): NavItem => ({
  label,
  slug: label
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, ''),
});

export const navSections: NavSection[] = [
  {
    id: 'kit',
    title: 'Kit',
    items: ['Kit list', 'Sleep system', 'Bags & packing', 'Tools & spares', 'Clothing'].map(item),
  },
  {
    id: 'planning',
    title: 'Planning',
    items: ['Dates & stages', 'Accommodation', 'Resupply & water', 'Transport & tickets', 'Budget'].map(item),
  },
  {
    id: 'route',
    title: 'Route',
    items: ['Route notes', 'Bail-out options', 'Points of interest', 'Navigation & GPS'].map(item),
  },
  {
    id: 'links',
    title: 'External links',
    items: ['Guides', 'Must-have products', 'Kit spreadsheet', 'Tickets'].map(item),
  },
];

export function pagePath(sectionId: string, slug: string) {
  return `pages/${sectionId}/${slug}.md`;
}

export function findPage(sectionId: string, slug: string) {
  const section = navSections.find((s) => s.id === sectionId);
  const page = section?.items.find((i) => i.slug === slug);
  return section && page ? { section, page } : null;
}
