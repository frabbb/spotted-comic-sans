<script setup lang="ts">
import { cva } from "class-variance-authority";
import tokens from "@/assets/css/tokens.json";

interface ImageProps {
  width?: number;
  height?: number;
  url?: string;
  srcs?: Record<string, string>;
  caption?: string;
  placeholder?: string;
}

const props = withDefaults(
  defineProps<{
    caption?: string;
    showCaption?: boolean;
    placeholder?: string;
    srcs?: Record<string, string>;
    url?: string;
    width?: number;
    height?: number;
    alt?: string;
    mobile?: ImageProps;
    theme?: ImageTheme;
    lazy?: boolean;
    ratio?: [number, number];
    minResolution?: number;
  }>(),
  {
    caption: "",
    showCaption: false,
    placeholder: "",
    srcs: undefined,
    url: "",
    width: undefined,
    height: undefined,
    alt: "",
    mobile: undefined,
    lazy: true,
    ratio: undefined,
    minResolution: 0,
  },
);

const el = useCurrentElement();
const { width: elWidth } = useElementSize(el);
const { width: windowWidth } = useWindowSize();
const elWidthDebounced = ref(elWidth.value);
const windowWidthDebounced = ref(windowWidth.value);

watch(
  elWidth,
  (v) => {
    elWidthDebounced.value = v;
  },
  { once: true },
);

watch(
  windowWidth,
  (v) => {
    windowWidthDebounced.value = v;
  },
  { once: true },
);

watchDebounced(
  elWidth,
  (v) => {
    elWidthDebounced.value = v;
  },
  { debounce: 1000 },
);

watchDebounced(
  windowWidth,
  (v) => {
    windowWidthDebounced.value = v;
  },
  { debounce: 1000 },
);

const { pixelRatio } = useDevicePixelRatio();
// const pixelRatio = ref(1);
const img = ref();
const pending = ref(true);
const isMounted = useMounted();
const hasMobileSrc = props.mobile?.url;
const mq = useMq();

const breakpoint = extractNumber(tokens.theme.breakpoint.s);
const isCrawler = useState("isCrawler");

const src = computed(() => {
  return isCrawler.value ? props.url : undefined;
});

const fallback = () => {
  pending.value = false;
  img.value.src = media.value.url;
};

onMounted(() => {
  nextTick(() => {
    pending.value = !img.value?.complete;
  });
});

const loading = async () => {
  pending.value = !img.value?.complete;
};

const getKeys = (obj: Record<string, string> | undefined) => {
  if (!obj) {
    return [];
  }

  const keys = Object.keys(obj);

  const sortedKeys = keys.map(Number).sort((a, b) => a - b);

  const filteredKeys = sortedKeys.filter((key) => {
    const mediaWidth = key;
    const maxWidth =
      elWidthDebounced.value < windowWidthDebounced.value
        ? elWidthDebounced.value
        : windowWidthDebounced.value;

    return mediaWidth <= maxWidth * pixelRatio.value;
  });

  const lastFilteredKey = filteredKeys[filteredKeys.length - 1];
  const nextKey = lastFilteredKey ? sortedKeys.find((key) => key > lastFilteredKey) : sortedKeys[0];

  const result = [...filteredKeys];
  if (nextKey !== undefined) {
    result.push(nextKey);
  }

  return result;
};

