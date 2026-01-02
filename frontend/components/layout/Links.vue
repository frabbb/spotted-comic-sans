<script setup lang="ts">
import { cva } from "class-variance-authority";

const props = withDefaults(
  defineProps<{
    links: any[];
    theme?: LinksTheme;
  }>(),
  {},
);

const showMenu = useMenu();

function handleLinkClick(url: string) {
  const relativeUrl = useRelativeUrl(url);

  if (useRoute().path === relativeUrl) {
    showMenu.value = false;
  }
}

const classes = cva("gap-s", {
  variants: {
    variant: {
      horizontal: "flex",
      vertical: "lay-v",
      menu: "flex flex-col s:flex-row",
    },
  },
  defaultVariants: {
    variant: "horizontal",
  },
});
</script>

<template>
  <ul :class="cn(classes({ variant: theme }))">
    <li v-for="link in props.links" :key="link.id" class="w-fit">
      <ElementsLink
        :theme="{
          type: 'link',
          size: 's',
        }"
        :url="parsedData(link, 'link')?.url"
        @click.prevent="handleLinkClick(parsedData(link, 'link')?.url)"
      >
        {{ parsedData(link, "link")?.text }}
      </ElementsLink>
    </li>
  </ul>
</template>
