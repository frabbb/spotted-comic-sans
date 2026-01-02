export default defineNuxtRouteMiddleware(async (to, from) => {
  if (to.params.slug === "home") {
    return navigateTo("/", { replace: true });
  }
});
