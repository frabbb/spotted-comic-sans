<script setup lang="ts">
import { useMagicMarquee } from "@maas/vue-equipment/plugins/MagicMarquee";

const props = withDefaults(
  defineProps<{
    handle: string;
  }>(),
  {
    handle: "marquee",
  },
);

const { play, pause } = useMagicMarquee(props.handle);
</script>

<template>
  <magic-marquee :id="handle">
    <slot />
  </magic-marquee>
</template>
