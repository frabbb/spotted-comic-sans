<script setup lang="ts">
import { cva } from "class-variance-authority";
// TODO: Create GROQ query for projects if this component is needed
// import projectsQuery from "@/graphql/queries/sanity/entries/projects";

const props = withDefaults(
  defineProps<{
    type: EntryTypes;
    limit?: number;
    order?: string;
    variables?: any;
    loadMore?: boolean;
    space?: string;
    theme?: ArchiveTheme;
  }>(),
  {
    limit: 12,
    // order: "postDate DESC",
    loadMore: true,
    variables: {},
    space: "default",
  },
);

const route = useRoute();
const { currentRoute } = useRouter();
const paged = ref(route.query.paged ? parseInt(route.query.paged as string) : 1);
const offset = ref(paged.value && props.limit ? (paged.value - 1) * props.limit : 0);
const { locale } = useI18n();

const thumbs = new Map([["project", resolveComponent("LazyThumbsEntry")]]);
const skeletonThumbs = new Map([["project", resolveComponent("LazyThumbsSkeletonsEntry")]]);

const key = computed(
  () =>
    `archive-${props.type}-${
      Object.keys(props.variables).length ? `${JSON.stringify(props.variables)}-` : ""
    }${paged.value}-${variables?.value?.projectFilter ? JSON.stringify(variables.value.projectFilter) : ""}`,
);

const activeFilter: any = ref();
const variables = computed(() => ({
  section: props.type,
  orderBy: props.order,
  ...(props.limit > 0 && { limit: props.limit }),
  offset: offset.value,
  ...props.variables,
  ...(activeFilter?.value?.id && { projectFilter: { _: { references: activeFilter?.value?.id } } }),
}));

let stopIntersection: () => void;
const elements = ref<any[]>([]);
const dataCount = ref(0);
const showLoadMore = ref();
const loadMoreEl = ref();
const loadMoreStatus = ref("button");
const loading = ref(true);
const debounceLoadMore = ref(false);
const skeletons = computed(() =>
  loading.value ? Math.min(dataCount.value - elements.value.length, props.limit) : 0,
);

const doQuery = async () => {
  loading.value = true;

  // TODO: Implement GROQ query for projects
  const { data } = await useData({
    key: key.value,
    query: '', // projectsQuery - needs GROQ implementation
    variables: variables.value,
    lazy: true,
    locale: locale.value,
  });

  watch(
    data,
    (v) => {
      loading.value = false;
      if (v) {
        dataCount.value = v.entryCount;
        elements.value.push(...v.entries);

        showLoadMore.value = offset.value + v.entries.length < dataCount.value;
        if (showLoadMore.value) {
          paged.value += 1;
        } else if (stopIntersection) {
          stopIntersection();
        }
      }
    },
    {
      immediate: true,
    },
  );
};

await doQuery();

const setOffset = async (e?: Event) => {
  if (e) {
    e.preventDefault();
  }
  offset.value += props.limit;
  await doQuery();
  if (loadMoreStatus.value === "button") {
    loadMoreStatus.value = "infinite";
  }
};

const pagedUrl = computed(() => ({
  query: {
    paged: paged.value,
  },
}));

watch(loadMoreStatus, (v) => {
  if (v === "infinite" && showLoadMore.value) {
    const { stop } = useIntersectionObserver(loadMoreEl, (els) => {
      if (els[0]?.isIntersecting) {
        if (!loading.value) {
          setOffset();
        } else {
          debounceLoadMore.value = true;
        }
      }
    });
    stopIntersection = stop;
  }
});

watch(loading, (v) => {
  if (!v && debounceLoadMore.value) {
    setOffset();
    debounceLoadMore.value = false;
  }
});

const filters = elements.value
  .map((el) => el.categories)
  .flat(1)
  .reduce((acc, category) => {
    if (category && !acc.some((item: any) => item?.slug?.current === category?.slug?.current)) {
      acc.push(category);
    }
    return acc;
  }, []);

const filterSlugId = new Map(filters.map((filter: any) => [filter.slug.current, filter]));

const setFilter = async (clickedFilter: any) => {
  const to = {
    path: currentRoute.value.path,
    ...(clickedFilter.slug?.current &&
      currentRoute.value.query?.filter !== clickedFilter.slug?.current && {
        query: {
          filter: clickedFilter.slug.current,
        },
      }),
  };

  await navigateTo(to);
};

