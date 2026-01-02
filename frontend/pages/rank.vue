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

const cssColors = [
  "red",
  "purple",
  "fuchsia",
  "green",
  "lime",
  "olive",
  "yellow",
  "navy",
  "blue",
  "teal",
  "aqua",
  "maroon",
];

const allMembers = entries.value.reduce(
  (acc, e) =>
    acc.find((m) => m.title === e.member.title)
      ? acc
      : [
          ...acc,
          {
            title: e.member.title,
            color: "white" || cssColors[Math.floor(Math.random() * cssColors.length)],
          },
        ],
  [],
);

const allYears = entries.value.reduce(
  (acc, e) => {
    const year = new Date(e.datetime).getFullYear();
    return acc.find((y) => y.value === year) ? acc : [...acc, { label: year, value: year }];
  },
  [{ label: "All time", value: undefined }],
);

const currentYear = ref(2025);
const speed = ref(6);
const startDate = computed(() => {
  const spotsOfYear = entries.value.filter((e) =>
    currentYear.value ? new Date(e.datetime).getFullYear() === currentYear.value : true,
  );
  return new Date(Math.min(...spotsOfYear.map((e) => new Date(e.datetime))));
});
const endDate = computed(
  () =>
    new Date(
      currentYear.value || Math.max(...allYears.filter((y) => y.value).map((y) => y.value)),
      11,
      31,
    ),
);
const currentDate = ref(startDate.value);

const primaryColorMap = {
  2025: "yellow",
  2024: "cyan",
  2023: "greenyellow",
  2022: "red",
  all: "springgreen",
};

const secondaryColorMap = {
  2025: "blue",
  2024: "purple",
  2023: "red",
  2022: "indigo",
  all: "deeppink",
};

const primaryColor = computed(() => {
  return primaryColorMap[currentYear.value || "all"];
});

const secondaryColor = computed(() => {
  return secondaryColorMap[currentYear.value || "all"];
});

const rank = computed(() => {
  const currentEntries = entries.value.filter(
    (v) => new Date(v.datetime) >= startDate.value && new Date(v.datetime) <= currentDate.value,
  );

  const members = currentEntries.reduce((acc, v) => {
    const member = acc.find((m) => m.title === v.member.title);

    if (!member) {
      acc.push({ title: v.member.title, count: 1 });
    } else {
      member.count++;
    }

    return acc;
  }, []);

  members.sort((a, b) => b.count - a.count);

  return members;
});

const { width: windowWidth } = useWindowSize();

const maxFontSize = computed(() => {
  return windowWidth.value * 0.075;
});

const minFonSize = 15;

useRafFn(() => {
  //add one hour to the current date
  const nextDate = new Date(currentDate.value.getTime() + speed.value * 60 * 60 * 1000);
  if (nextDate <= endDate.value) {
    currentDate.value = nextDate;
  }
});

function formatDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function findMemberIndex(member) {
  return rank.value.findIndex((m) => m.title === member.title);
}

function findMember(member) {
  return rank.value.find((m) => m.title === member.title);
}

const maxCount = computed(() => {
  return Math.max(...rank.value.map((member) => member.count));
});

function getTopPosition(index) {
  return rank.value
    .slice(0, index)
    .reduce(
      (acc, member) =>
        acc + map(member?.count, 0, maxCount.value, minFonSize, maxFontSize.value) + 10,
      0,
    );
}

function changeYear(event) {
  nextTick(() => {
    console.log(startDate.value, endDate.value);
    currentDate.value = startDate.value;
  });
}
</script>

<template>
  <main
    class="min-h-screen"
    :style="{ '--primary-color': `${primaryColor}`, '--secondary-color': `${secondaryColor}` }"
  >
    <div
      class="fixed top-0 left-0 -z-1 h-full w-full"
      :style="{ backgroundColor: `${primaryColor}` }"
    ></div>

    <div class="p-s pb-l">
      <div class="pb-xl s:min-h-[50vh] grid content-start justify-center">
        <ElementsText class="w-full text-center" :theme="{ size: 'l' }"
          >Spotted Comic Sans Wrapped</ElementsText
        >
        <select v-model="currentYear" @change="changeYear" id="year">
          <option v-for="year in allYears" :value="year.value">
            {{ year.label }}
          </option>
        </select>
        <label for="year" class="typo-xs text-center">Select Year</label>
      </div>

      <div
        class="p-s sticky top-0 z-1 w-full text-center"
        :style="{ backgroundColor: `${primaryColor}` }"
      >
        <p class="typo-l" :style="{ color: `${secondaryColor}` }">
          {{ formatDate(currentDate) }}
        </p>
      </div>

      <div class="relative w-full" :style="{ height: `${getTopPosition(rank.length - 1)}px` }">
        <div
          v-for="member in allMembers"
          class="px-s absolute top-0 left-1/2 flex w-full items-center transition-all duration-150"
          :style="{ transform: `translate(-50%, ${getTopPosition(findMemberIndex(member))}px)` }"
          :class="{ hidden: !findMember(member) }"
        >
          <p
            class="typo-xs w-full text-center transition-all duration-150"
            :style="{
              fontSize: `${map(findMember(member)?.count, 0, maxCount, minFonSize, maxFontSize)}px`,
            }"
          >
            <span :style="{ fontSize: `${minFonSize}px` }">{{ findMemberIndex(member) + 1 }}.</span>
            {{ member.title }}
            <span :style="{ color: `${secondaryColor}` }">
              {{ findMember(member)?.count }}
            </span>
          </p>
        </div>
      </div>
    </div>
  </main>
</template>

<style lang="postcss" scoped>
select {
  appearance: none;
  cursor: pointer;
  font-family: Comic Sans MS;
  font-size: 20vw;
  line-height: 1;
  outline: none;
  text-align: center;
  color: var(--secondary-color);

  label {
    display: block;
  }

  @media (hover: hover) {
    &:hover {
      color: black;
    }
  }
}
</style>
