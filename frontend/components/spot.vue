<script setup lang="ts">
const props = defineProps<{
  id: string;
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
</script>

<template>
  <div class="group relative" :id="id">
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
      <ElementsMedium :item="media" theme="fit" :class="{ 'opacity-0': media && transitioning }" />
    </div>

    <Transition name="fade">
      <div
        v-if="zoomedIn && media"
        class="p-s gap-xs fixed inset-0 z-10 flex flex-col items-center justify-end bg-white"
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
  </div>
</template>
