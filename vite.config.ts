import { defineConfig, type Plugin } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONTENT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), 'content');
const SAFE_PATH = /^[a-z0-9][a-z0-9_-]*(\/[a-z0-9][a-z0-9_-]*)*\.(md|json)$/i;
const MAX_BYTES = 2 * 1024 * 1024;

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
          const chunks: Buffer[] = [];
          let size = 0;
          for await (const chunk of req) {
            size += (chunk as Buffer).length;
            if (size > MAX_BYTES) {
              res.statusCode = 413;
              res.end('Too large');
              return;
            }
            chunks.push(chunk as Buffer);
          }
          await mkdir(dirname(file), { recursive: true });
          await writeFile(file, Buffer.concat(chunks).toString('utf8'), 'utf8');
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
  plugins: [svelte(), contentStore()],
  server: {
    // Content is fetched at runtime, not imported: editing it must not reload the page.
    watch: { ignored: ['**/content/**'] },
  },
  build: {
    // Route track files are large but lazily loaded.
    chunkSizeWarningLimit: 3000,
  },
});
