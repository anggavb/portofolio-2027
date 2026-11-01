// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://anggavb.my.id',
  output: 'static',
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'id',
    locales: ['id', 'en'],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      filter: (page) => page !== 'https://anggavb.my.id/',
      i18n: {
        defaultLocale: 'id',
        locales: {
          id: 'id',
          en: 'en',
        },
      },
      serialize(item) {
        if (item.links && !item.links.some((link) => link.lang === 'x-default')) {
          item.links.push({
            lang: 'x-default',
            url: 'https://anggavb.my.id/id/',
          });
        }
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
