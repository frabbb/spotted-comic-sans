export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("i18n:beforeLocaleSwitch", async (switcher) => {
    // await useSingles(switcher.newLocale);
  });
});