const sources = computed(() => {
  if (!isMounted.value) {
    return [];
  }

  const min = Math.min(
    props.minResolution * pixelRatio.value,
    Math.max(...Object.keys(props.srcs || {}).map(Number)),
  );

  const defaultSrcs = Object.fromEntries(
    Object.entries(props.srcs || {}).filter(([key]) => Number(key) >= min),
  );
  const mobileSrcs = Object.fromEntries(
    Object.entries(props.mobile?.srcs || {}).filter(([key]) => Number(key) >= min),
  );

  const sources: any[] = [];

  if (hasMobileSrc && mobileSrcs) {
    const mobileKeys = getKeys(mobileSrcs);

    const mobileSources = mobileKeys.map((key, index) => {
      const maxWidth = key / pixelRatio.value;

      return {
        srcs: mobileSrcs?.[key],
        media: `(min-width: ${index === 0 ? 0 : maxWidth}px) and (max-width: ${breakpoint - 1}px)`,
        isMobile: true,
        key,
      };
    });

    sources.push(
      ...mobileSources.filter((source, index) => source.key < breakpoint || index === 0),
    );
  }

  const desktopKeys = getKeys(defaultSrcs);

  sources.push(
    ...desktopKeys
      .map((key, index) => {
        const maxWidth = key / pixelRatio.value;
        const minWidth = desktopKeys[index - 1] ? desktopKeys[index - 1] / pixelRatio.value + 1 : 0;
        const parsedMinWidth = hasMobileSrc && minWidth < breakpoint ? breakpoint : minWidth;

        if (parsedMinWidth < maxWidth) {
          return {
            key: key,
            srcs: defaultSrcs[key],
            media:
              index === desktopKeys.length - 1
                ? `(min-width: ${parsedMinWidth}px)`
                : `(min-width: ${parsedMinWidth}px) and (max-width: ${maxWidth}px)`,
            isMobile: false,
          };
        }
      })
      .filter(Boolean),
    // .filter((source) => {
    //   return hasMobileSrc && windowWidthDebounced.value < breakpoint
    //     ? source.key > breakpoint - 1
    //     : true;
    // }),
  );
  return sources.reverse();
});

const media = computed(() =>
  isMounted.value && !mq.s.value && props.mobile?.url ? props.mobile : props,
);

const ratio = computed(() => {
  const value = props.ratio || [media.value.width, media.value.height];
  return `${value[0]}/${value[1]}`;
});

const isHorizontal = computed(() => {
  return media.value.width && media.value.height && media.value.width > media.value.height;
});

const classes = cva("", {
  variants: {
    variant: {
      fill: "h-full w-full",
      fit: "h-full w-full ",
      skeleton: "w-full bg-black opacity-25",
    },
  },
  defaultVariants: { variant: "fit" },
});
</script>

<template>
  <figure :class="['figure relative overflow-hidden', cn(classes({ variant: theme }))]">
    <picture :class="['lay lay-o']">
      <KeepAlive>
        <source
          :media="source.media"
          :srcset="source.srcs"
          v-for="source in sources"
          :key="`${source.width}-${source.isMobile ? 'mobile' : 'desktop'}`"
        />
      </KeepAlive>
      <img
        ref="img"
        :src="src"
        :alt="alt"
        :loading="lazy ? 'lazy' : 'eager'"
        @load="loading"
        @error="fallback"
        :style="{
          aspectRatio: ratio,
          transform: `translate(-50%, -50%) scale(${theme === 'fill' ? (isHorizontal ? media.width / media.height : media.height / media.width) : 1})`,
        }"
        :class="[
          'absolute top-1/2 left-1/2 transition-all duration-300',
          {
            'h-full': !isHorizontal,
            'w-full': isHorizontal,

            invisible: pending,
          },
        ]"
      />
      <ClientOnly>
        <Transition name="fade">
          <div
            class="placeholder pointer-events-none absolute z-1 h-full w-full overflow-hidden"
            aria-hidden="true"
            v-if="(pending || sources.length === 0) && lazy"
          >
            <picture class="h-full w-full">
              <source
                :srcset="mobile.placeholder"
                :media="`(max-width: ${breakpoint - 1}px)`"
                v-if="hasMobileSrc"
              />
              <img
                class="h-full w-full object-cover"
                :src="placeholder"
                :style="{
                  aspectRatio: ratio,
                }"
              />
            </picture>
          </div>
        </Transition>
      </ClientOnly>
    </picture>

    <ElementsText tag="figcaption" v-if="showCaption && media.caption" typo="4" class="mt-s">
      <div v-html="media.caption" />
    </ElementsText>
  </figure>
</template>
