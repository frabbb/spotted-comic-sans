<script setup>
const props = defineProps({
  containerWidth: {
    type: Number,
    required: true,
  },
  containerHeight: {
    type: Number,
    required: true,
  },
  containerLeft: {
    type: Number,
    required: true,
  },
  containerTop: {
    type: Number,
    required: true,
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
  <div class="hover:bg-grey-100 relative aspect-square cursor-pointer border" ref="item">
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full">
      <p class="w-full text-center text-[14px]">
        {{ (((itemLeft + itemWidth / 2 - containerLeft) / containerWidth) * 100).toFixed(2) }}
        <br />
        {{ (((itemTop + itemHeight / 2 - containerTop) / containerHeight) * 100).toFixed(2) }}
      </p>
    </div>
  </div>
</template>
