import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'generate-seo-and-manifest',
      closeBundle() {
        const distDir = path.resolve(__dirname, 'dist');
        if (!fs.existsSync(distDir)) {
          fs.mkdirSync(distDir, { recursive: true });
        }

        const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://examverse-1tw.pages.dev/</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

        fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf-8');

        const manifestSrc = path.resolve(__dirname, 'manifest.json');
        if (fs.existsSync(manifestSrc)) {
          fs.copyFileSync(manifestSrc, path.join(distDir, 'manifest.json'));
        }
      },
    },
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
