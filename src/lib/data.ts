export interface NavItem {
  label: string;
  meta: string;
  href: string;
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

export const navSections: NavSection[] = [
  {
    id: 'kit',
    title: 'Kit',
    items: [
      { label: 'Kit list', meta: 'Spreadsheet ↗', href: '#' },
      { label: 'Sleep system', meta: '', href: '#' },
      { label: 'Bags & packing', meta: '', href: '#' },
      { label: 'Tools & spares', meta: '', href: '#' },
      { label: 'Clothing', meta: '', href: '#' },
    ],
  },
  {
    id: 'planning',
    title: 'Planning',
    items: [
      { label: 'Dates & stages', meta: '', href: '#' },
      { label: 'Accommodation', meta: '', href: '#' },
      { label: 'Resupply & water', meta: '', href: '#' },
      { label: 'Transport & tickets', meta: '', href: '#' },
      { label: 'Budget', meta: '', href: '#' },
    ],
  },
  {
    id: 'route',
    title: 'Route',
    items: [
      { label: 'Detailed map', meta: '', href: '#detail-map' },
      { label: 'Split at a point', meta: '', href: '#detail-map' },
      { label: 'Elevation profile', meta: '', href: '#detail-map' },
      { label: 'Download GPX', meta: '.gpx', href: '#' },
    ],
  },
  {
    id: 'links',
    title: 'External links',
    items: [
      { label: 'Guides', meta: '↗', href: '#' },
      { label: 'Must-have products', meta: '↗', href: '#' },
      { label: 'Kit spreadsheet', meta: '↗', href: '#' },
      { label: 'Tickets', meta: '↗', href: '#' },
    ],
  },
];

