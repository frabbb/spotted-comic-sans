import tailwindcss from "@tailwindcss/vite";
import tokensToTw from "gg-tailwind";
import tailwindAutoReference from "vite-plugin-vue-tailwind-auto-reference";

export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL,
      sanityApi: process.env.NUXT_PUBLIC_SANITY_API,
    },
    basicAuth: process.env.NUXT_BASIC_AUTH,
    editToken: process.env.NUXT_SANITY_EDIT_TOKEN,
  },

  nitro: { preset: process.env.NUXT_NITRO_PRESET },

  modules: [
    "@vueuse/nuxt",
    "@formkit/nuxt",
    "@nuxtjs/i18n",
    "@nuxtjs/seo",
    "@maas/vue-equipment/nuxt",
  ],

  vueEquipment: {
    plugins: ["MagicMarquee"],
  },

  i18n: {
    langDir: "labels",
    locales: [
      { code: "en", language: "en-US", file: "index.ts", name: "English" },
      // { code: "it", language: "it-IT", file: "index.ts", name: "Italian" },
    ],
    defaultLocale: "en",
    detectBrowserLanguage: {
      useCookie: false,
    },
    strategy: "no_prefix",
  },

  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tokensToTw(), tailwindAutoReference("./assets/css/main.css"), tailwindcss()],
  },

  compatibilityDate: "2025-01-31",

  site: { url: process.env.NUXT_PUBLIC_BASE_URL, name: "Spotted Comic Sans", separator: "—" },
  ogImage: { enabled: false },

  linkChecker: { enabled: false },
  devtools: { enabled: false },
  // ssr: false,
});
