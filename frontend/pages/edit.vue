<script setup>
const route = useRoute();
const router = useRouter();
const index = ref(Number(route.query.index) || 0);

import spotsQuery from "~/graphql/queries/sanity/entries/spots";
const { locale } = useI18n();

const entry = ref();
const description = ref("");

async function queryEntry() {
  const { data } = await useData({
    key: `spot-${index.value}`,
    query: spotsQuery, // Now we can filter by media in the query!
    locale: locale.value,
    variables: {
      before: null,
      after: null,
      limit: index.value + 1,
      offset: index.value,
      media: true,
      fts: null,
    },
  });

  entry.value = data.value.entries[0];

  description.value = entry.value?.media?.description;
}

await queryEntry();

function isFocused() {
  return document.activeElement.id === "description";
}

onKeyStroke("ArrowRight", () => {
  if (isFocused()) return;
  index.value++;
});

onKeyStroke("ArrowLeft", () => {
  if (isFocused()) return;
  index.value = Math.max(0, index.value - 1);
});

onKeyStroke("Enter", () => {
  if (isFocused()) return;
  saveEntry();
});

onKeyStroke("Backspace", () => {
  if (isFocused()) return;
  deleteEntry();
});

watch(index, async () => {
  router.push({ query: { index: index.value } });

  await queryEntry();
});

async function deleteEntry() {
  if (!entry.value?._id) return;

  const confirmed = confirm("Are you sure you want to delete this entry?");
  if (!confirmed) return;

  try {
    await $fetch("/api/edit", {
      method: "POST",
      body: {
        id: entry.value._id,
        action: "delete",
      },
    });

    // Move to next entry after deletion
    await queryEntry();
  } catch (error) {
    console.error("Failed to delete entry:", error);
    alert("Failed to delete entry. Check console for details.");
  }
}

async function saveEntry() {
  if (!entry.value?.media?._id) return;

  try {
    // Patch the media asset with the new description
    await $fetch("/api/edit", {
      method: "POST",
      body: {
        id: entry.value.media._id,
        action: "patch",
        patches: {
          description: description.value,
        },
      },
    });

    // Move to next entry after saving
    index.value++;
  } catch (error) {
    console.error("Failed to save entry:", error);
    alert("Failed to save entry. Check console for details.");
  }
}

const zoomedIn = ref(false);
const mediaContainer = ref(null);

const { elementX, elementY, elementWidth, elementHeight } = useMouseInElement(mediaContainer);

// Drag functionality
const isDragging = ref(false);
const hasDragged = ref(false);
const panX = ref(0);
const panY = ref(0);
const dragStartX = ref(0);
const dragStartY = ref(0);
const startPanX = ref(0);
const startPanY = ref(0);

function toggleZoom(e) {
  // Don't toggle if we just dragged
  if (hasDragged.value) {
    hasDragged.value = false;
    return;
  }

  zoomedIn.value = !zoomedIn.value;
  if (!zoomedIn.value) {
    // Reset pan when zooming out
    panX.value = 0;
    panY.value = 0;
  }
}

function onMouseDown(e) {
  if (!zoomedIn.value) return;
  e.preventDefault();
  isDragging.value = true;
  hasDragged.value = false;
  dragStartX.value = e.clientX;
  dragStartY.value = e.clientY;
  startPanX.value = panX.value;
  startPanY.value = panY.value;
}

function onMouseMove(e) {
  if (!isDragging.value || !zoomedIn.value) return;
  e.preventDefault();
  const deltaX = e.clientX - dragStartX.value;
  const deltaY = e.clientY - dragStartY.value;

  // Mark as dragged if movement is significant (more than 2px)
  if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
    hasDragged.value = true;
  }

  // Calculate bounds (scale is 2x, so the overflow is containerSize * (scale - 1) / 2)
  if (mediaContainer.value) {
    const containerWidth = mediaContainer.value.clientWidth;
    const containerHeight = mediaContainer.value.clientHeight;
    const scale = 2;

    // Divide by scale because translate happens in scaled coordinate system
    const adjustedDeltaX = deltaX / scale;
    const adjustedDeltaY = deltaY / scale;

    // Max pan distance is half of the overflow on each side
    const maxPanX = (containerWidth * (scale - 1)) / (2 * scale);
    const maxPanY = (containerHeight * (scale - 1)) / (2 * scale);

    // Clamp the pan values
    panX.value = Math.max(-maxPanX, Math.min(maxPanX, startPanX.value + adjustedDeltaX));
    panY.value = Math.max(-maxPanY, Math.min(maxPanY, startPanY.value + adjustedDeltaY));
  } else {
    panX.value = startPanX.value + deltaX;
    panY.value = startPanY.value + deltaY;
  }
}

function onMouseUp() {
  isDragging.value = false;
}

// Clean up event listeners
onMounted(() => {
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
});

onUnmounted(() => {
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup", onMouseUp);
});
</script>

<template>
  <div class="gap-s p-m grid h-screen w-full grid-cols-2">
    <div
      class="h-full w-full overflow-hidden select-none"
      ref="mediaContainer"
      @mousedown="onMouseDown"
      @click="toggleZoom"
      :class="{
        'cursor-zoom-in': !zoomedIn,
        'cursor-grab': zoomedIn && !isDragging,
        'cursor-grabbing': zoomedIn && isDragging,
      }"
    >
      <ElementsMedium
        :item="entry?.media"
        theme="fit"
        class="pointer-events-none"
        :class="{ 'transition-all duration-300': !isDragging }"
        :style="zoomedIn ? { transform: `scale(2) translate(${panX}px, ${panY}px)` } : {}"
      />
    </div>

    <div class="gap-m grid content-start">
      <ElementsText :theme="{ size: 'l' }" :text="entry?.title" />

      <textarea
        id="description"
        v-model="description"
        class="border-grey-500 p-s h-[20vh] w-full border"
      />

      <div class="gap-s flex justify-between">
        <ElementsLink
          :theme="{ type: 'button', variant: 'secondary' }"
          :style="{ '--color-secondary': 'red' }"
          @click="deleteEntry"
          >DELETE</ElementsLink
        >
        <ElementsLink
          :theme="{ type: 'button', variant: 'secondary' }"
          :style="{ '--color-secondary': 'blue' }"
          @click="saveEntry"
          >SAVE</ElementsLink
        >
      </div>
    </div>
  </div>
</template>
