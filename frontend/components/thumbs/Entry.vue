<script setup lang="ts">
import { cva } from "class-variance-authority";

const props = withDefaults(
  defineProps<{
    url: string;
    title: string;
    medium: any;
    theme?: ThumbTheme;
  }>(),
  {},
);

const classes = cva(
  "w-full [&_div]:w-full", //always applied
  {
    variants: {
      variant: {
        stack: "",
        archive: "",
      },
    },
    defaultVariants: {
      variant: "archive",
    },
  },
);

const hasMedium = props.medium.default?.asset || props.medium.src ? true : false;
</script>

<template>
  <ElementsLink :url :theme="{ type: 'element' }" :class="cn(classes({ variant: theme }))">
    <div class="lay lay-o relative content-start items-end">
      <ElementsMedium v-if="hasMedium" :item="medium" class="medium" />
      <div v-else class="aspect-[4/5] w-full bg-black opacity-25" />
      <ElementsText tag="h3" :theme="{ variant: 'white', size: 'l' }" class="p-s s:sticky bottom-0">
        {{ title }}
      </ElementsText>
    </div>
  </ElementsLink>
</template>
