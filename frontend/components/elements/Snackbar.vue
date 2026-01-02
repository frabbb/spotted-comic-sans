<script setup lang="ts">
import { cva } from "class-variance-authority";

const props = withDefaults(
  defineProps<{
    handle?: string;
    theme?: "default";
    autoclosing?: boolean;
  }>(),
  {
    autoclosing: false,
    theme: "default",
  },
);

let timer: ReturnType<typeof setTimeout> | undefined;
const content = ref();
const { height } = useElementBounding(content);

const model = defineModel({ default: false });
const { shown, hide } = useModal(props.handle, model.value);

watch([model, shown], ([m, s], [oldM, oldS]) => {
  if (m !== oldM) shown.value = m;
  if (s !== oldS) model.value = s;

  if (shown.value) {
    autoClose();
  }
});

function autoClose() {
  if (props.autoclosing) {
    timer = setTimeout(() => {
      hide();
    }, 3000);
  }
}

function keep() {
  if (timer) clearTimeout(timer);
}

const transitionName = ref(props.theme !== "default" ? `snackbar-${props.theme}` : "snackbar");

const classes = cva("", {
  variants: {
    theme: {
      default: ["flex items-center gap-s justify-between p-s bg-black text-white"],
    },
  },
});

onUnmounted(() => {
  if (timer) clearTimeout(timer);
});
</script>

<template>
  <Transition :name="transitionName">
    <div
      v-show="shown"
      @mouseenter="keep"
      @mouseleave="autoClose"
      @mousemove="keep"
      role="alertdialog"
      aria-modal="true"
      :style="{ '--height': `${height}px` }"
    >
      <div :class="['content', classes({ theme })]" ref="content">
        <slot>
          <slot name="content" v-if="$slots.content" />

          <ElementsLink @click="hide">
            {{ $t("ctas.close") }}
          </ElementsLink>
        </slot>
      </div>
    </div>
  </Transition>
</template>
