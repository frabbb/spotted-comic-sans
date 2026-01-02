<script setup lang="ts">
const { group } = defineProps<{
  group?: string;
}>();

const accordionEl = ref();
const contentEl = ref();
const { height } = useElementSize(contentEl);

const open = ref(false);
const isDispatching = ref(false);

const { height: windowHeight, width: windowWidth } = useWindowSize();

onMounted(() => {
  if (group) {
    window.addEventListener("accordion", (e) => {
      if (!isDispatching.value && e instanceof CustomEvent && e.detail.group === group) {
        open.value = false;
      }
    });
  }

  watch(
    [open, windowHeight, windowWidth],
    ([v]) => {
      if (v) {
        if (group) {
          isDispatching.value = true;
          window.dispatchEvent(new CustomEvent("accordion", { detail: { group } }));
          isDispatching.value = false;
        }
        useCssVar("--spacing-content", accordionEl).value = `${height.value}px`;
      } else {
        useCssVar("--spacing-content", accordionEl).value = "0px";
      }
    },
    { immediate: true }
  );
});

function handleClick() {
  open.value = !open.value;
}
</script>

<template>
  <div ref="accordionEl" class="border-lightgrey grid border-t-1">
    <ElementsLink @click="handleClick">
      <div class="relative grid items-center">
        <slot name="label" />
        <ElementsIcon :name="open ? 'minus' : 'plus'" class="absolute right-0" />
      </div>
    </ElementsLink>
    <div class="h-[var(--spacing-content)] overflow-y-hidden motion-safe:transition-[height]">
      <div ref="contentEl">
        <slot name="content" />
      </div>
    </div>
  </div>
</template>
