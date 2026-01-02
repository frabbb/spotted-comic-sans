<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label: string;
    name: string;
    options: { value: string | number; label: string }[];
    placeholder?: string;
    theme?: string;
  }>(),
  {
    theme: "default",
  }
);
</script>

<template>
  <FormKit
    :classes="{ outer: `form-select ${theme}` }"
    type="select"
    :label
    :name
    :options
    select-icon="select"
    :placeholder
  />
</template>

<style lang="postcss">
.form-select {
  &.filter {
    .formkit-inner {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      opacity: 0;
      pointer-events: all;
    }
  }
}
</style>
