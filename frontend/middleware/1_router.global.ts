export default defineNuxtRouteMiddleware(async (to, from) => {
  if (to.hash === "#cookie-policy" && import.meta.client) {
    window._iub.cs.api.openPreferences();
    return abortNavigation();
  }

  const showMenu = useMenu();
  showMenu.value = false;
});
