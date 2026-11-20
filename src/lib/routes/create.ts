import { routes } from './catalog';

const PENDING = 'routeorganizer:routes-before-create';

/**
 * Creating a route writes into routes/, and the dev server reloads the page to pick it up,
 * possibly before our request returns. So the ids that existed before are remembered, and
 * after the reload the app jumps to the route that is new.
 */
export function takeCreatedRouteId(): string | null {
  try {
    const before = sessionStorage.getItem(PENDING);
    if (!before) return null;
    sessionStorage.removeItem(PENDING);
    const known: string[] = JSON.parse(before);
    return routes.find((r) => !known.includes(r.id))?.id ?? null;
  } catch {
    return null;
  }
}

function remember(on: boolean) {
  try {
    if (on) sessionStorage.setItem(PENDING, JSON.stringify(routes.map((r) => r.id)));
    else sessionStorage.removeItem(PENDING);
  } catch {
    /* storage unavailable: the reload just shows the first route */
  }
}

/** Whether new routes can be created here (needs the dev server, which writes routes/<id>/). */
export const canCreateRoutes = import.meta.env.DEV;

export interface NewRoute {
  name: string;
  start: string;
  finish: string;
  file: File;
}

/** Creates routes/<id>/ with route.json and versions/v1.<ext>; resolves to the new route id. */
export async function createRoute({ name, start, finish, file }: NewRoute): Promise<string> {
  if (!canCreateRoutes) throw new Error('Adding routes needs the dev server: run "npm run dev".');
  const content = await file.text();
  remember(true);
  try {
    const res = await fetch('/api/routes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, start, finish, fileName: file.name, content }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? `Could not create the route (${res.status})`);
    return data.id;
  } catch (e) {
    remember(false);
    throw e;
  }
}
