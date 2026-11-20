import { defineConfig, type Plugin } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = resolve(ROOT, 'content');
const ROUTES_DIR = resolve(ROOT, 'routes');
const SAFE_PATH = /^[a-z0-9][a-z0-9_-]*(\/[a-z0-9][a-z0-9_-]*)*\.(md|json)$/i;
const MAX_BYTES = 2 * 1024 * 1024;
const MAX_TRACK_BYTES = 30 * 1024 * 1024;

async function readBody(req: AsyncIterable<unknown>, limit: number): Promise<string | null> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > limit) return null;
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString('utf8');
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'route';

/**
 * Dev-server endpoint that creates a new route folder from an uploaded track:
 *   POST /api/routes  { name, start, finish, fileName, content }
 *   → routes/<id>/route.json + routes/<id>/versions/v1.<gpx|tcx>, responds { id }
 */
function routeCreator(): Plugin {
  return {
    name: 'route-creator',
    configureServer(server) {
      server.middlewares.use('/api/routes', async (req, res) => {
        const fail = (status: number, message: string) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: message }));
        };
        if (req.method !== 'POST') return fail(405, 'Method not allowed');

        const body = await readBody(req, MAX_TRACK_BYTES);
        if (body === null) return fail(413, 'The track file is too large (max 30 MB).');
        let data: { name?: unknown; start?: unknown; finish?: unknown; fileName?: unknown; content?: unknown };
        try {
          data = JSON.parse(body);
        } catch {
          return fail(400, 'Invalid request');
        }
        const text = (v: unknown, max = 120) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
        const name = text(data.name);
        const ext = text(data.fileName).toLowerCase().match(/\.(gpx|tcx)$/)?.[1];
        if (!name) return fail(400, 'Please give the route a name.');
        if (!ext) return fail(400, 'Only .gpx and .tcx files are supported.');
        if (typeof data.content !== 'string' || !data.content.trim()) return fail(400, 'The track file is empty.');

        const taken = new Set(await readdir(ROUTES_DIR).catch(() => [] as string[]));
        const base = slugify(name);
        let id = base;
        for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;

        const manifest = {
          name,
          start: text(data.start) || 'Start',
          finish: text(data.finish) || 'Finish',
          created: new Date().toISOString(),
          versions: [{ id: 'v1', label: 'Version 1', note: 'original', file: `v1.${ext}` }],
        };
        await mkdir(join(ROUTES_DIR, id, 'versions'), { recursive: true });
        await writeFile(join(ROUTES_DIR, id, 'versions', `v1.${ext}`), data.content, 'utf8');
        await writeFile(join(ROUTES_DIR, id, 'route.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ id }));
      });
    },
  };
}

/**
 * Dev-server endpoint that reads and writes the editable content (markdown pages,
 * route descriptions, stage plans) as files under content/, so they live in git.
 *   GET /api/content/<path>  → file text, or 404
 *   PUT /api/content/<path>  → write file (body = text)
 */
function contentStore(): Plugin {
  return {
    name: 'content-store',
    configureServer(server) {
      server.middlewares.use('/api/content/', async (req, res) => {
        const rel = decodeURIComponent((req.url ?? '').split('?')[0]).replace(/^\/+/, '');
        if (!SAFE_PATH.test(rel)) {
          res.statusCode = 400;
          res.end('Invalid content path');
          return;
        }
        const file = join(CONTENT_DIR, rel);

        if (req.method === 'GET') {
          try {
            const text = await readFile(file, 'utf8');
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.setHeader('Cache-Control', 'no-store');
            res.end(text);
          } catch {
            res.statusCode = 404;
            res.end();
          }
          return;
        }

        if (req.method === 'PUT') {
          const text = await readBody(req, MAX_BYTES);
          if (text === null) {
            res.statusCode = 413;
            res.end('Too large');
            return;
          }
          await mkdir(dirname(file), { recursive: true });
          await writeFile(file, text, 'utf8');
          res.statusCode = 204;
          res.end();
          return;
        }

        res.statusCode = 405;
        res.end();
      });
    },
  };
}

export default defineConfig({
  plugins: [svelte(), contentStore(), routeCreator()],
  server: {
    // Content is fetched at runtime, not imported: editing it must not reload the page.
    watch: { ignored: ['**/content/**'] },
  },
  build: {
    // Route track files are large but lazily loaded.
    chunkSizeWarningLimit: 3000,
  },
});
