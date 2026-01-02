<script setup>
const nuxtApp = useNuxtApp();
const { currentRoute: route } = useRouter();
const isOverlaid = useState("overlay");
const { locale } = useI18n();

const defaultKey = computed(() =>
  route.value?.meta?.overlay ? route.value?.meta?.fromPath : route.value?.path,
);

nuxtApp.hook("page:transition:finish", () => {
  if (!route.value.meta.overlay) {
    isOverlaid.value = false;
  }
});

let lockBody = useLock();

onMounted(() => {
  lockBody.value = useScrollLock(document.body);
});

watch(isOverlaid, (v) => {
  lockBody.value = v;
});

onKeyStroke("Escape", (e) => {
  if (isOverlaid.value && !useKeyedModals().value) {
    useCloseOverlay();
  }
});

const showModal = ref(false);
const { show: showPopup, hide: hidePopup } = useModal("popup", false);

onMounted(() => {
  setTimeout(() => {
    showPopup();
  }, 1000);
});

watch(showModal, (v) => {
  if (v) {
    hidePopup();
  }
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage :page-key="defaultKey" />
    <NuxtPage
      name="overlay"
      :page-key="route.path"
      v-if="isOverlaid"
      :transition="{ name: 'overlay' }"
      :class="{ overlay: true }"
    />
  </NuxtLayout>

  <NuxtLoadingIndicator />
</template>
