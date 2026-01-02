export const useModal = (
  key?: string,
  initialValue: boolean = false,
  options: { locking?: boolean } = {},
) => {
  const shown: Ref<boolean> = key
    ? useState(`modal-${key}`, () => initialValue)
    : ref(initialValue);

  const content = ref();
  const dialog = ref();
  const firstFocusableElement: Ref<HTMLElement | null> = ref(null);
  const lastFocusableElement: Ref<HTMLElement | null> = ref(null);

  function show() {
    shown.value = true;
  }
  function hide() {
    shown.value = false;
  }
  function toggle() {
    shown.value = !shown.value;
  }

  function goFirst() {
    firstFocusableElement.value?.focus();
  }
  function goLast() {
    lastFocusableElement.value?.focus();
  }

  watch(shown, (v) => {
    if (v) {
      if (options.locking) {
        const focusableElements =
          content.value?.querySelectorAll('[tabindex]:not([tabindex="-1"])') || [];
        firstFocusableElement.value = focusableElements[0];
        lastFocusableElement.value = focusableElements[focusableElements.length - 1];

        dialog.value?.open();
      }
    } else {
      dialog.value?.close();
    }
  });

  return { shown, content, dialog, show, hide, toggle, goFirst, goLast };
};
