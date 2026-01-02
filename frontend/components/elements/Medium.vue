<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    item: any;
    showCaption?: boolean;
    theme?: string;
  }>(),
  {
    showCaption: false,
  },
);

const types = new Map([
  ["imageAsset", "image"],
  ["videoAsset", "video"],
]);

const components = new Map([
  ["image", resolveComponent("LazyElementsImage")],
  ["video", resolveComponent("LazyElementsVideo")],
]);
</script>

<template>
  <component
    v-if="item?.image?.asset || item?.file?.asset?.url"
    :is="components.get(types.get(item.type) || item.type)"
    v-bind="parsedData(item, types.get(item.type) || item.type)"
    :showCaption
    :theme
  />
</template>
