<script setup lang="ts">
import { cva } from "class-variance-authority";

const props = withDefaults(
  defineProps<{
    embed: string;
    theme?: EmbedTheme;
  }>(),
  {
    embed: "",
  }
);

const classes = cva(
  "", //always applied
  {
    variants: {
      variant: {
        default: "[&_iframe]:aspect-16/9 [&_iframe]:w-full [&_iframe]:h-auto",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
</script>

<template>
  <div v-html="embed" :class="[cn(classes({ variant: theme }))]" />
</template>
