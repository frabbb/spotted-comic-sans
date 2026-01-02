<script setup lang="ts">
import { cva } from "class-variance-authority";

const props = withDefaults(
  defineProps<{
    type: EntryType;
    url: string;
    title: string;
    subtitle?: string;
    medium?: any;
    theme?: BillboardTheme;
  }>(),
  {}
);

const classes = cva(
  "", //always applied
  {
    variants: {
      type: {
        page: "",
        post: "",
      },
      variant: {
        default: "",
        small: "",
      },
    },
    defaultVariants: {
      type: "page",
      variant: "default",
    },
  }
);

const hasMedium = props.medium.image || props.medium.src ? true : false;
</script>

<template>
  <ElementsLink :url :class="cn(classes({ type, variant: theme }))">
    <div :class="['lay lay-o', 'billboard-content']">
      <ElementsMedium v-if="hasMedium" :item="medium" theme="fill" class="medium" />

      <div class="text-content gap-s p-s lay">
        <ElementsText tag="h2" class="t-center">
          {{ title }}
        </ElementsText>
        <ElementsText v-if="subtitle" tag="h3" class="t-center">
          <div class="t-balance">
            {{ subtitle }}
          </div>
        </ElementsText>
      </div>
    </div>
  </ElementsLink>
</template>

<style lang="postcss" scoped>
.placeholder {
  background: var(--color-grey);
  width: 100%;
}

.billboard-content {
  .text-content {
    z-index: 1;
  }
}
</style>
