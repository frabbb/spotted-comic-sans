<script setup>
import spotsQuery from "@/graphql/queries/sanity/entries/spots";
const { locale } = useI18n();

const entries = ref([]);

const { data } = await useData({
  key: `spots`,
  query: spotsQuery(),
  locale: locale.value,
});

entries.value = data?.value?.entries.filter((e) => e.media);

const startDate = ref(lastDayOfMonth(new Date(entries.value[0].datetime)));
const endDate = ref(firstDayOfMonth(new Date(entries.value[entries.value.length - 1].datetime)));

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

const dates = ref([]);
let current = startDate.value;

while (current > endDate.value) {
  dates.value.push({
    date: new Date(current.getTime()),
    entries: entries.value.filter((e) => isSameDay(new Date(e.datetime), current)),
  });
  current.setDate(current.getDate() - 1);
}

const search = ref("");
const { width: windowWidth } = useWindowSize();

const inputRef = ref(null);
onKeyStroke(() => {
  inputRef.value.focus();
});
</script>

<template>
  <main>
    <div
      class="pointer-events-none fixed top-0 left-0 z-10 grid h-full w-full place-items-center mix-blend-lighten outline-none focus:outline-none focus-visible:outline-none"
    >
      <input
        ref="inputRef"
        type="search"
        v-model="search"
        placeholder="Search any word"
        class="typo-year w-full text-center text-[blue]"
        :style="{
          fontSize: `${Math.min((windowWidth * 1.8) / (search.length || 1), windowWidth * 0.12)}px`,
        }"
      />
    </div>

    <div class="p-s gap-s grid grid-cols-4">
      <template v-for="(date, index) in dates" :key="index">
        <!-- <div
          v-if="
            date.date.getFullYear() !== dates[index - 1]?.date?.getFullYear() ||
            isLastDayOfMonth(date.date)
          "
          class="col-span-full"
          :class="{ 'pt-2xl': index > 0 }"
        >
          <div v-if="date.date.getFullYear() !== dates[index - 1]?.date?.getFullYear()">
            <ElementsText
              class="w-full"
              :theme="{ size: 'year' }"
              :style="{ color: monthColors.get(date.date.getMonth()) }"
              :class="{ 'text-right': date.date.getMonth() % 2 === 0 }"
            >
              {{ date.date.getFullYear() }}
            </ElementsText>
          </div>

          <div v-if="isLastDayOfMonth(date.date)">
            <ElementsText
              class="w-full"
              :theme="{ size: 'month' }"
              :style="{ color: monthColors.get(date.date.getMonth()) }"
              :class="{ 'text-right': date.date.getMonth() % 2 === 0 }"
            >
              {{ date.date.toLocaleDateString("en-EN", { month: "long" }) }}
            </ElementsText>
          </div>
        </div> -->

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
    </div>
  </main>
</template>
