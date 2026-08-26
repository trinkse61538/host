import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    {
      name: 'firebase-storage-local-proxy',
      configureServer(server) {
        server.middlewares.use('/__fetch-media', async (req, res) => {
          try {
            const requestUrl = new URL(req.url || '/', 'http://localhost');
            const target = requestUrl.searchParams.get('url');

            if (!target) {
              res.statusCode = 400;
              res.end('Missing url');
              return;
            }

            const parsed = new URL(target);
            const allowedHosts = new Set([
              'firebasestorage.googleapis.com',
              'storage.googleapis.com',
            ]);

            if (parsed.protocol !== 'https:' || !allowedHosts.has(parsed.hostname)) {
              res.statusCode = 400;
              res.end('Unsupported media host');
              return;
            }

            const upstream = await fetch(target, {
              redirect: 'follow',
              headers: {
                'user-agent': 'host-firestore-migrator/1.0',
              },
            });

            if (!upstream.ok) {
              const body = await upstream.text().catch(() => '');
              res.statusCode = upstream.status;
              res.setHeader('content-type', 'text/plain; charset=utf-8');
              res.end(body || `Firebase Storage HTTP ${upstream.status}`);
              return;
            }

            const contentType = upstream.headers.get('content-type');
            if (contentType) res.setHeader('content-type', contentType);

            const bytes = Buffer.from(await upstream.arrayBuffer());
            res.statusCode = 200;
            res.setHeader('content-length', String(bytes.length));
            res.end(bytes);
          } catch (error) {
            console.error('Media proxy error:', error);
            res.statusCode = 500;
            res.setHeader('content-type', 'text/plain; charset=utf-8');
            res.end(error instanceof Error ? error.message : String(error));
          }
        });
      },
    },
  ],
});
