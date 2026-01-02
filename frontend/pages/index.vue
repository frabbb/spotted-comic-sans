<script setup>
import spotsQuery from "@/graphql/queries/sanity/entries/spots";
const { locale } = useI18n();

const entries = ref([]);

onMounted(async () => {
  nextTick(async () => {
    const variables = {
      // after: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365),
      // before: new Date(Date.now()),
    };

    const { data } = await useData({
      key: `spots`,
      query: spotsQuery(variables), // Chiama la funzione con le variabili
      variables,
      locale: locale.value,
    });

    entries.value = data?.value?.entries;
  });
});
</script>

<template>
  <main>
    <div class="gap-xs p-s grid grid-cols-8">
      <div v-for="entry in entries">
        <Spot v-bind="parsedData(entry, 'spot')" />
      </div>
    </div>
  </main>
</template>
