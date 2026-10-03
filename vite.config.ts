import path from 'path';
import { fileURLToPath } from 'url';
import type { Plugin } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';

const immutableCache = 'public, max-age=31536000, immutable';
const rootDir = path.dirname(fileURLToPath(import.meta.url));

const productionCacheHeaders = (): Plugin => ({
  name: 'production-cache-headers',
  configurePreviewServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = req.url ?? '';
      if (url.startsWith('/assets/') || /\.(js|css|woff2|webp|png|jpg|svg)$/i.test(url)) {
        res.setHeader('Cache-Control', immutableCache);
      } else if (url === '/' || url.endsWith('.html')) {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      }
      next();
    });
  }
});


/* Precarga la fuente principal (titulos del hero) para que el primer texto grande aparezca antes. */
const preloadDisplayFont = (): Plugin => ({
  name: 'preload-display-font',
  apply: 'build',
  transformIndexHtml: {
    order: 'post',
    handler(_html, ctx) {
      const fontFile = Object.keys(ctx.bundle ?? {}).find((fileName) => /bricolage-grotesque-latin-wght-normal.*.woff2$/.test(fileName));
      if (!fontFile) return [];
      return [
        {
          tag: 'link',
          attrs: { rel: 'preload', href: '/' + fontFile, as: 'font', type: 'font/woff2', crossorigin: '' },
          injectTo: 'head-prepend'
        }
      ];
    }
  }
});

/*
  SEO: inserta el dominio publico (VITE_SITE_URL) en index.html y genera robots.txt y sitemap.xml.
  Sin dominio configurado se quitan las etiquetas que exigen URL absoluta, para no publicar una URL falsa.
*/
const seoFiles = (siteUrlRaw: string): Plugin => {
  const siteUrl = siteUrlRaw.trim().replace(/\/+$/, '');
  const absoluteOnly = /^\s*<(link rel="canonical"|meta property="og:(url|image)"|meta name="twitter:image")[^>]*%SITE_URL%[^>]*>\s*$/;

  return {
    name: 'seo-files',
    transformIndexHtml(html) {
      if (siteUrl) return html.split('%SITE_URL%').join(siteUrl);
      return html
        .split('\n')
        .filter((line) => !absoluteOnly.test(line))
        .join('\n')
        .split('%SITE_URL%')
        .join('');
    },
    generateBundle() {
      const today = new Date().toISOString().slice(0, 10);
      const robots = ['User-agent: *', 'Allow: /', 'Disallow: /db/', siteUrl ? `Sitemap: ${siteUrl}/sitemap.xml` : '']
        .filter(Boolean)
        .join('\n');
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `${robots}\n` });

      if (!siteUrl) {
        this.warn('VITE_SITE_URL no esta definido: se omiten canonical, og:url, og:image y sitemap.xml.');
        return;
      }

      const sitemap = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        '  <url>',
        `    <loc>${siteUrl}/</loc>`,
        `    <lastmod>${today}</lastmod>`,
        '    <changefreq>weekly</changefreq>',
        '    <priority>1.0</priority>',
        '  </url>',
        '</urlset>',
        ''
      ].join('\n');
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap });
    }
  };
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isProduction = mode === 'production';

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      watch: {
        ignored: [
          '**/invitaciones/**',
          '**/db/invitaciones/**',
          '**/invitacion_plantilla/**',
          '**/plantilla/**',
          '**/laboratorio/dist/**',
          '**/laboratorio/node_modules/**',
          '**/.codex-tmp/**',
          '**/.lighthouseci/**',
          '**/.tmp-static-migration/**',
        ],
      },
      warmup: {
        clientFiles: ['./index.tsx', './App.tsx', './components/landing/*.tsx']
      },
    },
    optimizeDeps: {
      // Por defecto Vite rastrea TODOS los .html del proyecto (incluidas invitaciones generadas).
      entries: ['index.html'],
      include: ['react', 'react-dom', 'react-dom/client', 'motion/react']
    },
    plugins: [
      tailwindcss(),
      react(),
      isProduction &&
        viteCompression({
          algorithm: 'brotliCompress',
          ext: '.br',
          threshold: 1024
        }),
      isProduction &&
        viteCompression({
          algorithm: 'gzip',
          ext: '.gz',
          threshold: 1024
        }),
      productionCacheHeaders(),
      preloadDisplayFont(),
      seoFiles(env.VITE_SITE_URL ?? '')
    ].filter(Boolean),
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(rootDir, '.')
      }
    },
    build: {
      cssCodeSplit: true,
      // Las imagenes nunca se incrustan en base64 dentro del JS: pesan mas y bloquean el arranque.
      assetsInlineLimit: (filePath: string) => (/.(webp|png|jpe?g|gif|svg)$/i.test(filePath) ? false : undefined),
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              const normalizedId = id.replace(/\\/g, '/');
              if (/\/node_modules\/(react|react-dom|scheduler)\//.test(normalizedId)) return 'react-vendor';
              if (id.includes('xlsx')) return 'xlsx';
              if (id.includes('@google/genai')) return 'genai';
            }
            // Las paginas (panel, precios, secciones inferiores) se dividen solas con React.lazy.
            // Forzarlas a chunks manuales hacia que el HTML inicial las precargara.
          }
        }
      }
    }
  };
});
