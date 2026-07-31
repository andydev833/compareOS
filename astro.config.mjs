// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://compare-os.example.com', // 本番URLに変更
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/company/demo-'),
    }),
  ],
  output: 'static',
});