watch(
  currentRoute,
  (v) => {
    activeFilter.value = v.query?.filter ? filterSlugId.get(v.query.filter) : undefined;

    elements.value = [];
    offset.value = 0;
    paged.value = 1;

    doQuery();
  },
  { immediate: true },
);

const showFilter = useFilter();

let lockBody = useLock();

watch(showFilter, (v) => {
  lockBody.value = v;
});

const classes = cva(
  "", //always applied
  {
    variants: {
      type: {
        posts: "",
        pages: "",
      },
      variant: {
        default: "s:[&>div]:grid-cols-3 [&>div]:gap-s",
        compact: "s:[&>div]:grid-cols-2 s:[&>div]:grid-cols-4 [&>div]:gap-s",
      },
    },
    defaultVariants: {
      type: "posts",
      variant: "default",
    },
  },
);
</script>

<template>
  <div :class="['archive-block', type, cn(classes({ type, variant: theme }))]">
    <div class="filters s:block pb-m hidden" v-if="filters.length">
      <div class="gap-m flex">
        <ElementsText typo="p" class="whitespace-nowrap">{{ $t("filters.title") }}</ElementsText>
        <div class="gap-m lay lay-h lay-fluid justify-between">
          <div class="gap-m lay lay-h lay-fluid items-start justify-start">
            <ElementsLink
              @click="setFilter(filter)"
              :class="[{ active: activeFilter?.slug?.current == filter?.slug?.current }]"
              v-for="filter in filters"
              :key="filter.slug.current"
            >
              <ElementsText typo="p">{{ filter.title }}</ElementsText>
            </ElementsLink>
          </div>
          <ElementsLink @click="setFilter(activeFilter)" v-if="activeFilter">
            <ElementsText typo="p">{{ $t("filters.clear") }}</ElementsText>
          </ElementsLink>
        </div>
      </div>
    </div>

    <div :class="['elements', 'grid']">
      <LazyThumbsEntry
        v-for="(element, index) in elements"
        :key="element.id"
        theme="archive"
        v-bind="parsedData(element, `thumb`)"
      />
      <ClientOnly>
        <component v-for="e in skeletons" theme="archive" :is="skeletonThumbs.get(type)" />
      </ClientOnly>
    </div>

    <ClientOnly>
      <div
        :class="[
          { 'px-s fixed w-full': showFilter },
          { sticky: !showFilter },
          'filter-trigger-mobile bottom-s gap-m lay lay-h lay-fluid s:hidden left-0 z-10 w-fit items-start justify-between whitespace-nowrap',
        ]"
        v-if="filters?.length"
      >
        <ElementsLink @click="showFilter = !showFilter">
          <div class="gap-s lay lay-h lay-fluid">
            <ElementsText typo="1"
              >{{ showFilter ? $t("ctas.close") : $t("filters.title") }}
            </ElementsText>
            <ElementsText typo="1" v-show="activeFilter">(1)</ElementsText>
          </div>
        </ElementsLink>
        <ElementsLink @click="setFilter(activeFilter)" v-if="activeFilter" v-show="showFilter">
          <ElementsText typo="1">{{ $t("filters.clear") }}</ElementsText>
        </ElementsLink>
      </div>

      <div
        class="filters-mobile pt-xl fixed bottom-0 left-0 z-10 h-dvh w-full bg-white"
        v-show="showFilter"
      >
        <div
          class="lay lay-fluid max-h-full items-start justify-items-start gap-0 overflow-scroll"
          v-if="filters?.length"
        >
          <ElementsLink
            @click="setFilter(filter)"
            :class="[{ active: activeFilter?.slug?.current == filter?.slug?.current }, 'p-s']"
            v-for="filter in filters"
            :key="filter.slug.current"
          >
            <ElementsText typo="1">{{ filter.title }}</ElementsText>
          </ElementsLink>
        </div>
      </div>
    </ClientOnly>

    <div
      v-if="loadMore"
      v-show="showLoadMore"
      ref="loadMoreEl"
      :class="['lay', { invisible: loadMoreStatus === 'button' }]"
    >
      <ElementsLink external @click.prevent="setOffset" :url="pagedUrl" :theme="{ type: 'button' }">
        <ElementsText tag="div" typo="4">{{ $t("ctas.loadMore") }}</ElementsText>
      </ElementsLink>
    </div>
  </div>
</template>
