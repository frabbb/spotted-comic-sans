<script setup lang="ts">
import { cva } from "class-variance-authority";
import { FocusTrap } from "vue-a11y-utils";

const props = withDefaults(
  defineProps<{
    handle?: string;
    theme?: "default" | "popup";
    locking?: boolean;
    autoclosing?: boolean;
    title?: string;
    text?: string;
    teleport?: boolean;
  }>(),
  {
    locking: false,
    autoclosing: false,
    theme: "default",
    teleport: true,
  },
);

const lockBody = useLock();
let timer: ReturnType<typeof setTimeout> | undefined;

const model = defineModel({ default: false });
const { shown, hide, content, dialog, goFirst, goLast } = useModal(props.handle, false, props);

watch([model, shown], ([m, s], [oldM, oldS]) => {
  if (m !== oldM) shown.value = m;
  if (s !== oldS) model.value = s;

  if (shown.value) {
    if (props.locking) {
      lockBody.value = true;
    }
    autoClose();
  } else {
    if (props.locking && lockBody.value) {
      lockBody.value = false;
    }
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

const transitionName = ref(props.theme !== "default" ? `modal-${props.theme}` : "modal");

const classes = cva("", {
  variants: {
    theme: {
      default: [
        "flex justify-center items-center p-s z-30",
        "[&_.backdrop]:bg-white-transparent",
        "[&_.modal:max-w-(breakpoint-s)] [&_.modal]:bg-white [&_.modal]:rounded-DEFAULT [&_.modal]:grid [&_.modal]:gap-m",
        "[&_.header]:px-s [&_.header]:pt-s [&_.header]:flex [&_.header]:justify-between [&_.header]:gap-m",
        "[&_.content]:px-s [&_.content]:pb-s [&_.content]:h-fit",
      ],
      popup: [
        "flex justify-end items-end p-s z-20",
        "[&_.modal:max-w-(breakpoint-s)] s:[&_.modal]:w-[25vw] [&_.modal]:bg-black text-white [&_.modal]:rounded-DEFAULT [&_.modal]:grid [&_.modal]:gap-m",
        "[&_.header]:px-s [&_.header]:pt-s [&_.header]:flex [&_.header]:justify-between [&_.header]:gap-m",
        "[&_.content]:px-s [&_.content]:pb-s [&_.content]:h-fit",
      ],
    },
  },
});

onClickOutside(content, () => {
  if (props.theme === "popup") return;
  hide();
});
onKeyStroke("Escape", () => {
  if (props.theme === "popup") return;
  hide();
});

onUnmounted(() => {
  if (timer) clearTimeout(timer);
});
</script>

<template>
  <Teleport to="body" :disabled="!teleport">
    <Transition :name="transitionName">
      <div
        :class="[
          'lay fixed top-0 left-0 h-screen w-full',
          { 'pointer-events-none': !locking },
          classes({ theme }),
        ]"
        v-show="shown"
      >
        <div class="backdrop absolute top-0 left-0 h-full w-full"></div>

        <FocusTrap ref="dialog" @gofirst="goFirst" @golast="goLast">
          <div
            @mouseenter="keep"
            @mouseleave="autoClose"
            @mousemove="keep"
            role="alertdialog"
            aria-modal="true"
            ref="content"
            class="modal pointer-events-auto relative z-10"
          >
            <slot>
              <!--Header with close button-->
              <div class="header">
                <slot name="header">
                  <slot name="title" />
                  <ElementsLink @click="hide">
                    {{ $t("ctas.close") }}
                  </ElementsLink>
                </slot>
              </div>

              <!--Content-->
              <div class="content">
                <slot name="content" />
              </div>
            </slot>
          </div>
        </FocusTrap>
      </div>
    </Transition>
  </Teleport>
</template>
