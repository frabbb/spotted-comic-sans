<script setup lang="ts">
import { cva } from "class-variance-authority";
import emblaCarouselVue from "embla-carousel-vue";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import Autoplay from "embla-carousel-autoplay";
import AutoScroll from "embla-carousel-auto-scroll";

const props = withDefaults(
  defineProps<{
    theme?: SliderTheme;
    hasNavigation?: boolean;
    hasPagination?: boolean;
    additionalOptions?: any;
  }>(),
  { hasNavigation: true, hasPagination: true, additionalOptions: {} },
);

// Global default options
emblaCarouselVue.globalOptions = { loop: true };

const options = new Map<string, any>([
  ["media", { skipSnaps: false, align: "center", duration: 60, dragThreshold: 10 }],
  ["stack", { loop: false, align: "start", dragThreshold: 10 }],
  ["loop", { loop: true, dragFree: true, dragThreshold: 1000 }],
  ["default", { dragThreshold: 10 }],
]);

const methods = new Map<string, any>([
  [
    "media",
    [
      WheelGesturesPlugin({
        forceWheelAxis: "x",
        wheelDraggingClass: "is-wheel-dragging",
      }),
      Autoplay(),
    ],
  ],
  [
    "loop",
    [
      WheelGesturesPlugin({
        forceWheelAxis: "x",
        wheelDraggingClass: "is-wheel-dragging",
      }),
      AutoScroll({ stopOnInteraction: false, speed: 0.5 }),
    ],
  ],
  ["stack", []],
  ["default", []],
]);

//Override global options and init carousel
const [emblaRef, emblaApi] = emblaCarouselVue(
  options.get(props.theme || "default"),
  methods.get(props.theme || "default"),
);

//utils vars
const canNext = ref(false);
const canPrev = ref(false);
const currentSlide = ref(0);

const slideNumber = ref(0);
const emit = defineEmits(["update"]);

//utils methods
const goNext = () => {
  if (emblaApi.value) {
    if (emblaApi.value.canScrollNext()) {
      emblaApi.value.scrollNext();
    }
  }
};

const goPrev = () => {
  if (emblaApi.value) {
    if (emblaApi.value.canScrollPrev()) {
      emblaApi.value.scrollPrev();
    }
  }
};

const clickPagination = (n: any) => {
  if (emblaApi.value) {
    emblaApi.value.scrollTo(n);
  }
};

const setState = () => {
  if (emblaApi.value) {
    canNext.value = emblaApi.value.canScrollNext();
    canPrev.value = emblaApi.value.canScrollPrev();
    currentSlide.value = emblaApi.value.selectedScrollSnap();
  }
  emit("update", currentSlide.value);
};

const handleKeyDown = (event: any) => {
  switch (event.key) {
    case "ArrowLeft":
      goPrev();
      event.preventDefault();
      break;
    case "ArrowRight":
      goNext();
      event.preventDefault();
      break;
  }
};

const handleKeyboardNavigation = (event: any) => {
  if (emblaRef.value) {
    handleKeyDown(event);
  }
};

//onmounted setup
onMounted(() => {
  setState();
  if (emblaApi.value) {
    emblaApi.value.on("select", setState);
    slideNumber.value = emblaApi.value.slideNodes()?.length;

    emblaApi.value.on("pointerUp", (embla) => {
      embla.internalEngine().scrollBody.useFriction(0.5).useDuration(15);
    });

    emblaApi.value.on("select", (embla) => {
      embla.internalEngine().scrollBody.useFriction(0.58).useDuration(10);
    });
  }
});

//classes
const classes = cva(
  "[&_*.slide]:min-w-0  :focus-visible:outline-none", //always applied
  {
    variants: {
      variant: {
        default: [],
        media: [
          "[&_.embla-slide]:flex-[0_0_100%] ml-s mr-s [&_.embla-slide]:h-[50svh] [&_.embla-slide]:max-w-full",
          "[&_.embla-slide_img]:object-contain",
        ],
        loop: [
          "[&_.embla-container]:h-[50svh]",
          "[&_.embla-slide]:h-full [&_.embla-slide]:flex-none",
        ],
        stack: [],
      },
    },
    defaultVariants: { variant: "default" },
  },
);

// Accessibility plus:
// prefers-reduced-motion
// aria-live="polite"
</script>

<template>
  <div @keydown="handleKeyboardNavigation">
    <div
      :class="['embla', 'overflow-hidden', theme, cn(classes({ variant: theme }))]"
      ref="emblaRef"
      id="embla-carousel"
      role="region"
      tabindex="0"
      aria-label="Carousel"
      aria-labelledby="Carousel"
    >
      <div class="embla-container flex" id="embla-carousel-viewport">
        <slot />
      </div>

      <div aria-live="polite" class="hidden">
        {{ `Slide ${currentSlide + 1} of ${slideNumber}` }}
      </div>
    </div>
    <div class="p-s flex w-full justify-between">
      <div
        class="embla-pagination lay lay-h lay-fluid gap-xs justify-center"
        v-if="hasPagination && slideNumber > 0"
      >
        <div v-for="n in slideNumber" :key="n" class="embla-pagination-dot">
          <ElementsLink
            :class="[
              { 'opacity-100': n - 1 === currentSlide },
              'embla-pagination-dot-button cursor-pointer opacity-50 hover:opacity-100',
            ]"
            @click="clickPagination(n - 1)"
          >
            {{ n }}
          </ElementsLink>
        </div>
      </div>
      <div class="embla-navigation lay lay-h lay-fluid" v-if="hasNavigation && slideNumber > 0">
        <ElementsLink
          :class="[{ 'cursor- opacity-50': !canPrev }, 'embla-button embla-button--prev']"
          aria-label="Previous slide"
          aria-controls="embla-carousel-viewport"
          @click="goPrev()"
        >
          <ElementsIcon name="arrow" rotate="180" />
        </ElementsLink>
        <ElementsLink
          :class="[{ 'cursor-default opacity-50': !canNext }, 'embla-button embla-button--next']"
          aria-label="Next slide"
          aria-controls="embla-carousel-viewport"
          @click="goNext()"
        >
          <ElementsIcon name="arrow" />
        </ElementsLink>
      </div>
    </div>
  </div>
</template>

<style lang="postcss">
.embla {
  /* Add smooth transition when not being dragged */
  transition: transform 0.3s ease-out;

  /* Disable transitions during wheel dragging for immediate feedback */
  &.is-wheel-dragging {
    transition: none;
  }

  /* &.stack {
    .embla-container {
      height: fit-content;
      @media (min-width: 768px) {
        height: 500px;
      }
    }

    .embla-slide {
      flex: 0 0 auto;

      figure,
      picture,
      img {
        width: 100%;
      }

      img {
        height: auto;
      }

      @media (min-width: 768px) {
        max-height: 100%;
        figure,
        picture,
        img {
          height: 100%;
        }

        img {
          width: auto;
        }
      }
    }
  } */
}
</style>
