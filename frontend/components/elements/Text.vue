<script setup lang="ts">
import { cva } from "class-variance-authority";

const props = withDefaults(
  defineProps<{
    text?: string;
    tag?: string;
    theme?: TextTheme;
  }>(),
  {
    text: "",
    tag: "p",
  },
);

const classes = cva("", {
  variants: {
    size: {
      xs: "typo-xs",
      s: "typo-s",
      m: "typo-m",
      l: "typo-l",
      xl: "typo-xl",
      "2xl": "typo-2xl",
    },
    variant: {
      black: "text-black",
      white: "text-white",
      lightcyan: "text-[lightcyan]",
      lightgreen: "text-[lightgreen]",
      lightyellow: "text-[lightyellow]",
      lightcoral: "text-[lightcoral]",
      lightred: "text-white",
    },
  },
  defaultVariants: {
    variant: "black",
    size: "s",
  },
});
</script>

<template>
  <div v-if="text" v-html="text" :class="['text', cn(classes({ ...theme }))]" />
  <component v-else :is="tag" :class="['text', cn(classes({ ...theme }))]">
    <slot />
  </component>
</template>

<style lang="postcss" scoped>
.text {
  white-space: pre-wrap;
}

:deep(a) {
  text-decoration: underline;
  cursor: pointer;
}
</style>
