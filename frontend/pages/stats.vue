<script setup>
import spotsQuery from "@/graphql/queries/sanity/entries/spots";
const { locale } = useI18n();

const entries = ref([]);

const { data } = await useData({
  key: `spots`,
  query: spotsQuery(), // Chiama la funzione con le variabili
  locale: locale.value,
});

entries.value = data?.value?.entries;

const rank = computed(() => {
  const spotsByYear = entries.value.reduce(
    (acc, v) => {
      const y = new Date(v.datetime).getFullYear();

      let year = acc.find((a) => a.year === y);

      if (!year) {
        year = { year: y, members: [{ title: v.member.title, count: 1 }] };
        acc.push(year);
      } else {
        const yearMember = year.members.find((m) => m.title === v.member.title);
        if (!yearMember) {
          year.members.push({ title: v.member.title, count: 1 });
        } else {
          yearMember.count++;
        }
      }

      const allTimeMember = acc[0].members.find((m) => m.title === v.member.title);
      if (!allTimeMember) {
        acc[0].members.push({ title: v.member.title, count: 1 });
      } else {
        allTimeMember.count++;
      }

      return acc;
    },
    [{ year: "All Time", members: [] }],
  );

  spotsByYear.sort((a, b) => a.year - b.year);

  spotsByYear.forEach((year) => {
    year.members.sort((a, b) => b.count - a.count);
  });

  return spotsByYear;
});
</script>

<template>
  <main>
    <div class="gap-xl grid">
      <div v-for="year in rank">
        <div>{{ year.year }}</div>
        <div v-for="member in year.members" class="gap-xs flex items-center">
          <div>{{ member.title }}</div>
          <div>{{ member.count }}</div>
        </div>
      </div>
    </div>
  </main>
</template>
