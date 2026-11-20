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

export interface RouteVersion {
  id: string;
  label: string;
  note: string;
  /** Full route path on the overview map (viewBox 1000×540). */
  full: string;
  /** Route split into two segments on the detail map (viewBox 1000×480). */
  segA: string;
  segB: string;
  /** Split point position. */
  sx: number;
  sy: number;
  /** Segment label positions. */
  ax: number;
  ay: number;
  bx: number;
  by: number;
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

export const routeVersions: RouteVersion[] = [
  {
    id: 'v1',
    label: 'Version 1',
    note: 'main',
    full: 'M110,300 C150,270 190,290 230,250 S290,220 330,240 S390,300 430,280 S480,220 530,230 S590,280 630,260 S690,200 740,230 S800,300 850,280 S900,240 920,250',
    segA: 'M110,300 C150,270 190,290 230,250 S290,220 330,240 S390,300 430,280 S480,220 530,230',
    segB: 'M530,230 C580,240 590,280 630,260 S690,200 740,230 S800,300 850,280 S900,240 920,250',
    sx: 530, sy: 230, ax: 300, ay: 196, bx: 760, by: 320,
  },
  {
    id: 'v2',
    label: 'Version 2',
    note: '[variant]',
    full: 'M110,300 C160,330 200,370 260,380 S360,400 420,390 S500,350 540,370 S620,420 680,400 S760,340 820,330 S900,280 920,250',
    segA: 'M110,300 C160,330 200,370 260,380 S360,400 420,390 S500,350 540,370',
    segB: 'M540,370 C580,390 620,420 680,400 S760,340 820,330 S900,280 920,250',
    sx: 540, sy: 370, ax: 300, ay: 360, bx: 730, by: 425,
  },
  {
    id: 'v3',
    label: 'Version 3',
    note: '[variant]',
    full: 'M110,300 C150,250 200,210 260,190 S360,170 420,180 S500,200 560,170 S660,140 720,160 S840,210 920,250',
    segA: 'M110,300 C150,250 200,210 260,190 S360,170 420,180 S500,200 560,170',
    segB: 'M560,170 C620,140 660,140 720,160 S840,210 920,250',
    sx: 560, sy: 170, ax: 300, ay: 160, bx: 760, by: 215,
  },
];

export const mapLayers = ['CyclOSM', 'OpenTopoMap', 'Satellite'] as const;
export type MapLayer = (typeof mapLayers)[number];

export const tripStats: Stat[] = [
  { label: 'Distance', value: '[—] km' },
  { label: 'Climbing', value: '[—] m' },
  { label: 'Stages', value: '[—]' },
];

export const segmentStats: Stat[] = [
  { label: 'Distance', value: '[—] km' },
  { label: 'Climbing', value: '[—] m' },
  { label: 'Descent', value: '[—] m' },
  { label: 'Max elev.', value: '[—] m' },
  { label: 'Max grade', value: '[—] %' },
  { label: 'Est. time', value: '[—] h' },
];
