<script setup lang="ts"></script>

<template>
  <div class="skeleton">
    <ElementsImage :ratio="[16, 9]" theme="skeleton" />
    <ElementsText tag="h3" class="text">   </ElementsText>
  </div>
</template>

<style lang="postcss" scoped>
.skeleton {
  .text {
    background: var(--color-grey);
    width: 50%;
  }
}
</style>
