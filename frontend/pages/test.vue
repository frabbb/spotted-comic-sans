<script setup>
const gridContainer = ref(null);
const items = ref(null);

const subdivisions = 6;

const {
  width: containerWidth,
  height: containerHeight,
  left: containerLeft,
  top: containerTop,
} = useElementBounding(gridContainer);

const { width: windowWidth, height: windowHeight } = useWindowSize();

const lockBody = useLock();

const transformOrigin = ref({ x: 0, y: 0 });
const transform = ref({ scale: 1, translate: { x: 0, y: 0 } });

function zoomOnSpot(id) {
  const spot = document.getElementById(id);
  lockBody.value = true;
  if (spot) {
    const { top, left, width, height } = spot.getBoundingClientRect();
    const center = {
      x: left + width / 2,
      y: top + height / 2,
    };

    const targetOrigin = {
      x: ((center.x - containerLeft.value) / containerWidth.value) * 100,
      y: ((center.y - containerTop.value) / containerHeight.value) * 100,
    };

    const targetScale = Math.min(windowWidth.value / width, windowHeight.value / height);

    const targetTranslate = {
      x: -(center.x - windowWidth.value / 2),
      y: -(center.y - windowHeight.value / 2),
    };

    transformOrigin.value = targetOrigin;
    transform.value = { scale: targetScale, translate: targetTranslate };
  }
}
</script>

<template>
  <div
    ref="gridContainer"
    :style="{
      gridTemplateColumns: `repeat(${subdivisions},1fr)`,
      transformOrigin: `${transformOrigin.x}% ${transformOrigin.y}%`,
      transform: `translate(${transform.translate.x}px, ${transform.translate.y}px) scale(${transform.scale})`,
    }"
    class="relative grid transition-transform duration-500"
  >
    <div
      class="h-s w-s absolute z-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[red] transition-all duration-150"
      :style="{ top: `${transformOrigin.y}%`, left: `${transformOrigin.x}%` }"
    ></div>

    <GridItem
      v-for="(i, index) in Array.from({ length: subdivisions * subdivisions })"
      @click="zoomOnSpot(index)"
      :id="index"
      :containerWidth="containerWidth"
      :containerHeight="containerHeight"
      :containerLeft="containerLeft"
      :containerTop="containerTop"
    />
  </div>
</template>
