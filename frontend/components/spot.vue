<script setup lang="ts">
const props = defineProps<{
  title: string;
  member: string;
  datetime: string;
  media: any;
}>();

const zoomedIn = ref(false);
const transitioning = ref(false);

const lockBody = useLock();

watch(zoomedIn, (v) => {
  lockBody.value = v;
});

const bouding = ref({
  top: 0,
  left: 0,
  width: 0,
  height: 0,
});

function toggleZoom(e) {
  transitioning.value = true;
  const target = e.target as HTMLElement;
  const b = target.getBoundingClientRect();
  bouding.value = b;

  zoomedIn.value = !zoomedIn.value;
}
</script>

<template>
  <div
    class="group relative"
    @click="toggleZoom"
    :class="{ 'cursor-zoom-in': media && !zoomedIn, 'cursor-zoom-out': media && zoomedIn }"
  >
    <div
      class="group bg-white-transparent p-xs gap-xs absolute inset-0 hidden flex-col items-center justify-center"
    >
      <ElementsText class="text-center">{{
        member
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase())
          .join(" ")
      }}</ElementsText>
      <ElementsText class="cursor-default text-center" :theme="{ size: 'xs' }">{{
        datetime
      }}</ElementsText>
    </div>

    <div v-if="media" class="aspect-square w-full">
      <ElementsMedium :item="media" theme="fill" :class="{ 'opacity-0': media && transitioning }" />
    </div>

    <Transition name="fade">
      <div
        v-if="zoomedIn && media"
        class="p-s gap-xs fixed inset-0 z-1 flex flex-col items-center justify-end bg-white"
      >
        <ElementsText class="text-center">{{
          member
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase())
            .join(" ")
        }}</ElementsText>
        <ElementsText class="cursor-default text-center" :theme="{ size: 'xs' }">{{
          datetime
        }}</ElementsText>
      </div>
    </Transition>

    <Transition name="zoom-in" @after-leave="transitioning = false">
      <div
        :style="{
          '--top': `${bouding.top}px  `,
          '--left': `${bouding.left}px`,
          '--width': `${bouding.width}px`,
          '--height': `${bouding.height}px`,
        }"
        class="fixed inset-0 z-2 h-[calc(100svh-var(--spacing-caption))]"
        v-if="zoomedIn && media"
      >
        <ElementsMedium :item="media" />
      </div>
    </Transition>
  </div>
</template>
