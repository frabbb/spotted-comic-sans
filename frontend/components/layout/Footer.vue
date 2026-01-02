<script setup lang="ts">
const footerData = usePayload(`single-footer`);

const entry = computed(() => footerData.value.allFooter?.[0]);
const columns = computed(() => entry.value.footerColumns);
const bar = computed(() => entry.value.footerBar);
</script>

<template>
  <footer ref="footerEl">
    <div class="mt-xl gap-s p-s grid grid-cols-6">
      <template v-for="col in columns" v-if="columns?.length">
        <ElementsText
          v-bind="parsedData(col, 'textNoStyle')"
          class="typo-p s:col-span-2 col-span-6"
        />
      </template>
    </div>
  </footer>
</template>

<style lang="postcss" scoped></style>
