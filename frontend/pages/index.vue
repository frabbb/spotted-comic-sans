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

const lockBody = useLock();

const placeholderTextVariants = [
  "Look for any Comic Sans word",
  `"Bar", "Tabacchi", "Pizzeria"`,
  "Has this already been spotted?",
  `"Helvetica Sucks"`,
  "Search any word...",
  "Regina, the queen of Comic Sans",
];

const searchContainer = ref(null);
const { height: searchContainerHeight } = useElementSize(searchContainer);
const placeholderText = ref("");
const nextPlaceholderText = ref(placeholderTextVariants[0]);
const { y } = useWindowScroll();

let typingInterval = null;
let typeTimeout = null;

onMounted(() => {
  typeWord(nextPlaceholderText.value);
});

function clearTypingInterval() {
  clearInterval(typingInterval);
  typingInterval = null;
}

function clearPlaceholderText() {
  typingInterval = setInterval(() => {
    placeholderText.value = placeholderText.value.slice(0, -1);
    if (placeholderText.value.length === 0) {
      clearTypingInterval();

      typeWord(nextPlaceholderText.value);
    }
  }, 20);
}

function typeWord(wordToType) {
  placeholderText.value = "";

  typingInterval = setInterval(() => {
    placeholderText.value = placeholderText.value + wordToType[placeholderText.value.length];
    if (placeholderText.value.length === wordToType.length) {
      clearTypingInterval();

      typeTimeout = setTimeout(() => {
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

const selectedEl = ref(null);
const transformOrigin = ref({ x: 0, y: 0 });
const transform = ref({ scale: 1, translate: { x: 0, y: 0 } });

const zoomLevel = ref(0);
const gridContainer = ref(null);
const { width: windowWidth, height: windowHeight } = useWindowSize();

function changeZoomLevel({ date, spot }) {
  if (spot) {
    if (spot.id === selectedEl.value) {
      // If the spot is already selected, zoom out if there is only one spot on the date
      // Otherwise, zoom in on the date
      if (date.entries.length > 1) {
        zoomOnDate(date.date.getTime());
      } else {
        zoomOut();
      }
    } else {
      if (zoomLevel.value === 2) {
        zoomOnSpot(spot.id);
      } else {
        zoomOnDateOrSpot({ date, spot });
      }
    }
  } else if (date) {
    if (selectedEl.value === date.date.getTime()) {
      zoomOut();
    } else if (date.entries.length) {
      zoomOnDateOrSpot({ date });
    }
  }
}

function zoomOnDateOrSpot({ date, spot }) {
  lockBody.value = true;

  clearTypingInterval();
  clearTimeout(typeTimeout);

  if (date && date.entries.length > 1) {
    if (selectedEl.value !== date.date.getTime()) {
      zoomOnDate(date.date.getTime());
    } else if (spot) {
      zoomOnSpot(spot.id);
    }
  } else if (spot) {
    zoomOnSpot(spot.id);
  }
}

function zoomOut() {
  transform.value = { scale: 1, translate: { x: 0, y: 0 } };
  zoomLevel.value = 0;
  selectedEl.value = null;
}

watch(zoomLevel, () => {
  if (zoomLevel.value === 0 && !typingInterval) {
    typeWord(nextPlaceholderText.value);
  }
});

function unLockBody(e) {
  if (e.target !== gridContainer.value) return;

  if (zoomLevel.value === 0) {
    lockBody.value = false;
  }
}

function zoomOnDate(dateId) {
  const date = document.getElementById(dateId);
  selectedEl.value = dateId;

  if (date) {
    zoomOnHtmlElement(date);
  }

  zoomLevel.value = 1;
}

function zoomOnHtmlElement(element) {
  const { top, left, width, height } = element.getBoundingClientRect();
  const { top: containerTop, left: containerLeft } = gridContainer.value.getBoundingClientRect();

  const center = { x: left + width / 2, y: top + height / 2 };

  const originalContainerBounding = {
    left: Math.round(containerLeft - transform.value.translate.x),
    top: Math.round(containerTop - transform.value.translate.y),
  };

  const originalCenter = {
    x: (center.x - containerLeft) / transform.value.scale,
    y: (center.y - containerTop) / transform.value.scale,
  };

  const targetScale =
    Math.min(windowWidth.value / width, windowHeight.value / height) * transform.value.scale;

  const targetTranslate = {
    x: windowWidth.value / 2 - originalContainerBounding.left - originalCenter.x * targetScale,

    y: windowHeight.value / 2 - originalContainerBounding.top - originalCenter.y * targetScale,
  };

  transform.value = { scale: targetScale, translate: targetTranslate };
}

function zoomOnSpot(spotId) {
  const spot = document.getElementById(spotId);
  if (spot) {
    zoomOnHtmlElement(spot);
  }
  selectedEl.value = spot.id;
  zoomLevel.value = 2;
}

onKeyStroke("Escape", () => {
  zoomOut();
});

useEventListener(window, "resize", () => {
  zoomOut();
});
</script>

<template>
  <main>
    <div
      :class="{
        fixed: searchContainerHeight > 0,
        sticky: searchContainerHeight === 0,
        '-translate-y-full': zoomLevel > 0,
      }"
      class="top-0 z-10 h-auto w-full transition-transform delay-150 duration-300"
      ref="searchContainer"
    >
      <div
        class="pb-m grid h-full w-full place-items-center outline-none focus:outline-none focus-visible:outline-none"
      >
        <input
          ref="inputRef"
          type="text"
          v-model="search"
          :placeholder="placeholderText"
          class="typo-year p-s bg-grey-100 backdrop-blur-DEFAULT w-full rounded-full text-center text-[blue] placeholder:text-[blue]"
          :style="{
            fontSize: `calc(35px + ( min( 20vw, calc(180vw / ${search.length || placeholderText.length || 1}) ) - 35px) * (${Math.max(200 - y, 0) / 200}))`,
          }"
        />
      </div>
    </div>

    <!--  -->
    <div
      class="min-h-[1000vh] w-full overflow-hidden"
      :class="{ 'cursor-zoom-out': zoomLevel > 0 }"
      @click="zoomOut"
      :style="{
        paddingTop: `${searchContainerHeight}px`,
        '--radius': zoomLevel === 2 ? '0px' : zoomLevel === 1 ? '10px' : '30px',
        '--next-radius': zoomLevel === 0 ? '10px' : '0px',
      }"
    >
      <div
        class="p-s gap-xs m:grid-cols-6 relative grid grid-cols-4 transition-transform duration-300"
        :style="{
          transformOrigin: `${transformOrigin.x}% ${transformOrigin.y}%`,
          transform: `translate(${transform.translate.x}px, ${transform.translate.y}px) scale(${transform.scale})`,
        }"
        ref="gridContainer"
        @transitionend="unLockBody"
      >
        <!-- <div
          class="h-s w-s absolute z-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[red] transition-all duration-150"
          :style="{ top: `${transformOrigin.y}%`, left: `${transformOrigin.x}%` }"
        ></div> -->

        <template v-for="(date, index) in dates" :key="index" v-if="entries.length > 0 && !search">
          <div v-if="isLastDayOfMonth(date.date)">
            <ElementsText
              class="w-full transition-opacity duration-150"
              :theme="{ size: 'xl' }"
              :style="{ color: monthColors.get(date.date.getMonth()) }"
              :class="{ 'text-right': date.date.getMonth() % 2 === 0, 'opacity-0': zoomLevel > 0 }"
            >
              {{ date.date.toLocaleDateString("en-EN", { month: "long" }) }}
              {{ date.date.getFullYear() }}
            </ElementsText>
          </div>

          <div
            class="relative"
            :id="date.date.getTime()"
            @click.stop="changeZoomLevel({ date, spot: null })"
            :class="{
              'cursor-zoom-in': selectedEl !== date.date.getTime() && date.entries.length,
              'cursor-zoom-out': selectedEl === date.date.getTime() && date.entries.length,
            }"
          >
            <!-- :class="{ 'opacity-0': zoomLevel === 1 && selectedEl !== date.date.getTime() }" -->
            <!-- <ElementsText
              class="py-s absolute right-0 bottom-0 transition-opacity duration-150"
              :class="{ 'opacity-0': zoomLevel > 0 }"
              :theme="{ size: 'xs' }"
            >
              {{ date.date.getDate() }}
            </ElementsText> -->

            <div v-if="date.entries.length === 0" class="aspect-square w-full"></div>

            <div
              :class="{
                'grid grid-cols-2': date.entries.length > 1 && date.entries.length < 5,
                'grid grid-cols-4': date.entries.length >= 5,
              }"
              class="gap-xs"
            >
              <div v-for="entry in date.entries" :key="entry.id">
                <Spot
                  :min-resolution="
                    selectedEl === entry.id
                      ? Math.max(windowWidth, windowHeight)
                      : selectedEl === date.date.getTime()
                        ? Math.max(windowWidth, windowHeight) / (date.entries.length > 5 ? 4 : 2)
                        : 0
                  "
                  v-bind="parsedData(entry, 'spot')"
                  :selected="selectedEl === entry.id"
                  :class="{
                    'cursor-zoom-in': selectedEl !== entry.id,
                    'cursor-zoom-out': selectedEl === entry.id,
                  }"
                  @click.stop="changeZoomLevel({ date, spot: entry })"
                />
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <Spot
            v-for="entry in entries"
            :key="entry.id"
            :min-resolution="Math.max(windowWidth, windowHeight)"
            v-bind="parsedData(entry, 'spot')"
            :selected="selectedEl === entry.id"
          />
        </template>

        <div
          class="m:bottom-[calc(16.67vw*6)] pointer-events-none absolute bottom-[calc(25vw*9)] h-[100px] w-full"
          ref="loadMoreEl"
        ></div>
      </div>
    </div>
  </main>
</template>
