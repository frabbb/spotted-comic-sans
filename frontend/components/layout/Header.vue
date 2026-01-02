<script setup lang="ts">
const headerData = usePayload(`single-header`);

const lockBody = useLock();

const siteData = usePayload(`site`);

const menuItems = computed(() => headerData.value.allHeader[0].items);

const headerEl = ref();
const { height } = useElementSize(headerEl, undefined, {
  box: "border-box",
});

watch(height, (v) => {
  useCssVar("--space-header").value = `${v}px`;
});

const showMenu = useMenu();

watch(showMenu, (v) => {
  lockBody.value = v;
});

import { useMagicMarquee } from "@maas/vue-equipment/plugins/MagicMarquee";
const showSnackbar = ref(true);

const { play, pause, increaseSpeed, decreaseSpeed } = useMagicMarquee("marquee");
</script>

<template>
  <div ref="headerEl" class="sticky top-0 z-20 bg-white">
    <header class="p-s flex justify-between">
      <ElementsLink url="/">{{ siteData?.entry?.[0].name }}</ElementsLink>
      <ElementsLink
        @click="showMenu = !showMenu"
        class="s:hidden"
        ariaLabel="toggle menu"
        :aria-expanded="showMenu"
        aria-controls="menu"
        >{{ showMenu ? $t("ctas.close") : $t("ctas.menu") }}</ElementsLink
      >
      <nav
        :class="[
          { hidden: !showMenu },
          's:block px-s s:h-auto s:relative s:w-auto s:z-auto absolute top-0 left-0 -z-10 flex h-svh w-full items-center bg-white',
        ]"
        id="menu"
      >
        <LayoutLinks :links="menuItems" theme="menu" />
      </nav>
    </header>
  </div>
</template>
