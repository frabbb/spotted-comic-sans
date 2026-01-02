<script setup lang="ts">
import { cva } from "class-variance-authority";
import Hls from "hls.js";

const props = withDefaults(
  defineProps<{
    src: string;
    caption?: string;
    showCaption?: boolean;
    mobile?: any;
    ratio?: any[];
    poster?: any;
    theme?: VideoTheme;
    autoplay?: boolean;
    loop?: boolean;
    textColor?: "white" | "black";
  }>(),
  {
    caption: "",
    showCaption: false,
    mobile: undefined,
    ratio: undefined,
    poster: undefined,
    autoplay: true,
    loop: true,
    textColor: "white",
  },
);

const mq = useMq();
const device = useDevice();
const mounted = useMounted();

const video = ref();
let hls: Hls;
const lastPlayTime = ref(0);

const model = defineModel<VideoProperties>({
  default: {
    playing: false,
    progress: 0,
    duration: 0,
    muted: false,
    fullscreen: false,
    hasPlayed: false,
    resolution: { w: 0, h: 0 },
  },
});

const properties: Ref<VideoProperties> = ref(model.value);

const src = computed<string>(() =>
  !mq.s.value && props.mobile?.src ? props.mobile.src : props.src,
);

const ratio = computed(() => {
  const value =
    mounted.value && !mq.s.value && props.mobile?.ratio?.length ? props.mobile.ratio : props.ratio;
  return value;
});

onMounted(() => {
  if (props.autoplay) {
    properties.value.muted = true;
    video.value.loop = "loop";
    video.value.autoplay = "autoplay";
    video.value.muted = true;
  } else {
    video.value.loop = props.loop;
  }

  initVideo(src.value);
});

onUnmounted(() => {
  if (hls) {
    hls.destroy();
  }
});

watch(src, (v) => initVideo(v));

const initVideo = (src: string) => {
  if (!Hls.isSupported() || !src.includes(".m3u8")) {
    video.value.src = src;
  } else {
    if (!hls) {
      hls = new Hls({
        startLevel: -1,
      });
    } else {
      hls.stopLoad();
    }
    hls.loadSource(src);
    hls.attachMedia(video.value);
  }
};

const updateProgress = () => {
  if (!properties.value.playing) return;

  const now = Date.now();

  const elapsedTime = now - lastPlayTime.value;
  properties.value.progress += elapsedTime;

  lastPlayTime.value = now;
};

const { pause: pauseRafLoop, resume: resumeRafLoop } = useRafFn(updateProgress, {
  immediate: false,
});

//Methods
function toggleMuted() {
  properties.value.muted = !properties.value.muted;
}

function togglePlaying() {
  properties.value.playing = !properties.value.playing;
}

function skip(seconds: number) {
  video.value.currentTime = clamp(video.value.currentTime + seconds, 0, video.value.duration);
  properties.value.progress = video.value.currentTime * 1000;
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    video.value.requestFullscreen();
  }

  properties.value.fullscreen = !properties.value.fullscreen;
}

//Watchers
function diff(obj1: any, obj2: any) {
  return Object.keys(obj1).filter((key) => obj1[key] !== obj2[key]);
}

watch(
  model,
  (v) => {
    const differences = diff(v, properties.value);
    differences.forEach((key) => {
      (properties.value as any)[key] = (v as any)[key];
    });
  },
  { deep: true },
);

watch(
  properties,
  (v) => {
    const differences = diff(v, model.value);
    differences.forEach((key) => {
      (model.value as any)[key] = (v as any)[key];
    });
  },
  { deep: true },
);

watch(
  () => properties.value.playing,
  (v) => {
    if (v) {
      video.value.play();
    } else {
      video.value.pause();
    }
  },
);

watch(
  () => properties.value.muted,
  (v) => (video.value.muted = v),
);

//Event Handlers
function handleClick() {
  if (props.autoplay) return;
  if (properties.value.fullscreen) return;
  activateControls();

  if (device.value.touch) return;
  togglePlaying();
}

function handleDurationChange(event: Event) {
  properties.value.duration = Math.floor(video.value.duration * 1000);
}

function handleLoadedMetadata(event: Event) {
  properties.value.resolution = { w: video.value.videoWidth, h: video.value.videoHeight };
}

