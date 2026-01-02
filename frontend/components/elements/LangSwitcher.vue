<script setup lang="ts">
const { locales, locale } = useI18n();

const switchLocalePath = useSwitchLocalePath();

async function switchLang(v: "en" | "it") {
  let to = switchLocalePath(v);
  if (to.endsWith("home")) {
    to = to.replace("home", "");
  }
  if (to.endsWith("/") && to !== "/") {
    to = to.slice(0, -1);
  }

  await navigateTo(to, { replace: true });
}
</script>

<template>
  <div class="s:items-start flex items-end justify-end">
    <ElementsLink
      v-for="locale in locales?.filter((i) => i.code !== locale)"
      @click="
        () => {
          switchLang(locale.code);
        }
      "
    >
      {{ $t(locale.code) }}
    </ElementsLink>
  </div>
</template>
