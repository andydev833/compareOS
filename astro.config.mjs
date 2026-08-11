// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { getSitemapLastmod } from './src/lib/sitemapLastmod.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://uto-inc.jp', // 本番URLに変更
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/company/demo-'),
      serialize(item) {
        const lastmod = getSitemapLastmod(item.url);
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ],
  output: 'static',
});