function handlePlaying(event: Event) {
  properties.value.playing = true;
  properties.value.hasPlayed = true;
  properties.value.progress = video.value.currentTime * 1000;
  lastPlayTime.value = Date.now();
  resumeRafLoop();
}

function handlePause(event: Event) {
  pauseRafLoop();
}

function handleEnded(event: Event) {
  properties.value.progress = properties.value.duration;
}

useEventListener(document, "fullscreenchange", () => {
  properties.value.fullscreen = document.fullscreenElement !== null;
  activateControls();

  if (!properties.value.fullscreen) {
    setTimeout(() => {
      video.value.pause();
    }, 100);
  }
});

onKeyStroke([" ", "f", "m", "ArrowLeft", "ArrowRight", "Escape"], handleKeyDown, {
  dedupe: true,
  target: video.value,
});

function handleKeyDown(e: KeyboardEvent) {
  if (props.autoplay) return;
  if (e.target !== video.value) return;
  if (properties.value.fullscreen) return;

  e.preventDefault();

  const keyMap = new Map([
    [" ", togglePlaying],
    ["f", toggleFullscreen],
    ["m", toggleMuted],
    ["ArrowLeft", () => skip(-10)],
    ["ArrowRight", () => skip(10)],
    ["Escape", () => (properties.value.fullscreen = false)],
  ]);

  keyMap.get(e.key)?.();
  activateControls();
}

function handleUpdateTime(time: number) {
  video.value.currentTime = time;
}

//Style
const classes = cva("", {
  variants: {
    variant: {
      fill: "h-full w-full [&_.video-container]:h-full [&_.video-container]:w-full [&_video]:h-full [&_video]:w-full",
      fit: "h-full w-full [&_.video-container]:h-full [&_.video-container]:w-full [&_video]:h-full [&_video]:w-full [&_video]:object-contain",
    },
    autoplay: {
      true: "pointer-events-none",
      false: "",
    },
  },
  defaultVariants: { variant: "fit", autoplay: true },
});

const showControls = ref(!props.autoplay);
let controlsTimeout: NodeJS.Timeout | null = null;

function activateControls() {
  showControls.value = true;
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
  }
  deactivateControls();
}
function deactivateControls() {
  if (!properties.value.hasPlayed) return;

  controlsTimeout = setTimeout(() => {
    showControls.value = false;
  }, 3000);
}
</script>

<template>
  <div
    :class="['video', cn(classes({ ...theme, autoplay }))]"
    @mouseenter="activateControls"
    @mousemove="activateControls"
  >
    <div class="video-container lay lay-o relative">
      <video
        ref="video"
        :style="{
          aspectRatio: ratio ? `${ratio[0]}/${ratio[1]}` : undefined,
        }"
        :class="{
          'cursor-pointer': !autoplay,
          'object-contain': properties.fullscreen,
          'object-cover': !properties.fullscreen,
        }"
        tabindex="0"
        playsinline
        preload="metadata"
        @click="handleClick"
        @playing="handlePlaying"
        @pause="handlePause"
        @seeking="handlePause"
        @durationchange="handleDurationChange"
        @loadedmetadata="handleLoadedMetadata"
        @loadeddata="handleLoadedMetadata"
        @ended="handleEnded"
      />

      <!-- Poster Image-->
      <Transition name="fade">
        <ElementsImage
          v-bind="poster"
          v-if="poster"
          v-show="!properties.hasPlayed"
          :ratio="ratio"
          @click="togglePlaying"
          :class="['relative z-10', { 'cursor-pointer': !autoplay }]"
        />
      </Transition>

      <!-- Controls -->
      <Transition name="fade">
        <ElementsVideoControls
          v-model="properties"
          v-if="!autoplay"
          v-show="showControls"
          @togglePlay="togglePlaying"
          @toggleMuted="toggleMuted"
          @toggleFullscreen="toggleFullscreen"
          @updateTime="handleUpdateTime"
          class="absolute bottom-0 left-0 z-10 w-full"
          :textColor
        />
      </Transition>
    </div>

    <!-- Caption -->
    <ElementsText tag="figcaption" v-if="showCaption && caption">
      <div v-html="caption" />
    </ElementsText>
  </div>
</template>
