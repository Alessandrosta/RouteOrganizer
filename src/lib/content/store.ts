/**
 * Editable content (markdown pages, descriptions, stage plans).
 * In dev, it is read/written as files under content/ through the dev server (see vite.config.ts).
 * In a production build there is no server, so it falls back to this browser's localStorage.
 */
const useFiles = import.meta.env.DEV;
const LOCAL_PREFIX = 'routeorganizer:content:';

export const savesToFiles = useFiles;

export async function readContent(path: string): Promise<string | null> {
  if (useFiles) {
    const res = await fetch(`/api/content/${path}`, { cache: 'no-store' });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Could not load ${path} (${res.status})`);
    return res.text();
  }
  try {
    return localStorage.getItem(LOCAL_PREFIX + path);
  } catch {
    return null;
  }
}

export async function writeContent(path: string, text: string): Promise<void> {
  if (useFiles) {
    const res = await fetch(`/api/content/${path}`, { method: 'PUT', body: text });
    if (!res.ok) throw new Error(`Could not save ${path} (${res.status})`);
    return;
  }
  try {
    localStorage.setItem(LOCAL_PREFIX + path, text);
  } catch {
    throw new Error('Browser storage is unavailable; changes are not saved.');
  }
}

/** Debounced writer: rapid edits to the same path collapse into one save. */
const timers = new Map<string, ReturnType<typeof setTimeout>>();
export function writeContentSoon(path: string, text: string, delay = 400, onError?: (e: Error) => void) {
  clearTimeout(timers.get(path));
  timers.set(
    path,
    setTimeout(() => {
      timers.delete(path);
      writeContent(path, text).catch((e: Error) => onError?.(e));
    }, delay),
  );
}
