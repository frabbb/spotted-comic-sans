const overlays = new Map([["project", "projects"]]);

export default {
  routes: (routes) =>
    routes.map((route) => {
      return route.meta?.overlay
        ? {
            ...route,
            components: {
              default: () => import(`~/pages/${overlays.get(route.meta?.overlayName)}/[slug].vue`),
              overlay: () => import(`~/pages/${overlays.get(route.meta?.overlayName)}/[slug].vue`),
            },
          }
        : {
            ...route,
            components: {
              default: route.component,
              overlay: defineComponent(() => {
                return () => {
                  return h("div", { class: "overlay-placeholder" });
                };
              }),
            },
          };
    }),
  scrollBehavior: async (to, from, savedPosition) => {
    return new Promise((resolve, reject) => {
      if (savedPosition) {
        resolve(savedPosition);
      } else if (to.meta?.overlay || from.meta?.overlay) {
        resolve(false);
      } else if (to.hash) {
        const headerHeight = Number(useCssVar("--space-header").value?.replace("px", "")) || 0;

        resolve({ el: to.hash, top: headerHeight + space.value.s, behavior: "smooth" });
      } else if (from.path === to.path) {
        resolve({ top: 0, behavior: "smooth" });
      } else {
        resolve({ top: 0 });
      }
    });
  },
};
