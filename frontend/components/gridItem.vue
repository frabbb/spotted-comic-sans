<script setup>
const props = defineProps({
  containerWidth: {
    type: Number,
    default: 0,
  },
  containerHeight: {
    type: Number,
    default: 0,
  },
  containerLeft: {
    type: Number,
    default: 0,
  },
  containerTop: {
    type: Number,
    default: 0,
  },
  subdivisions: {
    type: Number,
    default: 1,
  },
});

const item = ref(null);
const {
  width: itemWidth,
  height: itemHeight,
  top: itemTop,
  left: itemLeft,
} = useElementBounding(item);
</script>

<template>
  <div
    class="hover:bg-grey-100 relative grid aspect-square cursor-pointer outline"
    ref="item"
    :style="`grid-template-columns: repeat(${subdivisions}, 1fr)`"
  >
    <slot />
    <!-- <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"></div> -->
  </div>
</template>
