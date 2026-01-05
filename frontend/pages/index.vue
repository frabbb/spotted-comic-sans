<script setup>
import spotsQuery from "~/graphql/queries/sanity/entries/spots";
const { locale } = useI18n();

const search = ref("");
const entries = ref([]);
const chunkSize = 100;
const limit = ref(chunkSize);
const offset = ref(0);
const loading = ref(false);
const pendingLoadMore = ref(false);

const loadMoreEl = ref(null);

const placeholderTextVariants = [
  "Look for any Comic Sans word",
  `"Bar", "Tabacchi", "Pizzeria"`,
  "Has this already been spotted?",
  `"Helvetica Sucks"`,
  "Search any word...",
  "Regina, the queen of Comic Sans",
];

const placeholderText = ref("");
const nextPlaceholderText = ref(placeholderTextVariants[0]);

onMounted(() => {
  typeWord(nextPlaceholderText.value);
});

function clearPlaceholderText() {
  const typingInterval = setInterval(() => {
    placeholderText.value = placeholderText.value.slice(0, -1);
    if (placeholderText.value.length === 0) {
      clearInterval(typingInterval);

      typeWord(nextPlaceholderText.value);
    }
  }, 20);
}

function typeWord(wordToType) {
  const typingInterval = setInterval(() => {
    placeholderText.value = placeholderText.value + wordToType[placeholderText.value.length];
    if (placeholderText.value.length === wordToType.length) {
      clearInterval(typingInterval);

      setTimeout(() => {
        clearPlaceholderText();
      }, 3000);
    }
  }, 75);

  const currentIndex = placeholderTextVariants.indexOf(nextPlaceholderText.value);
  nextPlaceholderText.value = placeholderTextVariants[currentIndex + 1];
  if (currentIndex === placeholderTextVariants.length - 1) {
    nextPlaceholderText.value = placeholderTextVariants[0];
  }
}

useIntersectionObserver(loadMoreEl, async ([{ isIntersecting }]) => {
  if (isIntersecting) {
    offset.value += chunkSize;
    limit.value += chunkSize;

    if (loading.value) {
      pendingLoadMore.value = true;
    } else {
      await gueryData();
    }
  }
});

watch(pendingLoadMore, async () => {
  if (pendingLoadMore.value) {
    await gueryData();
    pendingLoadMore.value = false;
  }
});

async function gueryData() {
  loading.value = true;

  const { data } = await useData({
    key: `spots-${offset.value}-${limit.value}${search.value ? `-${search.value}` : ""}`,
    query: spotsQuery,
    locale: locale.value,
    variables: {
      before: null,
      after: null,
      limit: limit.value,
      offset: offset.value,
      media: true,
      fts: search.value ? `*${search.value}*` : null,
    },
  });

  entries.value =
    offset.value === 0 ? data?.value?.entries : [...entries.value, ...data?.value?.entries];

  loading.value = false;
}

await gueryData();

watch(search, async () => {
  offset.value = 0;
  limit.value = chunkSize;
  pendingLoadMore.value = false;
  await gueryData();
});

const startDate = computed(() => lastDayOfMonth(new Date(entries.value[0].datetime)));
const endDate = computed(() =>
  firstDayOfMonth(new Date(entries.value[entries.value.length - 1].datetime)),
);

const monthColors = new Map([
  [0, "red"],
  [1, "blue"],
  [3, "green"],
  [3, "yellow"],
  [4, "purple"],
  [5, "orange"],
  [6, "brown"],
  [7, "gray"],
  [8, "pink"],
  [9, "cyan"],
  [10, "magenta"],
  [11, "lime"],
]);

const dates = computed(() => {
  const d = [];
  let current = startDate.value;

  while (current > endDate.value) {
    d.push({
      date: new Date(current.getTime()),
      entries: entries.value.filter((e) => isSameDay(new Date(e.datetime), current)),
    });
    current.setDate(current.getDate() - 1);
  }

  return d;
});

const inputRef = ref(null);
onKeyStroke(() => {
  inputRef.value.focus();
});
</script>

<template>
  <main>
    <div
      class="pb-m s:pointer-events-none sticky top-0 left-0 z-10 grid h-full w-full place-items-center mix-blend-lighten outline-none focus:outline-none focus-visible:outline-none"
    >
      <input
        ref="inputRef"
        type="text"
        v-model="search"
        :placeholder="placeholderText"
        class="typo-year w-full text-center text-[blue] placeholder:text-[blue]"
        :style="{
          fontSize: `min(12vw, calc(180vw / ${search.length || Math.max(...placeholderTextVariants.map((text) => text.length))}))`,
        }"
      />
    </div>

    <div class="p-s gap-xs m:grid-cols-6 relative grid max-w-full grid-cols-4 overflow-x-hidden">
      <template v-for="(date, index) in dates" :key="index" v-if="entries.length > 0 && !search">
        <div v-if="isLastDayOfMonth(date.date)">
          <ElementsText
            class="w-full"
            :theme="{ size: 'xl' }"
            :style="{ color: monthColors.get(date.date.getMonth()) }"
            :class="{ 'text-right': date.date.getMonth() % 2 === 0 }"
          >
            {{ date.date.toLocaleDateString("en-EN", { month: "long" }) }}
            {{ date.date.getFullYear() }}
          </ElementsText>
        </div>

        <div class="relative">
          <ElementsText class="py-s absolute right-0 bottom-0" :theme="{ size: 'xs' }">
            {{ date.date.getDate() }}
          </ElementsText>

          <div v-if="date.entries.length === 0" class="aspect-square w-full"></div>

          <div
            :class="{
              'grid grid-cols-2': date.entries.length > 1 && date.entries.length < 5,
              'grid grid-cols-4': date.entries.length >= 5,
            }"
          >
            <div v-for="entry in date.entries" :key="entry.id">
              <Spot v-bind="parsedData(entry, 'spot')" />
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <Spot v-for="entry in entries" :key="entry.id" v-bind="parsedData(entry, 'spot')" />
      </template>

      <div
        class="m:bottom-[calc(16.67vw*6)] pointer-events-none absolute bottom-[calc(25vw*9)] h-[100px] w-full"
        ref="loadMoreEl"
      ></div>
    </div>
  </main>
</template>
