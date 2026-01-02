<script setup lang="ts">
import Cross from "@/assets/svg/icons/cross.svg?raw";
import Arrow from "@/assets/svg/icons/arrow.svg?raw";
import Plus from "@/assets/svg/icons/plus.svg?raw";
import Minus from "@/assets/svg/icons/minus.svg?raw";

const props = withDefaults(
  defineProps<{
    name: IconName;
    size?: number | string;
    rotate?: number | string;
  }>(),
  {
    name: "cross",
    size: 16,
    rotate: 0,
  }
);

const icons = new Map([
  ["cross", Cross],
  ["arrow", Arrow],
  ["plus", Plus],
  ["minus", Minus],
]);

const icon = computed(() => {
  const raw = icons.get(props.name);
  if (!raw) return "";
  //insert role="img" and aria-label after <svg and add <title> inside <svg> </svg>
  return raw
    .replace("<svg", `<svg role="img" aria-label="${props.name} icon"`)
    .replace("</svg>", `<title>${props.name} icon</title></svg>`);
});
</script>

<template>
  <div
    :class="['lay', 'icon', 'stroke', name]"
    :style="{
      '--size': `${size}px`,
      '--rotate': `${rotate}deg`,
    }"
    v-html="icon"
  />
</template>

<style lang="postcss">
.icon {
  display: block;
  width: var(--size);
  height: var(--size);

  svg {
    width: 100%;
    height: 100%;
    transform: rotate(var(--rotate));
    display: block;
    overflow: visible;
    fill: currentColor;
    stroke: currentColor;
  }
}
</style>
