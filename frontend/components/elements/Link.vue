<script setup lang="ts">
import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric } from "vue-router";
import { cva } from "class-variance-authority";

const props = withDefaults(
  defineProps<{
    url?: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric | null;
    replace?: boolean;
    theme?: CtaTheme;
    external?: boolean;
    disabled?: boolean;
    ariaLabel?: string;
  }>(),
  {
    url: null,
    replace: false,
    external: false,
    disabled: false,
  },
);

const component = computed(() => (props.url ? resolveComponent("NuxtLinkLocale") : "button"));
const to = computed(() => (typeof props.url === "string" ? useRelativeUrl(props.url) : props.url));
const external = computed(
  () => props.external || (typeof to.value === "string" && to.value.startsWith("http")),
);

const classes = cva("cursor-pointer text-decoration-none color-inherit uppercase w-fit", {
  variants: {
    type: {
      element: "",
      link: "flex",
      button: "grid p-xs",
    },
    variant: {
      default: "",
      underline: "underline",
      primary: "bg-black p-s",
    },
    color: {
      black: "text-black",
      white: "text-white",
    },
    size: {
      s: "typo-s",
      m: "typo-m",
      l: "typo-l",
    },
  },
  compoundVariants: [
    {
      type: "link",
      variant: "default",
      class: "hover:opacity-50",
    },
    {
      type: "button",
      variant: "default",
      class: "text-white bg-black",
    },
  ],
  defaultVariants: {
    type: "link",
    variant: "default",
    size: "s",
  },
});
</script>

<template>
  <component
    :is="component"
    :to="disabled ? undefined : to"
    :target="external ? '_blank' : '_self'"
    :external="external"
    :class="cn(classes({ ...theme }))"
    :replace
    tabindex="0"
    :aria-label="ariaLabel"
  >
    <slot />
  </component>
</template>
