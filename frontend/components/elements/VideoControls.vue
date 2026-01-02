<script setup lang="ts">
import { cva } from "class-variance-authority";

const props = withDefaults(
  defineProps<{
    textColor?: "white" | "black";
  }>(),
  {
    textColor: "white",
  },
);

const properties = defineModel<VideoProperties>({ required: true });

const emit = defineEmits(["togglePlay", "toggleMuted", "toggleFullscreen", "updateTime"]);

const scrubber = ref();
const { elementX, elementWidth } = useMouseInElement(scrubber);
const scrubbing = ref(false);
const pendingScrubValue = ref(0);

function formatProgress(
  progress: number,
  { hours, minutes, seconds, milliseconds } = {
    hours: false,
    minutes: true,
    seconds: true,
    milliseconds: false,
  },
) {
  const totalSeconds = Math.floor(progress / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  const ms = Math.floor((progress % 1000) / 10);

  const parts = [h, m, s, ms].filter(
    (part, index) => [hours, minutes, seconds, milliseconds][index],
  );

  return parts.map((part, index) => {
    return part.toString().padStart(2, "0");
  });
}

useEventListener("mouseup", () => (scrubbing.value = false), { passive: true });

useEventListener("touchend", () => (scrubbing.value = false), { passive: true });

watch([scrubbing, elementX], () => {
  const progress = Math.max(0, Math.min(1, elementX.value / elementWidth.value));

  pendingScrubValue.value = progress * properties.value.duration;
  if (scrubbing.value) {
    const newTime = pendingScrubValue.value / 1000;
    emit("updateTime", newTime);
    properties.value.progress = pendingScrubValue.value;
  }
});

const classes = cva("", {
  variants: {
    variant: {
      white:
        "[&_.progress-bg]:bg-white [&_.progress-bar]:bg-white bg-gradient-to-t from-black-transparent to-transparent",
      black:
        "[&_.progress-bg]:bg-black [&_.progress-bar]:bg-black bg-gradient-to-t from-white-transparent to-transparent",
    },
  },
  defaultVariants: { variant: "white" },
});
</script>

<template>
  <div
    class="p-s pt-m gap-s controls grid grid-cols-[auto_1fr_auto]"
    :class="cn(classes({ variant: textColor }))"
  >
    <!-- Left Controls -->
    <div class="time-controls gap-s flex">
      <ElementsLink
        @click="$emit('togglePlay')"
        class="lay-o grid items-center"
        :theme="{ color: textColor }"
      >
        <span :class="properties.playing ? 'invisible' : ''">{{ $t("ctas.play") }}</span>
        <span :class="properties.playing ? '' : 'invisible'">{{ $t("ctas.pause") }}</span>
      </ElementsLink>
      <ElementsLink
        @click="$emit('toggleMuted')"
        class="lay-o grid items-center"
        :theme="{ color: textColor }"
      >
        <span :class="properties.muted ? 'invisible' : ''">{{ $t("ctas.mute") }}</span>
        <span :class="properties.muted ? '' : 'invisible'">{{ $t("ctas.unmute") }}</span>
      </ElementsLink>

      <ElementsText
        :theme="{ variant: textColor, size: 's' }"
        class="grid items-center"
        :style="{
          gridTemplateColumns: formatProgress(properties.progress)
            .map(
              (part, index) =>
                `${part.length}ch${index < formatProgress(properties.progress).length - 1 ? ' auto' : ''}`,
            )
            .join(' '),
        }"
      >
        <template v-for="(part, index) in formatProgress(properties.progress)" :key="index">
          <span>{{ part }}</span>
          <span v-if="index < formatProgress(properties.progress).length - 1">:</span>
        </template>
      </ElementsText>
    </div>

    <!-- Scrubber -->
    <div
      class="group flex h-full w-full flex-1 grow-1 cursor-pointer items-center"
      ref="scrubber"
      @mousedown="scrubbing = true"
      @touchstart.passive="scrubbing = true"
    >
      <div class="relative w-full overflow-hidden rounded-(--spacing-xs)">
        <div class="progress-bg absolute top-0 left-0 h-full w-full opacity-50"></div>
        <div
          class="h-xs progress-bar w-full origin-left transition-opacity duration-100 group-hover:opacity-100"
          :class="{ 'opacity-50': !scrubbing }"
          :style="{
            transform: `scaleX(${(properties.progress / properties.duration) * 100}%)`,
          }"
        ></div>
      </div>
    </div>

    <!-- Right Controls -->
    <div class="time-controls gap-s flex">
      <ElementsLink
        @click="$emit('toggleFullscreen')"
        class="lay-o grid items-center"
        :theme="{ color: textColor }"
      >
        <span :class="properties.fullscreen ? 'invisible' : ''">{{ $t("ctas.fullscreen") }}</span>
        <span :class="properties.fullscreen ? '' : 'invisible'">{{ $t("ctas.close") }}</span>
      </ElementsLink>
    </div>
  </div>
</template>

<style lang="postcss"></style>
